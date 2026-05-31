/**
 * Validation and confidence scoring for extracted lab values.
 *
 * SINGLE SOURCE OF TRUTH: this validator derives every reference range from the
 * canonical marker definitions in `data/markers.ts` (via `resolveRange`). It no
 * longer keeps its own parallel range table, which previously drifted out of
 * sync with the app (e.g. WBC/platelets in absolute counts) and silently
 * dropped valid results. Because ranges come from the marker data, the
 * validator automatically covers EVERY numeric marker the app knows about,
 * including age- and sex-specific ranges, with zero per-marker upkeep here.
 *
 * SAFETY PHILOSOPHY (medical): the validator FLAGS, it does not fabricate. It
 * never rescales a value. It assigns confidence 0 (which the analyzer treats as
 * "drop") ONLY for values that are physically impossible — an order of
 * magnitude beyond the critical bound — which indicates OCR garbage rather than
 * a real (even critical) reading. Genuine critical values are kept and shown.
 */

import { LAB_MARKERS } from '@/data/markers'
import { resolveRange } from '@/lib/age-resolver'
import { LabMarker, PatientContext, RangeSet } from '@/types/lab'

export interface ValidationResult {
  isValid: boolean
  confidence: number
  issues: string[]
  suggestions: string[]
}

export interface ValidatedValue {
  markerId: string
  value: number
  unit: string
  confidence: number
  isValid: boolean
  validationIssues?: string[]
}

/**
 * Unit conversion factors to standardize values into each marker's canonical
 * unit. Keyed by the canonical marker id (matching `data/markers.ts`).
 */
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  glucose_fasting: {
    'mg/dL': 1,
    'mmol/L': 18.02, // mmol/L -> mg/dL
  },
  glucose_random: {
    'mg/dL': 1,
    'mmol/L': 18.02,
  },
  cholesterol_total: {
    'mg/dL': 1,
    'mmol/L': 38.67,
  },
  hdl: {
    'mg/dL': 1,
    'mmol/L': 38.67,
  },
  ldl: {
    'mg/dL': 1,
    'mmol/L': 38.67,
  },
  triglycerides: {
    'mg/dL': 1,
    'mmol/L': 88.57,
  },
  creatinine: {
    'mg/dL': 1,
    'μmol/L': 0.0113, // μmol/L -> mg/dL
    'umol/L': 0.0113,
  },
  hemoglobin: {
    'g/dL': 1,
    'g/L': 0.1, // g/L -> g/dL
  },
}

/**
 * Resolve a usable reference range for a marker. Prefers the context-correct
 * (age/sex) range, then falls back to any defined range so a sanity check is
 * still possible even when sex is unknown.
 */
function getUsableRange(marker: LabMarker, context?: PatientContext): RangeSet | null {
  return (
    resolveRange(marker, context ?? { gender: 'unknown' }) ??
    marker.ranges?.universal ??
    marker.ranges?.male ??
    marker.ranges?.female ??
    null
  )
}

/**
 * Validate a single lab value against the canonical range for its marker.
 */
export function validateLabValue(
  markerId: string,
  value: number,
  unit?: string,
  context?: PatientContext
): ValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []

  const marker = LAB_MARKERS[markerId]
  if (!marker) {
    return { isValid: false, confidence: 0, issues: [`Unknown marker: ${markerId}`], suggestions }
  }

  if (!Number.isFinite(value) || value <= 0) {
    return { isValid: false, confidence: 0, issues: ['Non-positive or non-finite value'], suggestions }
  }

  const range = getUsableRange(marker, context)
  if (!range) {
    // Derived/qualitative/uncommon markers without a numeric range: we can't
    // range-check, so we accept the value rather than penalize it.
    return { isValid: true, confidence: 90, issues, suggestions }
  }

  const { low, high, criticalLow, criticalHigh } = range
  let confidence = 100

  // Physically impossible HIGH value — a missing decimal turns "4.3" into "43"
  // or "430", i.e. an order of magnitude (or two) too large. Beyond 10× the
  // critical-high bound, the value cannot be a real reading: treat as OCR
  // garbage (confidence 0 → analyzer drops it). We deliberately do NOT apply
  // an equivalent low-side rule: genuinely low values (suppressed TSH, low
  // platelets, etc.) are real and must never be dropped.
  if (value > criticalHigh * 10) {
    issues.push(`Value ${value} ${marker.unit} is impossibly high (>10× critical), likely an OCR error`)
    suggestions.push('This value looks like a missing decimal point — please verify against the report')
    return { isValid: false, confidence: 0, issues, suggestions }
  }

  // Beyond critical bounds but plausible → keep, but lower confidence and, on
  // the high side, hint at a possible missing decimal so the user double-checks.
  if (value > criticalHigh) {
    confidence = 60
    if (value > high * 3) {
      suggestions.push('Value may be missing a decimal point — please verify against the report')
    }
  } else if (value < criticalLow) {
    confidence = 65
  } else if (value > high || value < low) {
    // Abnormal but within survivable/critical bounds.
    confidence = 85
  }

  // Unit note (informational only — units vary widely between labs, e.g. "mg%"
  // vs "mg/dL", "×10⁹/L" vs "×10³/μL"; we never penalize confidence for this).
  if (unit && marker.unit && normalizeUnitLabel(unit) !== normalizeUnitLabel(marker.unit)) {
    suggestions.push(`Reported unit "${unit}" differs from expected "${marker.unit}" — verify scale`)
  }

  return {
    isValid: confidence >= 50,
    confidence: Math.max(0, Math.min(100, confidence)),
    issues,
    suggestions,
  }
}

function normalizeUnitLabel(u: string): string {
  return u.toLowerCase().replace(/\s+/g, '').replace(/µ/g, 'μ')
}

/**
 * Convert a value into the marker's canonical unit when a known conversion
 * applies. Never alters the value otherwise.
 */
export function standardizeValue(
  markerId: string,
  value: number,
  unit?: string
): { value: number; unit: string } {
  const marker = LAB_MARKERS[markerId]
  if (!marker) return { value, unit: unit || '' }

  const targetUnit = marker.unit
  const conversions = UNIT_CONVERSIONS[markerId]

  if (unit && conversions && unit in conversions && unit !== targetUnit) {
    return { value: value * conversions[unit], unit: targetUnit }
  }

  return { value, unit: unit || targetUnit }
}

/**
 * Validate a set of lab values and surface report-level confidence + issues.
 * Useful for diagnostics/telemetry; the analyzer uses validateLabValue directly.
 */
export function validateLabReport(
  values: Array<{ markerId: string; value: number; unit?: string }>,
  context?: PatientContext
): {
  validValues: ValidatedValue[]
  invalidValues: ValidatedValue[]
  reportConfidence: number
  issues: string[]
} {
  const validValues: ValidatedValue[] = []
  const invalidValues: ValidatedValue[] = []
  const allIssues: string[] = []
  let totalConfidence = 0

  for (const item of values) {
    const standardized = standardizeValue(item.markerId, item.value, item.unit)
    const validation = validateLabValue(item.markerId, standardized.value, standardized.unit, context)

    const validated: ValidatedValue = {
      markerId: item.markerId,
      value: standardized.value,
      unit: standardized.unit,
      confidence: validation.confidence,
      isValid: validation.isValid,
      validationIssues: validation.issues.length > 0 ? validation.issues : undefined,
    }

    ;(validation.isValid ? validValues : invalidValues).push(validated)
    totalConfidence += validation.confidence
    allIssues.push(...validation.issues)
  }

  const reportConfidence = values.length > 0 ? Math.round(totalConfidence / values.length) : 0
  return { validValues, invalidValues, reportConfidence, issues: [...new Set(allIssues)] }
}
