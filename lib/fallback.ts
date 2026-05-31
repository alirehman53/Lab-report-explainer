import { ParsedValue, ParsedQualitativeValue, PatientContext, ReportAnalysis } from '@/types/lab'
import { parseLabText } from '@/lib/parser'
import { parseQualitativeText } from '@/lib/qualitative-parser'
import { analyzeOffline } from '@/lib/analyzer'
import { validateLabValue } from '@/lib/validator'
import { callLLM } from '@/lib/llm'
import { buildLabPrompt } from '@/lib/prompts'

interface AIFinding {
  name: string
  result?: string
  finding: string
}

interface AIEnrichment {
  enrichedExplanations: Record<string, string>
  patternSummary: string
  additionalQuestions: string[]
  additionalFindings: AIFinding[]
}

function mergeAIWithOffline(
  offline: ReportAnalysis,
  enrichment: AIEnrichment
): ReportAnalysis {
  // Enrich numeric results
  const enrichedResults = offline.results.map(r => {
    const improved = enrichment.enrichedExplanations?.[r.markerId]
    return improved ? { ...r, explanation: improved } : r
  })

  // Append AI-interpreted findings for tests NOT in the offline database. These
  // render in the "Other findings" section and are clearly AI-sourced. The AI
  // supplies only the name/result text and an explanation — it never produces a
  // numeric value, range, or status, so it cannot corrupt a known marker.
  const aiFindings = (enrichment.additionalFindings || [])
    .filter(f => f && f.name && f.finding)
    .map((f, i) => ({
      kind: 'finding',
      markerId: `ai-finding-${i}`,
      displayName: f.result ? `${f.name}: ${f.result}` : f.name,
      fullName: f.name,
      findingText: f.finding,
      explanation: f.finding,
      severity: 1,
      category: 'other',
      aiGenerated: true,
    }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = [...enrichedResults, ...(aiFindings as any[])]

  // Enrich qualitative results
  const qualitativeResults = offline.qualitativeResults.map(r => {
    const improved = enrichment.enrichedExplanations?.[r.markerId]
    return improved ? { ...r, explanation: improved } : r
  })

  // Enrich derived results
  const derivedResults = offline.derivedResults.map(r => {
    const improved = enrichment.enrichedExplanations?.[r.markerId]
    return improved ? { ...r, explanation: improved } : r
  })

  const doctorQuestions = [
    ...offline.doctorQuestions,
    ...(enrichment.additionalQuestions || []),
  ]

  return {
    ...offline,
    results,
    qualitativeResults,
    derivedResults,
    doctorQuestions,
    source: 'hybrid',
  }
}

/**
 * Reconcile numeric readings from multiple OCR passes. When two passes disagree
 * on a marker's value (e.g. an upscaled pass reads RBC "9.2" while the native
 * pass reads "5.2"), we keep the reading with the highest validation confidence
 * — i.e. the one that is medically plausible for that marker. This is what lets
 * the app stay correct when one OCR pass mangles a digit.
 */
function reconcileNumeric(valueSets: ParsedValue[][], context: PatientContext): ParsedValue[] {
  const byMarker = new Map<string, ParsedValue[]>()
  for (const set of valueSets) {
    for (const v of set) {
      const list = byMarker.get(v.markerId) ?? []
      list.push(v)
      byMarker.set(v.markerId, list)
    }
  }

  const reconciled: ParsedValue[] = []
  for (const [markerId, candidates] of byMarker) {
    if (candidates.length === 1) { reconciled.push(candidates[0]); continue }
    let best = candidates[0]
    let bestConf = -1
    for (const c of candidates) {
      const conf = validateLabValue(markerId, c.value, c.unit, context).confidence
      if (conf > bestConf) { bestConf = conf; best = c }
    }
    if (candidates.some(c => c.value !== best.value)) {
      console.log(`[fallback] Reconciled ${markerId}: chose ${best.value} from candidates [${candidates.map(c => c.value).join(', ')}]`)
    }
    reconciled.push(best)
  }
  return reconciled
}

function reconcileQualitative(sets: ParsedQualitativeValue[][]): ParsedQualitativeValue[] {
  const byMarker = new Map<string, ParsedQualitativeValue>()
  for (const set of sets) {
    for (const v of set) {
      if (!byMarker.has(v.markerId)) byMarker.set(v.markerId, v)
    }
  }
  return Array.from(byMarker.values())
}

export async function analyzeReport(
  rawInput: string | string[],
  context: PatientContext
): Promise<ReportAnalysis> {

  // Accept one text (pasted/typed) or several (multiple OCR passes to reconcile).
  const texts = (Array.isArray(rawInput) ? rawInput : [rawInput]).filter(t => t && t.trim().length > 0)
  const rawText = texts[0] ?? ''

  // Step 1 — Parse each text, then reconcile to the most plausible values.
  const parsedValues = reconcileNumeric(texts.map(t => parseLabText(t)), context)
  const parsedQualValues = reconcileQualitative(texts.map(t => parseQualitativeText(t)))

  if (parsedValues.length === 0 && parsedQualValues.length === 0) {
    return {
      results: [],
      qualitativeResults: [],
      derivedResults: [],
      detectedPatterns: [],
      doctorQuestions: [],
      summary: {
        normal: 0,
        low: 0,
        high: 0,
        critical: 0,
        positive: 0,
        negative: 0,
        borderline: 0,
      },
      source: 'offline',
      patientContext: context,
    }
  }

  // Step 2 — Always run offline engine (fast, zero cost, zero dependency)
  const offlineResult = analyzeOffline(parsedValues, parsedQualValues, context)

  // Step 3 — Try AI enrichment (best effort — fails silently)
  const apiKey = process.env.HF_TOKEN
  if (!apiKey) {
    console.warn('[fallback] HF_TOKEN not set — using offline result only')
    return offlineResult
  }

  try {
    const prompt = buildLabPrompt(rawText, offlineResult)
    const { reply, error } = await callLLM(prompt, apiKey, 2048)

    if (error || !reply) {
      console.warn('[fallback] AI call failed, returning offline result:', error)
      return offlineResult
    }

    const enrichment = extractEnrichment(reply)
    if (!enrichment) {
      console.warn('[fallback] Could not parse AI response as enrichment JSON, returning offline result')
      return offlineResult
    }

    return mergeAIWithOffline(offlineResult, enrichment)

  } catch (err) {
    console.error('[fallback] AI enrichment failed, returning offline result:', err)
    return offlineResult
  }
}

/**
 * Robustly extract the enrichment object from a model reply.
 *
 * Models often wrap JSON in prose or markdown fences, which made a naive
 * JSON.parse() throw and silently drop the AI result. We strip fences and then
 * parse the first balanced { ... } block. Returns null if nothing usable is
 * found — the caller then keeps the (already correct) offline result.
 *
 * IMPORTANT: the AI only ever supplies EXPLANATION TEXT and extra questions.
 * It never supplies values, ranges, or statuses — those come exclusively from
 * the deterministic offline engine — so the AI cannot make a number wrong.
 */
function extractEnrichment(reply: string): AIEnrichment | null {
  const stripped = reply.replace(/```json|```/gi, '').trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(stripped.slice(start, end + 1))
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null

  const obj = parsed as Record<string, unknown>
  // Coerce defensively — accept whatever valid fields are present, ignore the rest.
  const enrichedExplanations: Record<string, string> = {}
  if (obj.enrichedExplanations && typeof obj.enrichedExplanations === 'object') {
    for (const [k, v] of Object.entries(obj.enrichedExplanations as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) enrichedExplanations[k] = v.trim()
    }
  }
  const additionalQuestions = Array.isArray(obj.additionalQuestions)
    ? (obj.additionalQuestions as unknown[]).filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    : []
  const patternSummary = typeof obj.patternSummary === 'string' ? obj.patternSummary : ''

  const additionalFindings: AIFinding[] = Array.isArray(obj.additionalFindings)
    ? (obj.additionalFindings as unknown[])
        .map(f => (f && typeof f === 'object' ? (f as Record<string, unknown>) : null))
        .filter((f): f is Record<string, unknown> => !!f && typeof f.name === 'string' && typeof f.finding === 'string')
        .map(f => ({
          name: String(f.name).trim(),
          result: typeof f.result === 'string' ? f.result.trim() : undefined,
          finding: String(f.finding).trim(),
        }))
        .filter(f => f.name && f.finding)
    : []

  // Nothing usable → treat as no enrichment.
  if (
    Object.keys(enrichedExplanations).length === 0 &&
    additionalQuestions.length === 0 &&
    additionalFindings.length === 0 &&
    !patternSummary
  ) {
    return null
  }

  return { enrichedExplanations, patternSummary, additionalQuestions, additionalFindings }
}
