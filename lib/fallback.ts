import { PatientContext, ReportAnalysis } from '@/types/lab'
import { parseLabText } from '@/lib/parser'
import { parseQualitativeText } from '@/lib/qualitative-parser'
import { analyzeOffline } from '@/lib/analyzer'
import { callLLM } from '@/lib/llm'
import { buildLabPrompt } from '@/lib/prompts'

interface AIEnrichment {
  enrichedExplanations: Record<string, string>
  patternSummary: string
  additionalQuestions: string[]
}

function mergeAIWithOffline(
  offline: ReportAnalysis,
  enrichment: AIEnrichment
): ReportAnalysis {
  // Enrich numeric results
  const results = offline.results.map(r => {
    const improved = enrichment.enrichedExplanations?.[r.markerId]
    return improved ? { ...r, explanation: improved } : r
  })

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

export async function analyzeReport(
  rawText: string,
  context: PatientContext
): Promise<ReportAnalysis> {

  // Step 1 — Parse text into structured values (numeric and qualitative)
  const parsedValues = parseLabText(rawText)
  const parsedQualValues = parseQualitativeText(rawText)

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

  // Nothing usable → treat as no enrichment.
  if (Object.keys(enrichedExplanations).length === 0 && additionalQuestions.length === 0 && !patternSummary) {
    return null
  }

  return { enrichedExplanations, patternSummary, additionalQuestions }
}
