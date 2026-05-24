/**
 * Render PDF pages to PNG images for OCR using ImageMagick or pdftoppm
 * This handles PDFs with FlateDecode images or scanned documents
 */

import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

const execFileAsync = promisify(execFile)

export async function renderPdfPagesToImages(buffer: ArrayBuffer, maxPages = 3): Promise<Uint8Array[]> {
  try {
    console.log('[PDF Render] Attempting to render PDF pages to images for OCR...')
    
    const { PDFDocument } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.load(buffer)
    const numPages = Math.min(pdfDoc.getPageCount(), maxPages)
    
    console.log('[PDF Render] PDF has', pdfDoc.getPageCount(), 'pages, will render first', numPages)
    
    const images: Uint8Array[] = []
    
    // Create temp directory for PDF and output images
    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-render-'))
    const pdfPath = path.join(tmpdir, 'input.pdf')
    
    try {
      // Write PDF to temp file
      await fs.writeFile(pdfPath, Buffer.from(buffer))
      
      // Try ImageMagick convert command (works on Windows if ImageMagick is installed)
      // convert -density 300 input.pdf -quality 100 output-%d.png
      let convertCmd = 'magick' // ImageMagick 7+
      let convertArgs = [
        'convert',
        '-density', '300',
        '-quality', '100',
        pdfPath + `[0-${numPages - 1}]`,
        path.join(tmpdir, 'page-%d.png')
      ]
      
      try {
        console.log('[PDF Render] Trying ImageMagick...')
        await execFileAsync(convertCmd, convertArgs, { timeout: 30000 })
        
        // Read generated PNG files
        for (let i = 0; i < numPages; i++) {
          const pngPath = path.join(tmpdir, `page-${i}.png`)
          try {
            const pngData = await fs.readFile(pngPath)
            images.push(new Uint8Array(pngData))
            console.log(`[PDF Render] Loaded page ${i + 1} image, size:`, pngData.length)
          } catch (readErr) {
            console.warn(`[PDF Render] Failed to read page ${i + 1} image:`, readErr)
          }
        }
      } catch (magickErr) {
        console.log('[PDF Render] ImageMagick not available or failed')
        // ImageMagick not available, return empty
      }
    } finally {
      // Cleanup temp directory
      try {
        await fs.rm(tmpdir, { recursive: true, force: true })
      } catch (_) {}
    }
    
    console.log('[PDF Render] Successfully rendered', images.length, 'pages')
    return images
  } catch (err) {
    console.error('[PDF Render] Failed to render PDF pages:', err)
    return []
  }
}
