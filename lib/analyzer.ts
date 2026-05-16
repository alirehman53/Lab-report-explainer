import { AnalyzedResult, Gender, MarkerStatus, ParsedValue, Pattern, ReportAnalysis, RangeSet } from '@/types/lab'
import { LAB_MARKERS } from '@/data/markers'
import { INTERPRETATIONS } from '@/data/interpretations'
import { detectPatterns } from '@/data/patterns'
import { buildDoctorQuestions } from '@/data/questions'
import { normalizeValue } from '@/lib/parser'

function getRange(markerId: string, gender: Gender): RangeSet | null {
  const marker = LAB_MARKERS[markerId]
  if (!marker) return null

  if (marker.ranges.universal) return marker.ranges.universal

  const g = gender === 'unknown' ? 'female' : gender
  return marker.ranges[g] ?? null
}

function computeStatus(value: number, range: RangeSet): MarkerStatus {
  if (value <= range.criticalLow)   return 'critical-low'
  if (value >= range.criticalHigh)  return 'critical-high'
  if (value < range.low)            return 'low'
  if (value > range.high)           return 'high'
  return 'normal'
}

function computePercentPosition(value: number, range: RangeSet): number {
  // Maps value to a 0–100 position on the status bar
  // 0 = far left (critically low), 50 = midpoint of normal, 100 = far right (critically high)
  const totalSpan = range.criticalHigh - range.criticalLow
  if (totalSpan === 0) return 50
  const pos = ((value - range.criticalLow) / totalSpan) * 100
  return Math.min(100, Math.max(0, pos))
}

function computeSeverity(status: MarkerStatus): 1 | 2 | 3 {
  if (status === 'critical-low' || status === 'critical-high') return 3
  if (status === 'low' || status === 'high') return 1
  return 1
}

function formatRange(range: RangeSet, unit: string): string {
  return `${range.low} – ${range.high} ${unit}`
}

export function interpretMarker(parsed: ParsedValue, gender: Gender): AnalyzedResult | null {
  const marker = LAB_MARKERS[parsed.markerId]
  if (!marker) return null

  const range = getRange(parsed.markerId, gender)
  if (!range) return null

  const value = normalizeValue(parsed.value, parsed.unit, parsed.markerId)
  const status = computeStatus(value, range)
  const interpretation = INTERPRETATIONS[parsed.markerId]
  const explanation =
    interpretation?.[status] ??
    interpretation?.['normal'] ??
    'No interpretation available for this value.'

  return {
    markerId:        parsed.markerId,
    displayName:     marker.displayName,
    fullName:        marker.fullName,
    value,
    unit:            marker.unit,
    status,
    normalRange:     formatRange(range, marker.unit),
    percentPosition: computePercentPosition(value, range),
    explanation,
    severity:        computeSeverity(status),
    category:        marker.category,
  }
}

export function analyzeOffline(
  parsedValues: ParsedValue[],
  gender: Gender = 'unknown'
): ReportAnalysis {
  const results: AnalyzedResult[] = []

  for (const pv of parsedValues) {
    const result = interpretMarker(pv, gender)
    if (result) results.push(result)
  }

  // Sort: critical first, then abnormal, then normal
  results.sort((a, b) => {
    const order: Record<MarkerStatus, number> = {
      'critical-low':  0,
      'critical-high': 1,
      'low':           2,
      'high':          3,
      'normal':        4,
    }
    return order[a.status] - order[b.status]
  })

  const patterns: Pattern[] = detectPatterns(results)
  const doctorQuestions = buildDoctorQuestions(patterns.map(p => p.id))

  const summary = {
    normal:   results.filter(r => r.status === 'normal').length,
    low:      results.filter(r => r.status === 'low').length,
    high:     results.filter(r => r.status === 'high').length,
    critical: results.filter(r => r.status === 'critical-low' || r.status === 'critical-high').length,
  }

  return {
    results,
    detectedPatterns: patterns,
    doctorQuestions,
    summary,
    source: 'offline',
  }
}
