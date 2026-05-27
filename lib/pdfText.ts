/**
 * Extract text from PDF - currently disabled due to module loading issues in Next.js
 * Falls back to image-based extraction (embedded images + OCR)
 */

export async function extractPdfText(_buffer: ArrayBuffer, _maxPages = 3): Promise<string> {
  // PDF text extraction temporarily disabled - use image upload for scanned PDFs
  // The embedded image extraction and OCR pipeline handles most cases
  console.log('[PDF] Text extraction skipped - using image-based fallback')
  return ''
}
