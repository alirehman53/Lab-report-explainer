import { ParsedValue } from '@/types/lab'
import { MARKER_ALIAS_MAP } from '@/data/markers'
import { extractAllLabValues } from './multiFormatParser'

/**
 * Non-destructive text normalization.
 *
 * IMPORTANT: This function MUST NOT guess, rescale, or delete numeric values.
 * Earlier versions tried to "reconstruct" missing decimals by dividing values
 * by 10/100 based on expected ranges, and deleted values that looked wrong.
 * In a medical context that means silently fabricating or hiding patient data,
 * which is unacceptable. The decimal point is now preserved upstream by the
 * OCR pipeline (image upscaling + tesseract), so the parser only needs to do
 * safe, lossless cleanup here.
 */
function preprocessText(text: string): string {
  let processed = text

  // Normalize decimal commas to decimal points, but ONLY when clearly a
  // decimal separator: "4,30 mg/dL" -> "4.30 mg/dL". We require the comma to be
  // followed by exactly 1-2 digits and then whitespace/unit/end, so we never
  // touch thousands separators like "1,200".
  processed = processed.replace(
    /(\d),(\d{1,2})(?=\s|$|[a-zA-Zµ%])/g,
    '$1.$2'
  )

  return processed
}

// Units we recognize directly after a result value. Order matters (longer
// first) so e.g. "mg/dL" wins over a bare "mg".
const UNIT_PATTERN =
  /^\s*(mg\/dL|mg\/dl|g\/dL|g\/dl|mIU\/L|μIU\/mL|uIU\/mL|ng\/mL|pg\/mL|ng\/dL|μg\/dL|ug\/dL|mEq\/L|mEq\/l|mmol\/L|μmol\/L|umol\/L|U\/L|IU\/L|fL|fl|pg|%|mg%|gm%|mL\/min\/1\.73m²|x10\^?\d+\/?[a-zµμ]*|×10[³⁶36]\/[µμ]L)/i

// Pre-build an alias list sorted by length (longest first). The longest alias
// that matches a row is the most specific marker, which avoids short aliases
// like "k" or "ca" hijacking a row that actually names "Potassium"/"Calcium".
const SORTED_ALIASES: Array<{ alias: string; id: string; re: RegExp }> = Object.entries(MARKER_ALIAS_MAP)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([alias, id]) => ({
    alias,
    id,
    // Word-boundary match so "k" only matches a standalone "K", never "KINETIC".
    // The trailing class also excludes "/" and "%" so a 2-letter alias like "mg"
    // (Magnesium) does NOT match inside the unit "mg/dL" or "mg%".
    re: new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(alias)}(?=$|[^a-z0-9/%])`, 'i'),
  }))

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parse a single row. A lab row is "<Marker name> <Result> <Unit> <Ref range>...".
 * We identify the most specific marker named on the row, then take the FIRST
 * number after the marker name as the result — reference ranges come later in
 * the row, so the first number is the patient's actual value.
 */
function parseLine(line: string): ParsedValue | null {
  if (!/\d/.test(line)) return null // no number on this row

  // Find the most specific marker named on this row.
  let best: { id: string; matchEnd: number; aliasLen: number } | null = null
  for (const { id, alias, re } of SORTED_ALIASES) {
    const m = re.exec(line)
    if (!m) continue
    const matchEnd = m.index + m[0].length
    // Prefer the longest alias; on ties prefer the earliest match position.
    if (
      !best ||
      alias.length > best.aliasLen ||
      (alias.length === best.aliasLen && matchEnd < best.matchEnd)
    ) {
      best = { id, matchEnd, aliasLen: alias.length }
    }
  }
  if (!best) return null

  // First number AFTER the marker name = the result value.
  const rest = line.slice(best.matchEnd)
  const numMatch = /(-?\d+(?:\.\d+)?)/.exec(rest)
  if (!numMatch) return null

  const value = parseFloat(numMatch[1])
  if (isNaN(value) || value <= 0) return null

  // Optional unit immediately after the value.
  const afterNum = rest.slice((numMatch.index ?? 0) + numMatch[1].length)
  const unitMatch = UNIT_PATTERN.exec(afterNum)
  const unit = unitMatch ? unitMatch[1] : undefined

  return {
    markerId: best.id,
    rawName: line.slice(0, best.matchEnd).trim(),
    value: normalizeValue(value, unit, best.id),
    unit,
    resultType: 'numeric',
  }
}

export function parseLabText(raw: string): ParsedValue[] {
  const processedText = preprocessText(raw)

  const parsed: ParsedValue[] = []
  const seen = new Set<string>()

  // Row-aware pass: one marker result per line, first number after the name.
  for (const line of processedText.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed.length < 2) continue
    const result = parseLine(trimmed)
    if (!result) continue
    if (isNaN(result.value)) continue
    if (seen.has(result.markerId)) continue
    seen.add(result.markerId)
    parsed.push(result)
  }

  // Fallback: if the text had no usable line structure (e.g. a single flattened
  // line) we may have found very little — try the multi-format/table parser.
  // Wrapped defensively so a parsing edge case can never crash the whole
  // analysis (e.g. a qualitative-only malaria report).
  if (parsed.length < 3) {
    let multiFormatResults: ReturnType<typeof extractAllLabValues> = []
    try {
      multiFormatResults = extractAllLabValues(processedText)
    } catch (err) {
      console.warn('[Parser] Multi-format fallback failed, continuing with row-aware results:', err)
    }
    for (const result of multiFormatResults) {
      if (result.confidence >= 60 && !seen.has(result.markerId)) {
        const normalizedValue = normalizeValue(result.value, result.unit, result.markerId)
        if (isNaN(normalizedValue)) continue
        seen.add(result.markerId)
        parsed.push({
          markerId: result.markerId,
          rawName: result.rawText.split(/[:\s=\-|]/)[0].trim(),
          value: normalizedValue,
          unit: result.unit,
          resultType: 'numeric',
        })
      }
    }
  }

  return parsed
}

/**
 * Normalize units where labs legitimately report in a different scale.
 *
 * This only performs UNIT-level conversions that are unambiguous (e.g. a WBC
 * count written as an absolute number instead of ×10³/μL). It deliberately does
 * NOT guess missing decimal points by dividing values by 10/100 — that is value
 * fabrication and is the responsibility of accurate OCR, not the parser.
 */
export function normalizeValue(value: number, unit: string | undefined, markerId: string): number {
  if (!unit) return value

  // Some labs print absolute cell counts instead of the ×10³/μL shorthand.
  // WBC ~4000–11000 absolute -> 4–11 ×10³/μL; platelets ~150000–450000 -> 150–450.
  if (markerId === 'wbc' && value > 1000) return value / 1000
  if (markerId === 'platelets' && value > 10000) return value / 1000

  return value
}
