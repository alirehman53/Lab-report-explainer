/**
 * Unit tests for the offline analyzer — focused on the "verify this value"
 * flag and on faithful, non-destructive analysis.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeOffline } from '@/lib/analyzer'
import { parseLabText } from '@/lib/parser'

function analyze(text: string) {
  return analyzeOffline(parseLabText(text), [], { gender: 'male', age: 30 })
}

test('flags a value that likely lost its decimal point (e.g. Calcium 97)', () => {
  const a = analyze('Calcium 97 mg/dl')
  const ca = a.results.find(r => r.markerId === 'calcium')
  assert.ok(ca, 'calcium should be present')
  assert.equal(ca!.flagged, true)
  assert.match(ca!.flagReason ?? '', /decimal/i)
})

test('does NOT flag normal values', () => {
  const a = analyze('Potassium 4.3 mEq/L\nHemoglobin 15.8 g/dL')
  for (const r of a.results) {
    assert.notEqual(r.flagged, true, `${r.displayName} should not be flagged`)
  }
})

test('keeps a plausible value exactly as read (Calcium 9.7 stays 9.7)', () => {
  const a = analyze('Calcium 9.7 mg/dl')
  assert.equal(a.results.find(r => r.markerId === 'calcium')?.value, 9.7)
})

test('auto-repairs a dropped decimal on a tightly-bounded marker (Calcium 97 -> 9.7)', () => {
  const ca = analyze('Calcium 97 mg/dl').results.find(r => r.markerId === 'calcium')
  assert.equal(ca?.value, 9.7)
  assert.equal(ca?.flagged, true) // corrected but still flagged for verification
})

test('auto-repairs a x100 dropped decimal (Potassium 430 -> 4.3)', () => {
  const k = analyze('Potassium 430 mEq/L').results.find(r => r.markerId === 'potassium')
  assert.equal(k?.value, 4.3)
})

test('SAFETY: never auto-corrects markers where high values are real (WBC 55 stays 55)', () => {
  // A WBC of 55 ×10³/μL is a real, dangerous leukemia-range value. It must NOT
  // be "corrected" to 5.5 — that would hide a critical finding.
  const wbc = analyze('WBC 55').results.find(r => r.markerId === 'wbc')
  assert.equal(wbc?.value, 55)
})

test('SAFETY: does not correct a genuine critical value (Potassium 6.8 stays 6.8)', () => {
  const k = analyze('Potassium 6.8 mEq/L').results.find(r => r.markerId === 'potassium')
  assert.equal(k?.value, 6.8)
})

test('does not correct a bounded value that is merely high but possible (Calcium 11)', () => {
  const ca = analyze('Calcium 11 mg/dl').results.find(r => r.markerId === 'calcium')
  assert.equal(ca?.value, 11)
})
