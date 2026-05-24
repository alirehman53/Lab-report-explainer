import { ParsedQualitativeValue, QualitativeStatus } from '@/types/lab'
import { QUALITATIVE_MARKERS } from '@/data/qualitative-markers'

// Build alias map for fast lookup during parsing
const QUALITATIVE_MARKER_ALIAS_MAP = new Map<string, string>()
for (const marker of QUALITATIVE_MARKERS) {
  for (const name of marker.names) {
    QUALITATIVE_MARKER_ALIAS_MAP.set(name.toLowerCase(), marker.id)
  }
}

/**
 * Parse qualitative results from raw lab report text.
 * 
 * Recognizes patterns like:
 * - "HBsAg: Reactive"
 * - "HIV 1/2 Ab - Non Reactive"
 * - "Dengue NS1 Antigen = Positive"
 * - "Widal S.typhi O 1:160"
 * - "Protein: 2+"
 * - "Nitrites: Negative"
 */
export function parseQualitativeText(raw: string): ParsedQualitativeValue[] {
  const results: ParsedQualitativeValue[] = []
  const lines = raw.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 3) continue

    // Try to parse this line as a qualitative result
    const parsed = parseLine(trimmed)
    if (parsed) {
      results.push(parsed)
    }
  }

  return results
}

function parseLine(line: string): ParsedQualitativeValue | null {
  // Common separators: colon, dash, equals, tab, multiple spaces
  const separatorRegex = /\s*[:=\-\t]\s*|\s{2,}/
  
  // Split on separator
  const parts = line.split(separatorRegex)
  if (parts.length < 2) return null

  const potentialMarkerName = parts[0].trim().toLowerCase()
  const potentialValue = parts.slice(1).join(' ').trim()

  if (!potentialValue) return null

  // Try to find marker by alias
  const markerId = QUALITATIVE_MARKER_ALIAS_MAP.get(potentialMarkerName)
  if (!markerId) return null

  const marker = QUALITATIVE_MARKERS.find(m => m.id === markerId)
  if (!marker) return null

  // Check if this is a titre value
  if (marker.resultType === 'titre') {
    const titreMatch = potentialValue.match(/1:(\d+)/i)
    if (titreMatch) {
      const titreValue = parseInt(titreMatch[1], 10)
      const threshold = marker.titreThreshold || 0
      
      // Determine status based on titre threshold
      let status: QualitativeStatus
      if (titreValue >= threshold) {
        status = 'positive'
      } else if (titreValue >= threshold / 2) {
        status = 'borderline'
      } else {
        status = 'negative'
      }

      return {
        markerId: marker.id,
        rawName: parts[0].trim(),
        status,
        rawValue: potentialValue,
        titreValue,
        resultType: 'titre'
      }
    }
  }

  // Check for dipstick notation (1+, 2+, 3+, trace)
  const dipstickMatch = potentialValue.match(/^(\d)\+$/i)
  if (dipstickMatch) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'positive',  // Any + is positive
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Normalize value for comparison
  const normalizedValue = potentialValue.toLowerCase()

  // Check trace aliases first (most specific)
  if (marker.traceAliases.some(alias => normalizedValue.includes(alias.toLowerCase()))) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'trace',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Check borderline aliases
  if (marker.borderlineAliases.some(alias => normalizedValue.includes(alias.toLowerCase()))) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'borderline',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Check positive aliases
  if (marker.positiveAliases.some(alias => normalizedValue.includes(alias.toLowerCase()))) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'positive',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Check negative aliases
  if (marker.negativeAliases.some(alias => normalizedValue.includes(alias.toLowerCase()))) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'negative',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // For blood group markers (ABO, Rh), treat the value as informational
  if (marker.id === 'abo_blood_group' || marker.id === 'rh_factor') {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'info',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Couldn't classify - skip this line
  return null
}

/**
 * Helper function to check if a qualitative result is positive
 */
export function isPositive(markerId: string, qualResults: ParsedQualitativeValue[]): boolean {
  const result = qualResults.find(r => r.markerId === markerId)
  return result?.status === 'positive'
}

/**
 * Helper function to check if a qualitative result is negative
 */
export function isNegative(markerId: string, qualResults: ParsedQualitativeValue[]): boolean {
  const result = qualResults.find(r => r.markerId === markerId)
  return result?.status === 'negative'
}

/**
 * Helper function to check if a qualitative result is borderline
 */
export function isBorderline(markerId: string, qualResults: ParsedQualitativeValue[]): boolean {
  const result = qualResults.find(r => r.markerId === markerId)
  return result?.status === 'borderline'
}

/**
 * Helper function to check if a titre result is above a threshold
 */
export function hasTitreAbove(
  markerId: string,
  threshold: number,
  qualResults: ParsedQualitativeValue[]
): boolean {
  const result = qualResults.find(r => r.markerId === markerId)
  if (!result || !result.titreValue) return false
  return result.titreValue >= threshold
}

/**
 * Helper function to check if a qualitative marker exists in results
 */
export function hasQualMarker(markerId: string, qualResults: ParsedQualitativeValue[]): boolean {
  return qualResults.some(r => r.markerId === markerId)
}
