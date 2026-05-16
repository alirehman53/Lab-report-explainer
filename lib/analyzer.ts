import {
  AnalyzedResult,
  Gender,
  MarkerStatus,
  ParsedValue,
  Pattern,
  ReportAnalysis,
  RangeSet,
  NonNumericResult,
} from '@/types/lab'
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

  if (typeof parsed.value !== 'number' || isNaN(parsed.value)) return null
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

export function interpretFinding(parsed: ParsedValue): NonNumericResult | null {
  if (!parsed.text && !parsed.rawName) return null

  const name = parsed.rawName || parsed.markerId
  const display = name.charAt(0).toUpperCase() + name.slice(1)
  let cat: NonNumericResult['category'] = 'other'
  const id = parsed.markerId

  if (id.includes('urinalysis')) cat = 'urinalysis'
  else if (id.includes('ct') || id.includes('x-ray') || id.includes('xray') || id.includes('radiology') || id.includes('mri') || id.includes('echo')) cat = 'imaging'
  else if (id.includes('culture') || id.includes('microbiology') || id.includes('gram')) cat = 'microbiology'

  // crude severity estimation based on keywords
  const text = (parsed.text || '').toLowerCase()
  let severity: 1 | 2 | 3 = 1
  if (text.match(/(consolidation|infiltrate|mass|opacif|pneumonia|fracture|acute)/)) severity = 3
  else if (text.match(/(mild|moderate|enlargement|cardiomegaly|effusion|suspicious)/)) severity = 2

  return {
    kind: 'finding',
    markerId: parsed.markerId,
    displayName: display,
    fullName: display,
    findingText: parsed.text || '',
    explanation: `Detected ${display}: ${parsed.text || ''}`,
    severity,
    category: cat,
  }
}

export function analyzeOffline(
  parsedValues: ParsedValue[],
  gender: Gender = 'unknown'
): ReportAnalysis {
  const results: Array<AnalyzedResult | NonNumericResult> = []

  for (const pv of parsedValues) {
    if (pv.kind === 'finding') {
      const f = interpretFinding(pv)
      if (f) results.push(f)
      continue
    }

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
    const aStatus = ((a as any).status ?? 'normal') as MarkerStatus
    const bStatus = ((b as any).status ?? 'normal') as MarkerStatus
    return order[aStatus] - order[bStatus]
  })

  // Only run numeric pattern detection on numeric results
  const numericResults = results.filter(r => (r as AnalyzedResult).value !== undefined) as AnalyzedResult[]
  const patterns: Pattern[] = detectPatterns(numericResults)
  const doctorQuestions = buildDoctorQuestions(patterns.map(p => p.id))

  const summary = {
    normal:   numericResults.filter(r => r.status === 'normal').length,
    low:      numericResults.filter(r => r.status === 'low').length,
    high:     numericResults.filter(r => r.status === 'high').length,
    critical: numericResults.filter(r => r.status === 'critical-low' || r.status === 'critical-high').length,
  }

  return {
    results,
    detectedPatterns: patterns,
    doctorQuestions,
    summary,
    source: 'offline',
  }
}
