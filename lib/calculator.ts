import { ParsedValue } from '@/types/lab'
import { DERIVED_MARKER_DEFS } from '@/data/derived-markers'

/**
 * Compute derived markers from parsed numeric values.
 * 
 * Derived markers are calculated from other markers (e.g., HOMA-IR from glucose + insulin).
 * This function checks if all required markers are present, then computes the result.
 * 
 * @param parsedValues - Array of already-parsed numeric results
 * @returns Array of computed derived markers as ParsedValue[]
 */
export function computeDerivedMarkers(
  parsedValues: ParsedValue[]
): ParsedValue[] {
  // Build lookup map: markerId → value
  const valueMap: Record<string, number> = {}
  for (const pv of parsedValues) {
    valueMap[pv.markerId] = pv.value
  }

  const derivedResults: ParsedValue[] = []

  // For each derived marker definition
  for (const def of DERIVED_MARKER_DEFS) {
    // Check if all required markers are present
    const allPresent = def.requiredMarkers.every(id => valueMap[id] !== undefined)
    
    if (!allPresent) continue // Skip if any required marker is missing

    // Calculate the derived value
    const result = def.calculate(valueMap)
    
    if (result === null || result === undefined || isNaN(result)) continue

    // Add as a new ParsedValue
    derivedResults.push({
      markerId: def.id,
      rawName: def.displayName,
      value: result,
      unit: def.unit,
      resultType: 'derived'
    })
  }

  return derivedResults
}
