/**
 * Extract selectable text from a PDF.
 *
 * For digitally-generated lab reports (the common case) the PDF already
 * contains the exact text — including decimal points — so extracting it
 * directly is far more accurate than rasterizing the page and running OCR.
 * This is a primary reason "4.30" was previously read as "430" for PDFs: text
 * extraction was disabled and every PDF was forced through lossy image OCR. We
 * now read the embedded text first and only fall back to OCR (handled by the
 * caller) when the PDF has no extractable text (i.e. it is a scanned image).
 */

export async function extractPdfText(buffer: ArrayBuffer, maxPages = 10): Promise<string> {
  try {
    // pdf-parse v2 ships a clean class-based API. Import dynamically so it is
    // only loaded in the Node runtime (never bundled into the client).
    const { PDFParse } = await import('pdf-parse')

    const data = new Uint8Array(buffer)
    const parser = new PDFParse({ data })
    try {
      const result = await parser.getText({ last: maxPages })
      const text = (result?.text ?? '').trim()
      console.log('[PDF] Extracted selectable text length:', text.length)
      return text
    } finally {
      // Release worker / memory.
      try { await (parser as { destroy?: () => Promise<void> }).destroy?.() } catch { /* noop */ }
    }
  } catch (err) {
    // Not fatal — the caller falls back to embedded-image extraction + OCR.
    console.warn('[PDF] Selectable-text extraction failed, will fall back to OCR:', err)
    return ''
  }
}
