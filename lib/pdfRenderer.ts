/**
 * Render PDF pages to PNG images using Ghostscript
 * This handles scanned PDFs by converting pages to images for OCR
 * Requires Ghostscript to be installed on the system
 */

import { promisify } from 'util'
import { exec } from 'child_process'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const execAsync = promisify(exec)

export async function renderPdfPagesToImages(buffer: ArrayBuffer, maxPages = 3): Promise<Uint8Array[]> {
  let tempPdfPath: string | null = null
  const tempPngPaths: string[] = []

  try {
    // Write PDF to temp file
    const tempId = Date.now() + '-' + Math.random().toString(36).slice(2)
    tempPdfPath = join(tmpdir(), `pdf-${tempId}.pdf`)
    await writeFile(tempPdfPath, Buffer.from(buffer))
    
    console.log('[PDF Renderer] Using Ghostscript to render PDF...')
    
    // Find Ghostscript executable
    const gsPath = await findGhostscript()
    if (!gsPath) {
      console.log('[PDF Renderer] Ghostscript not found, skipping page rendering')
      return []
    }
    
    console.log(`[PDF Renderer] Found Ghostscript at: ${gsPath}`)
    
    const images: Uint8Array[] = []
    
    // Render each page
    for (let page = 1; page <= maxPages; page++) {
      const outputPath = join(tmpdir(), `page-${tempId}-${page}.png`)
      tempPngPaths.push(outputPath)
      
      // Ghostscript command to render page at high resolution
      const gsCmd = `"${gsPath}" -sDEVICE=png16m -r300 -dFirstPage=${page} -dLastPage=${page} -o "${outputPath}" "${tempPdfPath}"`
      
      try {
        await execAsync(gsCmd, { timeout: 10000 })
        const pngBuffer = await readFile(outputPath)
        images.push(new Uint8Array(pngBuffer))
        console.log(`[PDF Renderer] Rendered page ${page}, size: ${pngBuffer.length} bytes`)
      } catch (err: any) {
        if (err.message?.includes('GS_PDF_INVALIDPAGE') || err.code === 1) {
          // Page doesn't exist, we've reached the end
          console.log(`[PDF Renderer] Rendered ${page - 1} page(s) total`)
          break
        }
        console.warn(`[PDF Renderer] Failed to render page ${page}:`, err.message)
      }
    }
    
    return images
  } catch (error) {
    console.error('[PDF Renderer] Failed to render PDF pages:', error)
    return []
  } finally {
    // Cleanup temp files
    if (tempPdfPath) {
      try { await unlink(tempPdfPath) } catch {}
    }
    for (const path of tempPngPaths) {
      try { await unlink(path) } catch {}
    }
  }
}

async function findGhostscript(): Promise<string | null> {
  const possiblePaths = [
    'C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.03.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.02.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.01.2\\bin\\gswin64c.exe',
    'C:\\Program Files (x86)\\gs\\gs10.04.0\\bin\\gswin32c.exe',
    'C:\\Program Files (x86)\\gs\\gs10.03.1\\bin\\gswin32c.exe',
  ]
  
  // Try common paths first
  for (const path of possiblePaths) {
    try {
      await execAsync(`"${path}" --version`, { timeout: 2000 })
      return path
    } catch {}
  }
  
  // Try PATH
  try {
    await execAsync('gswin64c --version', { timeout: 2000 })
    return 'gswin64c'
  } catch {}
  
  try {
    await execAsync('gs --version', { timeout: 2000 })
    return 'gs'
  } catch {}
  
  return null
}
