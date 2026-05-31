/**
 * Clean and fix common OCR issues in lab report text
 */

export function cleanOcrText(text: string): string {
  let cleaned = text
  
  // Fix common OCR character substitutions
  // 0 (zero) vs O (letter O)
  cleaned = cleaned.replace(/\b([A-Za-z]+)0([A-Za-z]+)/g, '$1O$2') // Fix O read as 0 in words
  
  // 1 (one) vs l (lowercase L) vs I (uppercase i)
  cleaned = cleaned.replace(/\bHemog1obin\b/gi, 'Hemoglobin')
  cleaned = cleaned.replace(/\bA1bumin\b/gi, 'Albumin')
  cleaned = cleaned.replace(/\bB1ood\b/gi, 'Blood')
  
  // Fix common decimal point issues
  // Sometimes OCR reads decimal as comma, space, or nothing
  
  // Fix patterns where comma is used as the decimal separator
  cleaned = cleaned.replace(/(\d+),(\d{1,2})\s*(g\/dL|mg\/dL|%|U\/L|mIU\/L)/g, '$1.$2 $3')

  // NOTE: We intentionally do NOT rescale numbers based on their unit (e.g.
  // dividing "132 g/dL" to "13.2"). That is value fabrication — if OCR ever
  // genuinely drops a decimal the right fix is the OCR/preprocessing layer, not
  // silently guessing a "nicer" number here. The OCR pipeline now upscales the
  // image so decimal points are preserved.

  // Fix where a decimal point was misread as an apostrophe/quote: 4'30 -> 4.30
  cleaned = cleaned.replace(/(\d+)[''"'](\d+)/g, '$1.$2')

  // Collapse only HORIZONTAL whitespace within a line. We deliberately PRESERVE
  // newlines: each lab result lives on its own row, and the row-aware parser
  // relies on that structure to pair a marker with the correct result value
  // (rather than a reference-range number or an unrelated ID elsewhere on the
  // page). Flattening to a single line was a major cause of mis-parsing.
  cleaned = cleaned.replace(/[^\S\n]+/g, ' ')
  // Collapse runs of blank lines.
  cleaned = cleaned.replace(/\n{2,}/g, '\n')

  // Re-join only the case where a value got split from its unit across a line
  // break (still the same field): "13.2\n g/dL" -> "13.2 g/dL".
  cleaned = cleaned.replace(/(\d+\.?\d*)[^\S\n]*\n[^\S\n]*(g\/dL|mg\/dL|%|U\/L|mIU\/L|ng\/mL|pg\/mL)/g, '$1 $2')

  // Common OCR errors in medical terms
  const corrections: Record<string, string> = {
    'Hernoglobin': 'Hemoglobin',
    'Haemoglobin': 'Hemoglobin',
    'Hgb': 'Hemoglobin',
    'HGB': 'Hemoglobin',
    'Creatlnine': 'Creatinine',
    'Creatinlne': 'Creatinine',
    'Bilirubln': 'Bilirubin',
    'Biiirubin': 'Bilirubin',
    'Glucoze': 'Glucose',
    'Giucose': 'Glucose',
    'Calclum': 'Calcium',
    'Caicium': 'Calcium',
    'Aibumin': 'Albumin',
    'Aiburnin': 'Albumin',
    'Piatelet': 'Platelet',
    'Piateiet': 'Platelet',
    'Neutrophiis': 'Neutrophils',
    'Lymphocvtes': 'Lymphocytes',
    'Eosinophiis': 'Eosinophils',
    'Monocvtes': 'Monocytes',
    'Potasslum': 'Potassium',
    'Potassium': 'Potassium',
    'Sodlum': 'Sodium',
    'Chlorlde': 'Chloride',
    'Bicarbonate': 'Bicarbonate'
  }
  
  // Apply corrections
  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    cleaned = cleaned.replace(regex, correct)
  }
  
  return cleaned.trim()
}