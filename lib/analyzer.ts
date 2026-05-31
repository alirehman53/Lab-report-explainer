import {
  AnalyzedResult,
  AnalyzedQualitativeResult,
  MarkerStatus,
  QualitativeStatus,
  ParsedValue,
  ParsedQualitativeValue,
  Pattern,
  ReportAnalysis,
  RangeSet,
  PatientContext,
} from '@/types/lab'
import { LAB_MARKERS } from '@/data/markers'
import { QUALITATIVE_MARKERS } from '@/data/qualitative-markers'
import { INTERPRETATIONS } from '@/data/interpretations'
import { detectPatterns } from '@/data/patterns'
import { buildDoctorQuestions } from '@/data/questions'
import { normalizeValue } from '@/lib/parser'
import { resolveRange } from '@/lib/age-resolver'
import { computeDerivedMarkers } from '@/lib/calculator'
import { validateLabValue } from '@/lib/validator'

function getRange(markerId: string, context: PatientContext): RangeSet | null {
  const marker = LAB_MARKERS[markerId]
  if (!marker) return null

  return resolveRange(marker, context)
}

/**
 * Markers that the body regulates within a narrow physiological band, where a
 * value an order of magnitude above normal is biologically impossible (it would
 * be incompatible with life or simply cannot occur). For ONLY these markers we
 * may safely repair a dropped decimal point from OCR.
 *
 * Markers NOT in this set (WBC, platelets, glucose, liver enzymes, ferritin,
 * D-dimer, tumor markers, troponin, etc.) can legitimately be many times the
 * upper limit — a high WBC may be leukemia, a high glucose may be a crisis — so
 * we must NEVER auto-rescale those.
 */
const DECIMAL_BOUNDED_MARKERS = new Set<string>([
  'sodium', 'potassium', 'chloride', 'bicarbonate',
  'calcium', 'magnesium', 'phosphorus',
  'albumin', 'total_protein', 'globulin',
  'hemoglobin', 'mchc',
])

/**
 * Attempt to repair a dropped decimal point for a tightly-bounded marker.
 *
 * Only fires when the value is BEYOND the critical-high bound (so it cannot be a
 * real reading) AND dividing by 10 or 100 lands it squarely inside the NORMAL
 * range. A genuine critical value divided by 10/100 falls far BELOW normal, so
 * it will never be "corrected" — this is what makes the repair safe.
 *
 * Returns the corrected value and the factor used, or null if no safe repair
 * applies (in which case the value is left exactly as read).
 */
function repairDroppedDecimal(
  markerId: string,
  value: number,
  range: RangeSet
): { value: number; factor: number } | null {
  if (!DECIMAL_BOUNDED_MARKERS.has(markerId)) return null
  if (value <= range.criticalHigh) return null // plausibly real — never touch

  for (const factor of [10, 100]) {
    const candidate = value / factor
    if (candidate >= range.low && candidate <= range.high) {
      return { value: candidate, factor }
    }
  }
  return null
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

function interpretMarker(parsed: ParsedValue, context: PatientContext): AnalyzedResult | null {
  const marker = LAB_MARKERS[parsed.markerId]
  if (!marker) return null

  const range = getRange(parsed.markerId, context)
  if (!range) return null

  if (typeof parsed.value !== 'number' || isNaN(parsed.value)) return null

  // Read the value, applying legitimate unit-scale conversions (e.g. an
  // absolute WBC count -> ×10³/μL).
  let value = normalizeValue(parsed.value, parsed.unit, parsed.markerId)
  if (isNaN(value)) return null

  // Safe, bounded decimal repair: for tightly-regulated analytes only, fix a
  // value that is biologically impossible but becomes normal when a dropped
  // decimal point is restored (e.g. Calcium "97" -> 9.7, Potassium "430" ->
  // 4.30). Flagged so the user still verifies. See repairDroppedDecimal.
  let autoCorrected = false
  let originalReading = value
  const repair = repairDroppedDecimal(parsed.markerId, value, range)
  if (repair) {
    console.log(`[Analyzer] Repaired likely OCR decimal error for ${parsed.markerId}: ${value} -> ${repair.value}`)
    originalReading = value
    value = repair.value
    autoCorrected = true
  }

  // Validate only as a sanity gate against physically impossible OCR garbage
  // (e.g. a value 10× beyond the critical bound). This never rescales the
  // value; it only flags. Context gives age/sex-correct reference ranges.
  const validation = validateLabValue(parsed.markerId, value, parsed.unit, context)
  if (!validation.isValid && validation.confidence === 0) {
    console.log(`[Analyzer] Skipping physically impossible value for ${parsed.markerId}: ${value}`)
    validation.issues.forEach(issue => console.log(`  - ${issue}`))
    return null
  }
  const status = computeStatus(value, range)
  const interpretation = INTERPRETATIONS[parsed.markerId]
  const explanation =
    interpretation?.[status] ??
    interpretation?.['normal'] ??
    'No interpretation available for this value.'

  // Surface a "verify this value" hint when we auto-corrected a decimal, or
  // when the validator suspects an OCR artifact we could not safely correct.
  const decimalSuggestion = validation.suggestions.find(s => /decimal/i.test(s))
  const flagged = autoCorrected || Boolean(decimalSuggestion)
  const flagReason = autoCorrected
    ? `This looked like a misread decimal point (the report showed ${originalReading}); we read it as ${value} ${marker.unit}. Please confirm against your original report.`
    : decimalSuggestion

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
    resultType:      parsed.resultType || 'numeric',
    isDerived:       parsed.resultType === 'derived',
    ...(flagged ? { flagged: true, flagReason } : {}),
  }
}

function analyzeSingleQualitative(parsed: ParsedQualitativeValue): AnalyzedQualitativeResult | null {
  const marker = QUALITATIVE_MARKERS.find(m => m.id === parsed.markerId)
  if (!marker) return null

  // Get interpretation from qualitative interpretations
  // Note: Will be imported once qualitative-interpretations.ts is created
  const interpretation = getQualitativeInterpretation(parsed.markerId, parsed.status)
  
  // Determine severity based on status and marker type
  let severity: 1 | 2 | 3 = 1
  let clinicalSignificance: 'none' | 'monitor' | 'action-required' | 'urgent' = 'none'

  if (parsed.status === 'positive') {
    // High-risk infections
    if (['hiv_antibody', 'hbsag', 'hcv_antibody'].includes(parsed.markerId)) {
      severity = 3
      clinicalSignificance = 'urgent'
    }
    // Acute infections
    else if (['dengue_ns1', 'dengue_igm', 'typhoid_igm', 'malaria_pf', 'malaria_pv'].includes(parsed.markerId)) {
      severity = 2
      clinicalSignificance = 'action-required'
    }
    // UTI markers
    else if (['urine_nitrites', 'urine_leukocyte_esterase'].includes(parsed.markerId)) {
      severity = 2
      clinicalSignificance = 'action-required'
    }
    // Other positive results
    else {
      severity = 1
      clinicalSignificance = 'monitor'
    }
  } else if (parsed.status === 'borderline') {
    severity = 1
    clinicalSignificance = 'monitor'
  } else if (parsed.status === 'negative') {
    severity = 1
    clinicalSignificance = 'none'
  }

  return {
    markerId: parsed.markerId,
    displayName: marker.displayName,
    fullName: marker.fullName,
    rawValue: parsed.rawValue,
    status: parsed.status,
    explanation: interpretation,
    severity,
    category: marker.category,
    resultType: parsed.resultType,
    titreValue: parsed.titreValue,
    clinicalSignificance,
  }
}

function getQualitativeInterpretation(markerId: string, status: QualitativeStatus): string {
  // Temporary fallback interpretations until qualitative-interpretations.ts is created
  const fallbackInterpretations: Record<string, Partial<Record<QualitativeStatus, string>>> = {
    hbsag: {
      negative: 'HBsAg negative means you are not currently infected with Hepatitis B virus.',
      positive: 'HBsAg positive indicates active Hepatitis B infection. Consult your doctor immediately.',
      borderline: 'Borderline result - repeat testing recommended.',
    },
    dengue_ns1: {
      negative: 'Dengue NS1 negative. If symptoms persist, consider IgM/IgG testing.',
      positive: 'Dengue NS1 positive indicates active dengue infection. Monitor platelet count and seek medical care.',
    },
    urine_nitrites: {
      negative: 'Urine nitrites negative - no bacterial infection detected.',
      positive: 'Urine nitrites positive suggests bacterial urinary tract infection.',
    },
  }

  const markerInterpretations = fallbackInterpretations[markerId]
  if (markerInterpretations?.[status]) {
    return markerInterpretations[status]!
  }

  // Generic fallbacks
  if (status === 'negative') return 'Test result is negative.'
  if (status === 'positive') return 'Test result is positive. Consult your doctor for interpretation.'
  if (status === 'borderline') return 'Test result is borderline. Repeat testing may be needed.'
  if (status === 'trace') return 'Trace amount detected.'
  return 'Test result recorded.'
}

export function analyzeOffline(
  parsedValues: ParsedValue[],
  parsedQualValues: ParsedQualitativeValue[],
  context: PatientContext
): ReportAnalysis {
  // Step 1: Compute derived markers
  const derivedValues = computeDerivedMarkers(parsedValues)
  
  // Step 2: Analyze numeric results (original + derived)
  const allNumericValues = [...parsedValues, ...derivedValues]
  const numericResults: AnalyzedResult[] = []
  const derivedResults: AnalyzedResult[] = []

  for (const pv of allNumericValues) {
    const result = interpretMarker(pv, context)
    if (result) {
      if (result.isDerived) {
        derivedResults.push(result)
      } else {
        numericResults.push(result)
      }
    }
  }

  // Step 3: Analyze qualitative results
  const qualitativeResults: AnalyzedQualitativeResult[] = []
  for (const qv of parsedQualValues) {
    const result = analyzeSingleQualitative(qv)
    if (result) qualitativeResults.push(result)
  }

  // Step 4: Sort results - critical first, then abnormal, then normal
  numericResults.sort((a, b) => {
    const order: Record<MarkerStatus, number> = {
      'critical-low':  0,
      'critical-high': 1,
      'low':           2,
      'high':          3,
      'normal':        4,
    }
    return order[a.status] - order[b.status]
  })

  derivedResults.sort((a, b) => {
    const order: Record<MarkerStatus, number> = {
      'critical-low':  0,
      'critical-high': 1,
      'low':           2,
      'high':          3,
      'normal':        4,
    }
    return order[a.status] - order[b.status]
  })

  // Step 5: Detect patterns across ALL result types
  const patterns: Pattern[] = detectPatterns(
    numericResults,
    derivedResults,
    qualitativeResults,
    parsedQualValues
  )
  
  // Step 6: Generate doctor questions
  const doctorQuestions = buildDoctorQuestions(patterns.map(p => p.id))

  // Step 7: Build summary
  const summary = {
    normal:   numericResults.filter(r => r.status === 'normal').length +
              derivedResults.filter(r => r.status === 'normal').length,
    low:      numericResults.filter(r => r.status === 'low').length +
              derivedResults.filter(r => r.status === 'low').length,
    high:     numericResults.filter(r => r.status === 'high').length +
              derivedResults.filter(r => r.status === 'high').length,
    critical: numericResults.filter(r => r.status === 'critical-low' || r.status === 'critical-high').length +
              derivedResults.filter(r => r.status === 'critical-low' || r.status === 'critical-high').length,
    positive:   qualitativeResults.filter(r => r.status === 'positive').length,
    negative:   qualitativeResults.filter(r => r.status === 'negative').length,
    borderline: qualitativeResults.filter(r => r.status === 'borderline').length,
  }

  return {
    results: numericResults,
    qualitativeResults,
    derivedResults,
    detectedPatterns: patterns,
    doctorQuestions,
    summary,
    source: 'offline',
    patientContext: context,
  }
}
