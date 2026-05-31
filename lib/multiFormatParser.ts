/**
 * Multi-format lab report parser
 * Handles various lab report formats from different laboratories
 */

import { LAB_MARKERS } from '../data/markers'
import { LabMarker } from '@/types/lab'

export interface ExtractedValue {
  markerId: string
  value: number
  unit: string
  rawText: string
  confidence: number
  source: 'pattern' | 'table' | 'ml'
  position?: {
    line?: number
    column?: number
    page?: number
  }
}

/**
 * Common lab report format patterns
 */
const LAB_FORMATS = {
  // Format 1: "Marker Name: Value Unit"
  colonFormat: /^([^:]+):\s*([0-9.,]+)\s*([a-zA-Z\/%]+)?/gm,
  
  // Format 2: "Marker Name Value Unit"
  spaceFormat: /^([A-Za-z\s]+?)\s+([0-9.,]+)\s*([a-zA-Z\/%]+)?$/gm,
  
  // Format 3: "Marker Name = Value Unit"
  equalsFormat: /^([^=]+)=\s*([0-9.,]+)\s*([a-zA-Z\/%]+)?/gm,
  
  // Format 4: "Marker Name | Value | Unit | Reference"
  tableFormat: /^([^|]+)\|\s*([0-9.,]+)\s*\|\s*([a-zA-Z\/%]+)?\s*\|?/gm,
  
  // Format 5: "Value Unit Marker Name" (reversed)
  reversedFormat: /^([0-9.,]+)\s*([a-zA-Z\/%]+)?\s+(.+)$/gm,
  
  // Format 6: Tab-separated values
  tabFormat: /^([^\t]+)\t+([0-9.,]+)\s*([a-zA-Z\/%]+)?/gm,
  
  // Format 7: Multi-line format (marker on one line, value on next)
  multiLineFormat: /^([A-Za-z\s]+)[\r\n]+([0-9.,]+)\s*([a-zA-Z\/%]+)?/gm,
  
  // Format 8: Parenthetical format "Marker (Value Unit)"
  parenFormat: /^([^(]+)\(([0-9.,]+)\s*([a-zA-Z\/%]+)?\)/gm,
  
  // Format 9: Dash-separated "Marker - Value Unit"
  dashFormat: /^([^-]+)-\s*([0-9.,]+)\s*([a-zA-Z\/%]+)?/gm,
  
  // Format 10: Numeric with decimal variations
  numericVariations: /([A-Za-z\s]+?)[\s:=\-]+?([0-9]+[.,]?[0-9]*)\s*([a-zA-Z\/%]+)?/gm
}

/**
 * Unit variations and aliases
 */
const UNIT_ALIASES: Record<string, string[]> = {
  'mg/dL': ['mg/dl', 'mgdl', 'mg', 'MG/DL', 'milligrams/dL'],
  'g/dL': ['g/dl', 'gdl', 'g', 'G/DL', 'grams/dL'],
  'mmol/L': ['mmol/l', 'mmoll', 'mmol', 'MMOL/L'],
  'mEq/L': ['meq/l', 'meql', 'meq', 'MEQ/L'],
  'U/L': ['u/l', 'ul', 'units/L', 'IU/L', 'iu/l'],
  '%': ['percent', 'pct', 'percentage'],
  'cells/mcL': ['cells/μL', 'cells/uL', '/mcL', '/μL'],
  'ng/mL': ['ng/ml', 'ngml', 'NG/ML'],
  'μIU/mL': ['uIU/mL', 'mIU/L', 'μIU/ml'],
  'mg': ['milligrams', 'MG'],
  'μmol/L': ['umol/L', 'micromol/L'],
  'fL': ['fl', 'femtoliters'],
  'pg': ['picograms', 'PG']
}

/**
 * Normalize unit string to standard format
 */
function normalizeUnit(unit: string | undefined): string {
  if (!unit) return ''
  
  const normalized = unit.trim().replace(/\s+/g, '')
  
  // Check against all aliases
  for (const [standard, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.some(alias => alias.toLowerCase() === normalized.toLowerCase())) {
      return standard
    }
  }
  
  return unit
}

/**
 * Find best matching marker for a given text
 */
function findMatchingMarker(text: string): LabMarker | null {
  const normalized = text.toLowerCase().trim()
  
  // Search through all markers
  for (const [markerId, marker] of Object.entries(LAB_MARKERS)) {
    // Direct match on ID
    if (markerId === normalized) return marker
    
    // Check display name
    if (marker.displayName.toLowerCase() === normalized) return marker
    
    // Check all names/aliases
    if (marker.names?.some(name => name.toLowerCase() === normalized)) {
      return marker
    }
    
    // Fuzzy match - contains marker name
    if (normalized.includes(marker.displayName.toLowerCase()) ||
        marker.names?.some(name => normalized.includes(name.toLowerCase()))) {
      return marker
    }
  }
  
  // Very fuzzy - marker name contains the text
  for (const [markerId, marker] of Object.entries(LAB_MARKERS)) {
    if (marker.displayName.toLowerCase().includes(normalized) ||
        marker.names?.some(name => name.toLowerCase().includes(normalized))) {
      return marker
    }
  }
  
  return null
}

/**
 * Calculate confidence score for extracted value
 */
function calculateConfidence(
  marker: LabMarker,
  value: number,
  unit: string,
  matchQuality: 'exact' | 'alias' | 'fuzzy' | 'very_fuzzy'
): number {
  let confidence = 0
  
  // Base confidence from match quality
  switch (matchQuality) {
    case 'exact': confidence = 90; break
    case 'alias': confidence = 85; break
    case 'fuzzy': confidence = 70; break
    case 'very_fuzzy': confidence = 50; break
  }
  
  // Check if value is within normal range
  if (marker.ranges) {
    // Get the default range (could be 'universal', 'male', or 'female')
    const range = marker.ranges.universal || marker.ranges.male || marker.ranges.female
    if (range) {
      const min = range.low
      const max = range.high
      if (min !== undefined && max !== undefined) {
        if (value >= min && value <= max) {
          confidence += 10
        } else if (value < min * 0.1 || value > max * 10) {
          // Very abnormal value, reduce confidence
          confidence -= 30
        }
      }
    }
  }
  
  // Check unit match
  if (unit && marker.unit) {
    if (normalizeUnit(unit) === marker.unit) {
      confidence += 5
    } else {
      confidence -= 10
    }
  }
  
  return Math.max(0, Math.min(100, confidence))
}

/**
 * Extract values using pattern matching
 */
function extractWithPattern(
  text: string,
  pattern: RegExp,
  formatName: string
): ExtractedValue[] {
  const results: ExtractedValue[] = []
  const lines = text.split(/\r?\n/)
  
  // Reset regex state
  pattern.lastIndex = 0
  
  let match
  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, markerText, valueText, unitText] = match

    // Some patterns/matches don't capture a marker name or value group — guard
    // against undefined so a single odd line can't crash the whole analysis.
    if (!markerText || !valueText) continue

    // Avoid zero-width matches causing an infinite loop on global regexes.
    if (match.index === pattern.lastIndex) pattern.lastIndex++

    // Clean and parse value
    const cleanValue = valueText.replace(',', '.')
    const value = parseFloat(cleanValue)

    if (isNaN(value)) continue
    
    // Find matching marker
    const marker = findMatchingMarker(markerText)
    if (!marker) continue
    
    // Determine match quality
    let matchQuality: 'exact' | 'alias' | 'fuzzy' | 'very_fuzzy' = 'very_fuzzy'
    const normalizedMarker = markerText.toLowerCase().trim()
    if (marker.displayName.toLowerCase() === normalizedMarker) {
      matchQuality = 'exact'
    } else if (marker.names?.some(a => a.toLowerCase() === normalizedMarker)) {
      matchQuality = 'alias'
    } else if (normalizedMarker.includes(marker.displayName.toLowerCase())) {
      matchQuality = 'fuzzy'
    }
    
    // Calculate confidence
    const unit = normalizeUnit(unitText)
    const confidence = calculateConfidence(marker, value, unit, matchQuality)
    
    // Find line number
    let lineNumber = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(fullMatch)) {
        lineNumber = i + 1
        break
      }
    }
    
    results.push({
      markerId: marker.id,
      value,
      unit: unit || marker.unit,
      rawText: fullMatch,
      confidence,
      source: 'pattern',
      position: { line: lineNumber }
    })
  }
  
  return results
}

/**
 * Extract lab values using multiple format patterns
 */
export function extractLabValues(text: string): ExtractedValue[] {
  const allResults: ExtractedValue[] = []
  const seenMarkers = new Set<string>()
  
  console.log('[Multi-Format Parser] Trying multiple format patterns...')
  
  // Try each format pattern
  for (const [formatName, pattern] of Object.entries(LAB_FORMATS)) {
    const results = extractWithPattern(text, pattern, formatName)
    
    if (results.length > 0) {
      console.log(`[Multi-Format Parser] Format "${formatName}" found ${results.length} values`)
      
      // Add only new markers (prefer higher confidence)
      for (const result of results) {
        if (seenMarkers.has(result.markerId)) {
          // Check if this result has higher confidence
          const existing = allResults.find(r => r.markerId === result.markerId)
          if (existing && result.confidence > existing.confidence) {
            // Replace with higher confidence result
            const index = allResults.indexOf(existing)
            allResults[index] = result
          }
        } else {
          allResults.push(result)
          seenMarkers.add(result.markerId)
        }
      }
    }
  }
  
  console.log(`[Multi-Format Parser] Total unique values extracted: ${allResults.length}`)
  
  // Sort by confidence (highest first)
  return allResults.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Extract values from table-like structures
 */
export function extractFromTable(text: string): ExtractedValue[] {
  const results: ExtractedValue[] = []
  const lines = text.split(/\r?\n/)
  
  // Look for table headers
  const headerPatterns = [
    /test\s*name|parameter|analyte/i,
    /result|value|observation/i,
    /unit|units/i,
    /reference|range|normal/i
  ]
  
  let headerLine = -1
  for (let i = 0; i < lines.length; i++) {
    if (headerPatterns.some(p => p.test(lines[i]))) {
      headerLine = i
      break
    }
  }
  
  if (headerLine === -1) return results
  
  // Parse table rows after header
  for (let i = headerLine + 1; i < lines.length && i < headerLine + 50; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Split by common delimiters
    const parts = line.split(/\s{2,}|\t+|\|/)
      .map(p => p.trim())
      .filter(p => p)
    
    if (parts.length >= 2) {
      const markerText = parts[0]
      const valueText = parts[1]
      const unitText = parts[2] || ''
      
      const value = parseFloat(valueText.replace(',', '.'))
      if (isNaN(value)) continue
      
      const marker = findMatchingMarker(markerText)
      if (!marker) continue
      
      results.push({
        markerId: marker.id,
        value,
        unit: normalizeUnit(unitText) || marker.unit,
        rawText: line,
        confidence: 80, // Table extraction is usually reliable
        source: 'table',
        position: { line: i + 1 }
      })
    }
  }
  
  return results
}

/**
 * Merge and deduplicate extracted values
 */
export function mergeExtractedValues(
  ...valueSets: ExtractedValue[][]
): ExtractedValue[] {
  const merged = new Map<string, ExtractedValue>()
  
  for (const values of valueSets) {
    for (const value of values) {
      const existing = merged.get(value.markerId)
      if (!existing || value.confidence > existing.confidence) {
        merged.set(value.markerId, value)
      }
    }
  }
  
  return Array.from(merged.values())
}

/**
 * Main extraction function combining all methods
 */
export function extractAllLabValues(text: string): ExtractedValue[] {
  // Try pattern-based extraction
  const patternValues = extractLabValues(text)
  
  // Try table extraction
  const tableValues = extractFromTable(text)
  
  // Merge results, preferring higher confidence values
  const merged = mergeExtractedValues(patternValues, tableValues)
  
  console.log(`[Multi-Format Parser] Final extraction: ${merged.length} unique values`)
  
  return merged
}