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

    // Strip any accidental markdown fences
    const cleaned = reply.replace(/```json|```/gi, '').trim()
    const enrichment: AIEnrichment = JSON.parse(cleaned)

    return mergeAIWithOffline(offlineResult, enrichment)

  } catch (err) {
    console.error('[fallback] AI enrichment failed, returning offline result:', err)
    return offlineResult
  }
}
