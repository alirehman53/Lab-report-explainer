/**
 * Multi-strategy OCR with fallback chain:
 * 1. AI Vision Model (Transformers.js) - Primary, works everywhere
 * 2. System Tesseract CLI - Fallback for Docker/Railway deployments
 */

import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ocrWithVision } from './ocrVision'

const execFileAsync = promisify(execFile)

// Detect if running on Vercel or similar serverless platform
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const isServerless = isVercel || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  // First, ensure the buffer is a valid image format by converting with Sharp
  // This handles compressed PDF images (JPEG, etc.) and converts to PNG
  let processedBuffer: ArrayBuffer
  try {
    const sharp = (await import('sharp')).default
    const pngBuffer = await sharp(Buffer.from(buffer))
      .png()
      .toBuffer()
    const arrayBuffer = pngBuffer.buffer as ArrayBuffer
    processedBuffer = arrayBuffer.slice(pngBuffer.byteOffset, pngBuffer.byteOffset + pngBuffer.byteLength)
    console.log('[OCR] Converted image to PNG format, size:', processedBuffer.byteLength)
  } catch (conversionErr) {
    console.warn('[OCR] Image conversion failed, using original buffer:', conversionErr)
    processedBuffer = buffer
  }

  // Priority 1: Try AI vision model (Transformers.js - runs locally, no API calls)
  // This is the primary method - works everywhere and uses AI model
  try {
    console.log('[OCR] Trying AI vision model (Transformers.js)...')
    const text = await ocrWithVision(processedBuffer)
    if (text && text.length > 5) {
      console.log('[OCR] AI vision model succeeded, text length:', text.length)
      return text
    }
    console.log('[OCR] Vision model returned empty/short text, trying fallback...')
  } catch (visionErr) {
    console.warn('[OCR] Vision model failed:', visionErr)
  }

  // Priority 2: Try system tesseract CLI (best for full document OCR)
  // Only attempt if we're in Node.js and not on serverless platform
  const isNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node)
  if (isNode && !isServerless) {
    try {
      console.log('[OCR] Trying system tesseract CLI...')
      
      // Find tesseract executable (check Windows default location first)
      let tesseractCmd = 'tesseract'
      const windowsTesseract = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
      try {
        await fs.access(windowsTesseract)
        tesseractCmd = windowsTesseract
        console.log('[OCR] Using Windows tesseract at:', windowsTesseract)
      } catch (_) {
        // Use 'tesseract' from PATH
        console.log('[OCR] Using tesseract from PATH')
      }
      
      const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocr-'))
      const imgPath = path.join(tmpdir, 'img')
      const pngPath = imgPath + '.png'
      await fs.writeFile(pngPath, Buffer.from(processedBuffer))
      const execOpts = { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 60_000 }
      try {
        const { stdout } = await execFileAsync(tesseractCmd, [pngPath, 'stdout', '-l', 'eng'], execOpts)
        const text = String(stdout ?? '')
        console.log('[OCR] System tesseract CLI succeeded, text length:', text.length)
        return text
      } finally {
        try { await fs.rm(tmpdir, { recursive: true, force: true }) } catch (_) {}
      }
    } catch (cliErr) {
      if ((cliErr as any)?.code === 'ENOENT') {
        console.log('[OCR] System tesseract CLI not found (not installed)')
      } else {
        console.warn('[OCR] System tesseract CLI failed:', cliErr)
      }
    }
  }

  // All methods failed - return empty string
  // Note: We removed tesseract.js fallback because it has fetch() issues in Node.js
  // The AI vision model (Priority 1) should handle most cases
  console.error('[OCR] All OCR methods failed')
  return ''
}
