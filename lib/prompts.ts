import { AnalyzedResult, Pattern, ReportAnalysis } from '@/types/lab'

export function buildLabPrompt(
  rawInput: string,
  offlineResult: ReportAnalysis
): string {
  // Use only numeric results from the offline engine for the LLM prompt
  const numericResults = offlineResult.results.filter(
    (r: any) => (r as any).value !== undefined
  ) as AnalyzedResult[]
  const abnormal = numericResults.filter(r => r.status !== 'normal')
  const patterns = offlineResult.detectedPatterns

  const markerSummary = numericResults
    .map(r => `- ${r.displayName}: ${r.value} ${r.unit || ''} (${r.status || 'unknown'}, normal: ${r.normalRange || '—'})`)
    .join('\n')

  const patternSummary =
    patterns.length > 0
      ? patterns.map(p => `- ${p.name} (${p.confidence})`).join('\n')
      : 'None clearly detected.'

  return `You are a medical education assistant helping patients understand their lab test results in plain, reassuring language. You do NOT provide diagnoses or treatment decisions — you help people understand what their numbers mean and what questions to ask their doctor.

A patient has submitted the following lab report:
---
${rawInput}
---

Our offline engine has already identified these values:
${markerSummary}

Detected patterns:
${patternSummary}

Your job:
1. Review the offline interpretations and IMPROVE or EXPAND the plain-language explanation for any abnormal values (${abnormal.map(r => r.displayName).join(', ') || 'none'}).
2. If any pattern was detected, provide a 2–3 sentence plain-language summary of what this pattern likely means for a patient in Pakistan / South Asia.
3. Suggest up to 2 additional doctor questions beyond the ones already generated, if relevant.
4. Keep language warm, clear, and non-alarmist unless a value is critically abnormal.

Respond ONLY with a valid JSON object in this exact format — no preamble, no markdown fences, no explanation outside the JSON:
{
  "enrichedExplanations": {
    "<markerId>": "<improved explanation string>"
  },
  "patternSummary": "<2-3 sentence plain summary of the overall picture, or empty string if nothing notable>",
  "additionalQuestions": ["<question 1>", "<question 2>"]
}

If there is nothing meaningful to add, return empty objects/arrays. Never fabricate values. Do not reference specific medications by name.`
}
