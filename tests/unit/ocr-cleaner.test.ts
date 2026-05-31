/**
 * Unit tests for the OCR text cleaner.
 *
 * The cleaner is allowed to fix CHARACTER-level OCR mistakes (e.g. "Hemog1obin")
 * and decimal separators, but it must never rescale a NUMBER based on its unit.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanOcrText } from '@/lib/ocr-cleaner'

test('does not rescale "132 g/dL" into "13.2"', () => {
  const out = cleanOcrText('Hemoglobin 132 g/dL')
  assert.match(out, /132 g\/dL/)
  assert.doesNotMatch(out, /13\.2/)
})

test('does not rescale a potassium-like value based on units', () => {
  const out = cleanOcrText('Potassium 430 mEq/L')
  assert.match(out, /430/)
  assert.doesNotMatch(out, /4\.30/)
})

test('fixes letter-for-digit OCR errors in marker names', () => {
  const out = cleanOcrText('Hemog1obin 13.2 g/dL')
  assert.match(out, /Hemoglobin/)
})

test('repairs a decimal point misread as an apostrophe', () => {
  const out = cleanOcrText("Potassium 4'30")
  assert.match(out, /4\.30/)
})

test('converts a comma decimal next to a recognized unit', () => {
  const out = cleanOcrText('Calcium 9,7 mg/dL')
  assert.match(out, /9\.7 mg\/dL/)
})
