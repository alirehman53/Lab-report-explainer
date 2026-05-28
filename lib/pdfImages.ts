import { inflateSync } from 'zlib'
import sharp from 'sharp'

// Extract embedded image streams from a PDF using pdf-lib.
// Returns an array of Uint8Array containing raw image bytes (PNG data).
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

      // Get image properties
      const filter = dict.get ? dict.get(PDFName.of('Filter')) : null
      const filterStr = filter ? String(filter) : ''
      const width = dict.get ? dict.get(PDFName.of('Width')) : null
      const height = dict.get ? dict.get(PDFName.of('Height')) : null
      const colorSpace = dict.get ? dict.get(PDFName.of('ColorSpace')) : null
      const colorSpaceStr = colorSpace ? String(colorSpace) : ''
      
      console.log('[PDF Images] Found image:', filterStr, `${width}x${height}`, colorSpaceStr)

      const contents = obj.getContents ? obj.getContents() : null
      if (!contents) continue

      let imageData: Uint8Array

      if (filterStr.includes('DCTDecode')) {
        // JPEG - use as-is
        imageData = contents instanceof Uint8Array ? contents : Uint8Array.from(contents)
        console.log('[PDF Images] Extracted DCTDecode (JPEG) image, size:', imageData.length)
        images.push(imageData)
      } else if (filterStr.includes('FlateDecode') && width && height) {
        // Decompress FlateDecode and convert to PNG using Sharp
        try {
          const decompressed = inflateSync(Buffer.from(contents))
          console.log('[PDF Images] Decompressed FlateDecode image:', decompressed.length, 'bytes')
          
          // Determine color channels
          let channels = 3 // Default RGB
          if (colorSpaceStr.includes('DeviceGray')) channels = 1
          else if (colorSpaceStr.includes('DeviceRGB')) channels = 3
          else if (colorSpaceStr.includes('DeviceCMYK')) channels = 4
          
          // Convert raw pixel data to PNG using Sharp
          const png = await sharp(decompressed, {
            raw: {
              width: Number(width),
              height: Number(height),
              channels: channels as 1 | 2 | 3 | 4
            }
          }).png().toBuffer()
          
          console.log('[PDF Images] Converted FlateDecode to PNG, size:', png.length)
          images.push(new Uint8Array(png))
        } catch (decodeErr) {
          console.warn('[PDF Images] Failed to decode FlateDecode image:', decodeErr)
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
