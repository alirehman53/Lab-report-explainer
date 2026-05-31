/**
 * Unit tests for the lab-text parser.
 *
 * These lock in the decimal-handling contract that the "4.30 read as 430" bug
 * regressed: the parser must read numbers FAITHFULLY and must never fabricate,
 * rescale, or delete a value to make it "look" in range.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseLabText, normalizeValue } from '@/lib/parser'

function valueFor(text: string, markerId: string): number | undefined {
  return parseLabText(text).find(r => r.markerId === markerId)?.value
}

test('preserves a decimal value exactly (4.30 stays 4.30)', () => {
  assert.equal(valueFor('Potassium: 4.30 mEq/L', 'potassium'), 4.3)
})

test('does NOT invent a decimal when the report says a whole number', () => {
  // If a report genuinely reads "Potassium 430", that is garbage we must not
  // "fix" into 4.30 by guessing. We read it as-is; the validator flags it.
  // (430 mEq/L is physically impossible, so it is dropped rather than shown.)
  const result = parseLabText('Potassium: 430 mEq/L').find(r => r.markerId === 'potassium')
  assert.notEqual(result?.value, 4.3)
})

test('keeps a genuinely high (but possible) value instead of rescaling it', () => {
  // Glucose of 162 mg/dL is a real diabetic reading — it must survive intact.
  assert.equal(valueFor('Glucose 162 mg/dL', 'glucose_fasting'), 162)
})

test('normalizes a comma decimal separator to a dot', () => {
  assert.equal(valueFor('Hemoglobin 13,2 g/dL', 'hemoglobin'), 13.2)
})

test('does not touch thousands separators', () => {
  // "1,200" is twelve hundred, not 1.2 — the comma rule must not fire here.
  const v = valueFor('Platelets 1,200 ×10³/μL', 'platelets')
  assert.notEqual(v, 1.2)
})

test('reads multiple markers from a block faithfully', () => {
  const text = [
    'Hemoglobin 13.2 g/dL',
    'Potassium 4.30 mEq/L',
    'Creatinine 0.9 mg/dL',
    'Glucose 95 mg/dL',
  ].join('\n')
  assert.equal(valueFor(text, 'hemoglobin'), 13.2)
  assert.equal(valueFor(text, 'potassium'), 4.3)
  assert.equal(valueFor(text, 'creatinine'), 0.9)
  assert.equal(valueFor(text, 'glucose_fasting'), 95)
})

test('matches common report misspellings / OCR variants of marker names', () => {
  // Real labs (and OCR) misspell names — these must still be recognized so the
  // value is not silently dropped (e.g. "Cholestrol 177" was being missed).
  assert.equal(valueFor('Cholestrol 177 mg/dl', 'cholesterol_total'), 177)
  assert.equal(valueFor('Alkaline Phospatase 88 IU/L', 'alp'), 88)
  assert.equal(valueFor('VLOL 27 mg/dl', 'vldl'), 27)
})

test('distinguishes Bilirubin T (total) from Bilirubin D (direct)', () => {
  assert.equal(valueFor('Bilirubin T 1.1 mg%', 'bilirubin_total'), 1.1)
  assert.equal(valueFor('Biliruin D 0.2 mg%', 'bilirubin_direct'), 0.2)
})

test('does not confuse LDL with total cholesterol', () => {
  const text = 'Cholestrol 177 mg/dl\nLDL 105 mg/dl\nHDL 47 mg/dl'
  assert.equal(valueFor(text, 'cholesterol_total'), 177)
  assert.equal(valueFor(text, 'ldl'), 105)
  assert.equal(valueFor(text, 'hdl'), 47)
})

test('normalizeValue only does legitimate unit-scale conversion, never decimal guessing', () => {
  // Absolute WBC count -> ×10³/μL is a real, unambiguous conversion.
  assert.equal(normalizeValue(8500, '×10³/μL', 'wbc'), 8.5)
  // It must NOT divide a normal potassium reading.
  assert.equal(normalizeValue(4.3, 'mEq/L', 'potassium'), 4.3)
  // And must not "rescue" an out-of-range potassium by dividing.
  assert.equal(normalizeValue(430, 'mEq/L', 'potassium'), 430)
})
