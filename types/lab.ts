export type MarkerStatus =
  | 'normal'
  | 'low'
  | 'high'
  | 'critical-low'
  | 'critical-high'

export type QualitativeStatus =
  | 'negative'       // non-reactive, not detected, absent
  | 'positive'       // reactive, detected, present
  | 'borderline'     // equivocal, indeterminate, weakly reactive
  | 'trace'          // trace amounts detected
  | 'info'           // informational only (blood group, Rh factor)

export type MarkerCategory =
  | 'cbc'
  | 'iron'
  | 'liver'
  | 'thyroid'
  | 'kidney'
  | 'lipid'
  | 'diabetes'
  | 'electrolytes'
  | 'cardiac'
  | 'hormones-female'
  | 'hormones-male'
  | 'hormones-adrenal'
  | 'coagulation'
  | 'tumor-markers'
  | 'infectious-serology'
  | 'autoimmune'
  | 'urinalysis-numeric'
  | 'urinalysis-qualitative'
  | 'bone-minerals'
  | 'vitamins-nutrition'
  | 'allergy-immunology'
  | 'drug-monitoring'
  | 'cardiac-markers'
  | 'stool'
  | 'csf'
  | 'derived'        // calculated markers (HOMA-IR, LDL-Friedewald, etc.)
  | 'imaging'
  | 'microbiology'
  | 'other'

export type ResultType = 'numeric' | 'qualitative' | 'titre' | 'ratio' | 'derived'

export interface PatientContext {
  gender: 'male' | 'female' | 'unknown'
  age?: number      // in years; undefined = adult assumed
}

export interface RangeSet {
  low: number
  high: number
  criticalLow: number
  criticalHigh: number
}

export interface AgeAdjustedRange {
  ageMin: number     // inclusive
  ageMax: number     // inclusive
  ranges: {
    male?: RangeSet
    female?: RangeSet
    universal?: RangeSet
  }
}

export interface LabMarker {
  id: string
  names: string[]           // all aliases for parser matching
  displayName: string
  fullName: string
  unit: string
  category: MarkerCategory
  resultType: ResultType
  ranges?: {
    male?: RangeSet
    female?: RangeSet
    universal?: RangeSet
  }
  ageRanges?: AgeAdjustedRange[]   // overrides ranges when age is provided
  derivedFrom?: string[]           // marker IDs needed to calculate this
  formula?: string                 // human-readable formula for documentation
}

export interface QualitativeMarker {
  id: string
  names: string[]
  displayName: string
  fullName: string
  category: MarkerCategory
  resultType: 'qualitative' | 'titre'
  // For qualitative: what strings map to which status
  positiveAliases: string[]   // 'reactive', 'positive', 'detected', etc.
  negativeAliases: string[]   // 'non-reactive', 'negative', 'not detected', etc.
  borderlineAliases: string[] // 'equivocal', 'indeterminate', 'weakly reactive'
  traceAliases: string[]      // 'trace', 'trace amounts'
  // For titre: threshold above which result is clinically significant
  titreThreshold?: number     // e.g. 1:80 for Widal = significant at 80
}

export interface ParsedValue {
  markerId: string
  rawName: string
  value: number
  unit?: string
  resultType: 'numeric' | 'derived'
}

export interface ParsedQualitativeValue {
  markerId: string
  rawName: string
  status: QualitativeStatus
  rawValue: string          // exactly what was on the report
  titreValue?: number       // for Widal/ASO titre results
  resultType: 'qualitative' | 'titre'
}

export interface AnalyzedResult {
  markerId: string
  displayName: string
  fullName: string
  value: number
  unit: string
  status: MarkerStatus
  normalRange: string
  percentPosition: number   // 0–100 for status bar UI
  explanation: string
  severity: 1 | 2 | 3
  category: MarkerCategory
  resultType: 'numeric' | 'derived'
  isDerived?: boolean
  // Set when the value passed validation but looks suspicious (e.g. a likely
  // missing decimal point from OCR). The UI shows a "verify this value" hint so
  // the user double-checks against the original report. The value is never
  // altered — only flagged.
  flagged?: boolean
  flagReason?: string
}

export interface AnalyzedQualitativeResult {
  markerId: string
  displayName: string
  fullName: string
  rawValue: string
  status: QualitativeStatus
  explanation: string
  severity: 1 | 2 | 3
  category: MarkerCategory
  resultType: 'qualitative' | 'titre'
  titreValue?: number
  clinicalSignificance: 'none' | 'monitor' | 'action-required' | 'urgent'
}

export interface ReportAnalysis {
  // Numeric results (existing)
  results: AnalyzedResult[]
  // Qualitative results (new)
  qualitativeResults: AnalyzedQualitativeResult[]
  // Derived/calculated results
  derivedResults: AnalyzedResult[]
  // Pattern detection across ALL result types
  detectedPatterns: Pattern[]
  doctorQuestions: string[]
  summary: {
    normal: number
    low: number
    high: number
    critical: number
    positive: number      // qualitative positives
    negative: number      // qualitative negatives
    borderline: number    // qualitative borderlines
  }
  source: 'ai' | 'offline' | 'hybrid'
  patientContext: PatientContext
}

export interface Pattern {
  id: string
  name: string            // "Iron Deficiency Anemia"
  confidence: 'likely' | 'possible'
  markerIds: string[]     // marker IDs that triggered this
  explanation: string
}