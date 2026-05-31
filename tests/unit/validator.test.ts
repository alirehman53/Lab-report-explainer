/**
 * Unit tests for the value validator.
 *
 * The validator is a *sanity gate* and *flagging* layer. It may reject a
 * physically impossible value (confidence 0) but must NOT silently rescale a
 * value to make it look correct.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateLabValue, standardizeValue } from '@/lib/validator'

test('accepts a normal potassium value', () => {
  const r = validateLabValue('potassium', 4.3, 'mEq/L')
  assert.equal(r.isValid, true)
})

test('keeps a genuine critical-high potassium (does not drop real criticals)', () => {
  // 6.4 mEq/L is dangerously high but real — confidence is lowered, not zeroed.
  const r = validateLabValue('potassium', 6.4, 'mEq/L')
  assert.ok(r.confidence > 0, 'a real critical value must not be dropped')
})

test('regression: WBC/platelets in ×10³/μL validate (not treated as absolute counts)', () => {
  // These previously hit confidence 0 because the validator used absolute counts.
  assert.ok(validateLabValue('wbc', 3.7, '×10³/μL').confidence > 0)
  assert.ok(validateLabValue('platelets', 150, '×10³/μL').confidence > 0)
})

test('accepts a marker that has no numeric range rather than dropping it', () => {
  // Coverage for "every element": unknown-range markers are accepted, not zeroed.
  const r = validateLabValue('hemoglobin', 14, 'g/dL')
  assert.equal(r.isValid, true)
})

test('rejects a physically impossible potassium value', () => {
  // 430 mEq/L is incompatible with life — confidence must bottom out.
  const r = validateLabValue('potassium', 430, 'mEq/L')
  assert.equal(r.confidence, 0)
})

test('flags (but does not fix) a value that may be missing a decimal', () => {
  const r = validateLabValue('calcium', 102, 'mg/dL')
  assert.ok(r.suggestions.some(s => /decimal/i.test(s)))
})

test('standardizeValue never mutates the value when units already match', () => {
  // hemoglobin exists in LAB_MARKERS with unit g/dL — same-unit must pass through.
  assert.deepEqual(standardizeValue('hemoglobin', 15.8, 'g/dL'), { value: 15.8, unit: 'g/dL' })
})

test('standardizeValue converts hemoglobin g/L to g/dL', () => {
  const converted = standardizeValue('hemoglobin', 158, 'g/L')
  assert.equal(converted.unit, 'g/dL')
  assert.equal(converted.value, 15.8) // 158 g/L = 15.8 g/dL
})
