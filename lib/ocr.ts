/**
 * Multi-strategy OCR with a decimal-safe pipeline.
 *
 * Engine priority:
 *   1. System Tesseract CLI  — PRIMARY. A full-page/table OCR engine. Configured
 *      with page-segmentation mode 6 (uniform block) and preserved interword
 *      spaces so columns and decimal points in lab tables survive.
 *   2. AI Vision (TrOCR via Transformers.js) — LAST RESORT only. TrOCR is a
 *      single-LINE recognition model; it is not suitable for full documents and
 *      is used only when Tesseract is unavailable (e.g. some serverless hosts).
 *
 * The image is always upscaled first (see imagePreprocessor) so that small
 * glyphs — most importantly the decimal point — are several pixels wide and are
 * not lost. This is what fixes "4.30" being read as "430".
 */

import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ocrWithVision } from './ocrVision'
import { cleanOcrText } from './ocr-cleaner'
import { preprocessLabReport, analyzeImageQuality } from './imagePreprocessor'

const execFileAsync = promisify(execFile)

// Detect if running on Vercel or similar serverless platform
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const isServerless = isVercel || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

/**
 * Locate the tesseract executable. Checks the Windows default install path,
 * then falls back to whatever is on PATH. Returns null if it cannot be found.
 */
async function findTesseract(): Promise<string | null> {
  const candidates = [
    'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
    'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
  ]
  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // keep looking
    }
  }
  // Fall back to PATH — verify it actually runs.
  try {
    await execFileAsync('tesseract', ['--version'], { timeout: 10_000 })
    return 'tesseract'
  } catch {
    return null
  }
}

async function runTesseract(
  tesseractCmd: string,
  pngBuffer: Buffer
): Promise<string> {
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocr-'))
  const pngPath = path.join(tmpdir, 'img.png')
  try {
    await fs.writeFile(pngPath, pngBuffer)
    const args = [
      pngPath,
      'stdout',
      '-l', 'eng',
      '--oem', '1', // LSTM engine — best accuracy for printed text
      '--psm', '6', // assume a uniform block of text (lab tables)
      '-c', 'preserve_interword_spaces=1', // keep column spacing intact
    ]
    const execOpts = { encoding: 'utf8' as const, maxBuffer: 20 * 1024 * 1024, timeout: 60_000 }
    const { stdout } = await execFileAsync(tesseractCmd, args, execOpts)
    return String(stdout ?? '')
  } finally {
    try { await fs.rm(tmpdir, { recursive: true, force: true }) } catch { /* noop */ }
  }
}

export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  // Always upscale + gently enhance the image before OCR. Upscaling is what
  // keeps the decimal point intact, so we apply it unconditionally rather than
  // only when the quality heuristic asks for it.
  let pngBuffer: Buffer
  try {
    const inputBuffer = Buffer.from(buffer)

    try {
      const analysis = await analyzeImageQuality(inputBuffer)
      console.log('[OCR] Image quality analysis:', analysis.quality)
    } catch { /* analysis is best-effort */ }

    console.log('[OCR] Applying decimal-safe preprocessing...')
    pngBuffer = await preprocessLabReport(inputBuffer)
    console.log('[OCR] Preprocessing complete, size:', pngBuffer.byteLength)
  } catch (conversionErr) {
    console.warn('[OCR] Preprocessing failed, using original buffer:', conversionErr)
    pngBuffer = Buffer.from(buffer)
  }

  // Priority 1: System Tesseract CLI (the real document OCR engine).
  const isNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node)
  if (isNode && !isServerless) {
    try {
      const tesseractCmd = await findTesseract()
      if (tesseractCmd) {
        console.log('[OCR] Using tesseract:', tesseractCmd)
        const rawText = await runTesseract(tesseractCmd, pngBuffer)
        if (rawText && rawText.trim().length > 5) {
          console.log('[OCR] Tesseract succeeded, raw length:', rawText.length)
          const cleanedText = cleanOcrText(rawText)
          console.log('[OCR] Cleaned length:', cleanedText.length)
          return cleanedText
        }
        console.log('[OCR] Tesseract returned empty/short text, trying fallback...')
      } else {
        console.log('[OCR] Tesseract not installed, trying AI vision fallback...')
      }
    } catch (cliErr) {
      console.warn('[OCR] Tesseract failed:', cliErr)
    }
  }

  // Priority 2 (last resort): AI vision model. Note: TrOCR is a single-line
  // model and is poor at full pages — this exists only so serverless hosts
  // without tesseract still return *something*.
  try {
    console.log('[OCR] Trying AI vision model (Transformers.js, last resort)...')
    const arrayBuffer = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength
    ) as ArrayBuffer
    const rawText = await ocrWithVision(arrayBuffer)
    if (rawText && rawText.length > 5) {
      console.log('[OCR] AI vision model returned text length:', rawText.length)
      return cleanOcrText(rawText)
    }
  } catch (visionErr) {
    console.warn('[OCR] Vision model failed:', visionErr)
  }

  console.error('[OCR] All OCR methods failed')
  return ''
}
