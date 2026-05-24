// Extract embedded image streams from a PDF using pdf-lib.
// Returns an array of Uint8Array containing raw image bytes (JPEG/PNG data).
export async function extractImagesFromPdf(buffer: ArrayBuffer): Promise<Uint8Array[]> {
  const { PDFDocument, PDFName } = await import('pdf-lib')

  const pdfDoc: any = await PDFDocument.load(buffer)
  const images: Uint8Array[] = []

  // pdf-lib exposes a low-level context with indirect objects we can inspect.
  const ctx = (pdfDoc as any).context
  if (!ctx || typeof ctx.enumerateIndirectObjects !== 'function') return images

  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    try {
      // PDFRawStream objects contain image streams. Use duck-typing to detect.
      const isStream = obj && typeof obj.getContents === 'function'
      const dict = obj && obj.dict ? obj.dict : obj
      if (!isStream || !dict) continue

      const subtype = dict.get ? dict.get(PDFName.of('Subtype')) : null
      if (!subtype) continue
      const subtypeStr = String(subtype)
      if (!subtypeStr.includes('Image')) continue

      // Check the Filter to see if it's DCTDecode (JPEG) - these we can handle directly
      const filter = dict.get ? dict.get(PDFName.of('Filter')) : null
      const filterStr = filter ? String(filter) : ''
      console.log('[PDF Images] Found image with filter:', filterStr)

      // Only extract DCTDecode (JPEG) images - these are already in a format Sharp can handle
      // Skip FlateDecode and other compression formats that need special decoding
      if (filterStr.includes('DCTDecode')) {
        const contents = obj.getContents ? obj.getContents() : null
        if (contents) {
          // Ensure Uint8Array
          const bytes = contents instanceof Uint8Array ? contents : Uint8Array.from(contents)
          console.log('[PDF Images] Extracted DCTDecode (JPEG) image, size:', bytes.length)
          images.push(bytes)
        }
      } else {
        console.log('[PDF Images] Skipping image with unsupported filter:', filterStr)
      }
    } catch (e) {
      // ignore individual object parsing errors
      console.warn('[PDF Images] Error extracting image:', e)
      continue
    }
  }

  console.log('[PDF Images] Total images extracted:', images.length)
  return images
}
