import { ParsedValue } from '@/types/lab'
import { MARKER_ALIAS_MAP } from '@/data/markers'

// Matches patterns like:
//   "Hemoglobin 11.2", "Hb: 11.2", "Hb=11.2", "Hemoglobin: 11.2 g/dL"
//   "HbA1c 6.5%", "TSH 0.45 mIU/L"
const VALUE_PATTERN =
  /([A-Za-z][A-Za-z0-9\s\.\-\/\(\)]*?)\s*[:\-=]?\s*([\d]+\.?[\d]*)\s*(%|g\/dL|mg\/dL|U\/L|mIU\/L|ng\/mL|pg\/mL|ng\/dL|μg\/dL|ug\/dL|mEq\/L|mmol\/L|μmol\/L|umol\/L|fL|fl|×10[³3]\/μL|×10[⁶6]\/μL|mm\/hr|mL\/min\/1\.73m²)?/gi

export function parseLabText(raw: string): ParsedValue[] {
  const parsed: ParsedValue[] = []
  const seen = new Set<string>()

  let match: RegExpExecArray | null
  VALUE_PATTERN.lastIndex = 0

  while ((match = VALUE_PATTERN.exec(raw)) !== null) {
    const rawName = match[1].trim().toLowerCase()
    const value   = parseFloat(match[2])
    const unit    = match[3] ?? undefined

    if (isNaN(value)) continue
    if (value <= 0) continue
    if (rawName.length < 2) continue

    // Try exact match first
    let markerId = MARKER_ALIAS_MAP[rawName]

    // Try partial / fuzzy match — check if any known alias is contained in the raw name
    if (!markerId) {
      for (const [alias, id] of Object.entries(MARKER_ALIAS_MAP)) {
        if (rawName.includes(alias) || alias.includes(rawName)) {
          markerId = id
          break
        }
      }
    }

    if (!markerId) continue
    if (seen.has(markerId)) continue

    seen.add(markerId)
    parsed.push({ markerId, rawName: match[1].trim(), value, unit })
  }

  return parsed
}

// Normalize units where labs report in different scales
export function normalizeValue(value: number, unit: string | undefined, markerId: string): number {
  // Some Pakistani labs report ESR differently, WBC in full count etc.
  // Add per-marker normalization here as needed
  if (!unit) return value

  // Convert ×10³ cells to standard ×10³/μL (some labs write just the integer)
  if (markerId === 'wbc' && value > 100) return value / 1000
  if (markerId === 'platelets' && value > 10000) return value / 1000

  return value
}
