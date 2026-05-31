/**
 * End-to-end test for PDF selectable-text extraction.
 *
 * Digitally-generated lab PDFs carry exact text, so extraction must return the
 * decimals verbatim (no OCR, no rescaling). The bundled CBC report is a
 * numeric report and is the canonical fixture for this guarantee.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractPdfText } from '@/lib/pdfText'
import { parseLabText } from '@/lib/parser'

const examplesDir = path.resolve(fileURLToPath(new URL('../../examples/', import.meta.url)))

test('extracts exact decimal values from the CBC PDF (no OCR)', { timeout: 60_000 }, async () => {
  const buf = await readFile(path.join(examplesDir, 'CBC-report.pdf'))
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer

  const text = await extractPdfText(arrayBuffer)
  assert.ok(text.length > 100, 'expected substantial text from the CBC PDF')

  // Exact decimals from the report must be present verbatim.
  assert.match(text, /Hemoglobin\s+15\.8/, 'Hemoglobin 15.8 should be extracted exactly')
  assert.match(text, /\bRBC\s+5\.2\b/, 'RBC 5.2 should be extracted exactly')
  assert.match(text, /MCV\s+90\.1/, 'MCV 90.1 should be extracted exactly')

  // And the parser should read hemoglobin back as 15.8, not 158.
  const hb = parseLabText(text).find(r => r.markerId === 'hemoglobin')
  assert.equal(hb?.value, 15.8)
})
