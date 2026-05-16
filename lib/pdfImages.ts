// Extract embedded image streams from a PDF using pdf-lib.
// Returns an array of Uint8Array containing raw image bytes (often JPEG/PNG data).
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

      // Attempt to read raw bytes
      const contents = obj.getContents ? obj.getContents() : null
      if (contents) {
        // Ensure Uint8Array
        const bytes = contents instanceof Uint8Array ? contents : Uint8Array.from(contents)
        images.push(bytes)
      }
    } catch (e) {
      // ignore individual object parsing errors
      continue
    }
  }

  return images
}
