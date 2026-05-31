/**
 * Tests for multi-pass OCR reconciliation in analyzeReport.
 *
 * When two OCR passes disagree on a value, the analyzer must keep the
 * medically-plausible reading (this is what fixed "RBC 5.2" being read as
 * "9.2" by the upscaled pass).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeReport } from '@/lib/fallback'

const ctx = { gender: 'male' as const, age: 30 }

test('reconciles conflicting OCR passes to the plausible value (RBC 5.2 over 9.2)', async () => {
  const a = await analyzeReport(['RBC 9.2', 'RBC 5.2'], ctx)
  assert.equal(a.results.find(r => r.markerId === 'rbc')?.value, 5.2)
})

test('keeps a value that only one pass captured', async () => {
  const a = await analyzeReport(['Hemoglobin 14.2 g/dL', 'RBC 5.0'], ctx)
  assert.equal(a.results.find(r => r.markerId === 'hemoglobin')?.value, 14.2)
  assert.equal(a.results.find(r => r.markerId === 'rbc')?.value, 5.0)
})

test('still works with a single text input', async () => {
  const a = await analyzeReport('Calcium 9.7 mg/dl', ctx)
  assert.equal(a.results.find(r => r.markerId === 'calcium')?.value, 9.7)
})
