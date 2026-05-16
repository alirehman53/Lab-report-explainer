export type Gender = 'unknown' | 'female' | 'male'

export type MarkerCategory = 'cbc' | 'liver' | 'thyroid' | 'kidney' | 'lipid' | 'diabetes' | 'iron' | 'electrolytes' | 'cardiac'

export type RangeSet = {
  low: number
  high: number
  criticalLow: number
  criticalHigh: number
}

export type MarkerStatus = 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high'

export interface LabMarker {
  id: string              // e.g. "hemoglobin"
  names: string[]         // ["Hemoglobin", "Hb", "HGB"] — for parsing
  displayName: string
  fullName: string
  unit: string            // "g/dL"
  ranges: {
    male?:   RangeSet
    female?: RangeSet
    universal?: RangeSet
  }
  category: MarkerCategory
}

export interface ParsedValue {
  markerId: string
  rawName: string         // what the user typed
  value: number
  unit?: string
}

export interface AnalyzedResult {
  markerId: string
  displayName: string
  fullName: string
  value: number
  unit: string
  status: MarkerStatus
  normalRange: string     // "12.0 – 16.0 g/dL"
  percentPosition: number // for status bar positioning
  explanation: string     // plain language
  severity: 1 | 2 | 3    // 1=mild, 2=moderate, 3=urgent
  category: MarkerCategory
}

export interface ReportAnalysis {
  results: AnalyzedResult[]
  detectedPatterns: Pattern[]
  doctorQuestions: string[]
  summary: { normal: number; low: number; high: number; critical: number }
  source: 'ai' | 'offline' | 'hybrid'  // tells UI which engine was used
}

export interface Pattern {
  id: string
  name: string            // "Iron Deficiency Anemia"
  confidence: 'likely' | 'possible'
  markerIds: string[]     // marker IDs that triggered this
  explanation: string
}