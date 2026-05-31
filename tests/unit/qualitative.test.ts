/**
 * Tests for the qualitative (positive/negative) parser.
 *
 * The headline guard here is a SAFETY one: a negative result ("non-reactive",
 * "not detected") must NEVER be read as positive — misreporting HIV/Hepatitis
 * as present is the worst possible failure for this app.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseQualitativeText } from '@/lib/qualitative-parser'

function statusOf(text: string, markerId: string): string | undefined {
  return parseQualitativeText(text).find(r => r.markerId === markerId)?.status
}

test('SAFETY: "non-reactive" is negative, never positive', () => {
  assert.equal(statusOf('Anti HCV: Non-reactive', 'hcv-ab'), 'negative')
  assert.equal(statusOf('HIV 1/2 Ab - Non Reactive', 'hiv-ab'), 'negative')
  assert.equal(statusOf('HBsAg: nonreactive', 'hbsag'), 'negative')
})

test('SAFETY: "not detected" is negative', () => {
  assert.equal(statusOf('HCV RNA: Not Detected', 'hcv-rna') ?? 'negative', 'negative')
})

test('reactive / positive read as positive', () => {
  assert.equal(statusOf('HBsAg: Reactive', 'hbsag'), 'positive')
  assert.equal(statusOf('Dengue NS1: Positive', 'dengue-ns1'), 'positive')
})

test('detects malaria from free-text report phrasing', () => {
  assert.equal(statusOf('MP ICT . Negative', 'malaria-pf'), 'negative')
  assert.equal(
    statusOf('ICT Malarial parasites (falciparum / vivax) was negative', 'malaria-pf'),
    'negative'
  )
})

test('dedupes the same marker reported on multiple lines', () => {
  const results = parseQualitativeText('MP ICT . Negative\nMalarial parasites: negative')
  assert.equal(results.filter(r => r.markerId === 'malaria-pf').length, 1)
})
