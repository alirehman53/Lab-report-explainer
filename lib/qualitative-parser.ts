import { ParsedQualitativeValue, QualitativeStatus } from '@/types/lab'
import { QUALITATIVE_MARKERS } from '@/data/qualitative-markers'

// Lowercase and reduce any run of non-alphanumeric characters (hyphens, dots,
// slashes, extra spaces) to a single space, so "Non-reactive", "non reactive"
// and "nonreactive" all compare equal.
function canonical(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Build alias map for fast lookup during parsing
const QUALITATIVE_MARKER_ALIAS_MAP = new Map<string, string>()
for (const marker of QUALITATIVE_MARKERS) {
  for (const name of marker.names) {
    QUALITATIVE_MARKER_ALIAS_MAP.set(name.toLowerCase(), marker.id)
  }
}

// Aliases sorted longest-first, with word-boundary regexes, for the fuzzy pass
// (so the most specific marker name on a line wins, and short aliases like "mp"
// only match as a standalone word, never inside another word).
const SORTED_QUAL_ALIASES: Array<{ alias: string; id: string; re: RegExp }> = []
for (const marker of QUALITATIVE_MARKERS) {
  for (const name of marker.names) {
    const alias = name.toLowerCase()
    SORTED_QUAL_ALIASES.push({
      alias,
      id: marker.id,
      re: new RegExp(`(?:^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^a-z0-9])`, 'i'),
    })
  }
}
SORTED_QUAL_ALIASES.sort((a, b) => b.alias.length - a.alias.length)

// Order matters: borderline/trace are most specific; negative is checked BEFORE
// positive so "non-reactive"/"not detected" aren't mis-caught by the substrings
// "reactive"/"detected".
const STATUS_KEYWORDS: Array<{ status: QualitativeStatus; words: string[] }> = [
  { status: 'borderline', words: ['equivocal', 'indeterminate', 'borderline', 'weakly reactive', 'grey zone'] },
  { status: 'trace', words: ['trace'] },
  { status: 'negative', words: ['non-reactive', 'nonreactive', 'non reactive', 'not detected', 'negative', 'absent', 'not seen', 'no growth', 'nil'] },
  { status: 'positive', words: ['reactive', 'positive', 'detected', 'present', 'seen', 'isolated', 'grown'] },
]

/**
 * Fuzzy fallback: find the most specific qualitative marker named ANYWHERE on
 * the line, then read a status keyword from the line. Requires BOTH a marker
 * and a status word, so it won't fire on incidental mentions. This catches real
 * report formats the strict parser misses, e.g. "MP ICT . Negative" or
 * "ICT Malarial parasites (falciparum / vivax) was negative".
 */
function parseLineFuzzy(line: string): ParsedQualitativeValue | null {
  const lower = line.toLowerCase()

  let markerId: string | null = null
  let aliasLen = 0
  for (const { id, alias, re } of SORTED_QUAL_ALIASES) {
    if (re.test(line)) { markerId = id; aliasLen = alias.length; break } // longest-first → first hit is best
  }
  if (!markerId) return null
  void aliasLen

  // "non-reactive"/"not detected" must beat "reactive"/"detected", so negative
  // and borderline are checked before positive (order in STATUS_KEYWORDS).
  for (const { status, words } of STATUS_KEYWORDS) {
    if (words.some(w => lower.includes(w))) {
      return { markerId, rawName: line.trim(), status, rawValue: line.trim(), resultType: 'qualitative' }
    }
  }
  return null
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
  const seen = new Set<string>()
  const lines = raw.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 3) continue

    // Strict pass (name : value), then a fuzzy pass that finds the marker and a
    // status keyword anywhere on the line (covers free-text report phrasing).
    const parsed = parseLine(trimmed) ?? parseLineFuzzy(trimmed)
    if (parsed && !seen.has(parsed.markerId)) {
      seen.add(parsed.markerId)
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

  // Normalize value AND aliases the same way (lowercase, punctuation/hyphens ->
  // spaces). This is essential: the report value "Non-reactive" can arrive here
  // as "non reactive" (the '-' was treated as a separator), so a hyphenated
  // alias like "non-reactive" must be compared on equal footing — otherwise a
  // negative result slips through to the positive check.
  const normalizedValue = canonical(potentialValue)
  const matchesAny = (aliases: string[]) =>
    aliases.some(a => {
      const c = canonical(a)
      return c.length > 0 && normalizedValue.includes(c)
    })

  // Check trace aliases first (most specific)
  if (matchesAny(marker.traceAliases)) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'trace',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Check borderline aliases
  if (matchesAny(marker.borderlineAliases)) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'borderline',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Check NEGATIVE aliases BEFORE positive. This is critical: "non-reactive"
  // and "not detected" contain the substrings "reactive"/"detected", so if
  // positive were checked first a negative result would be misread as POSITIVE
  // — e.g. reporting Hepatitis C as present when it is absent.
  if (matchesAny(marker.negativeAliases)) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'negative',
      rawValue: potentialValue,
      resultType: 'qualitative'
    }
  }

  // Check positive aliases
  if (matchesAny(marker.positiveAliases)) {
    return {
      markerId: marker.id,
      rawName: parts[0].trim(),
      status: 'positive',
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
