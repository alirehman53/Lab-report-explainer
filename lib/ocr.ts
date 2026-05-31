/**
 * Multi-pass, decimal-safe OCR.
 *
 * Different images need opposite preprocessing:
 *   - Low-resolution photos/scans need heavy UPSCALING so small decimal points
 *     survive (e.g. "9.7" instead of "97").
 *   - Already-clean, higher-resolution digital reports are DISTORTED by heavy
 *     upscaling (e.g. a crisp "5.2" gets mangled into "9.2").
 *
 * No single scale wins, so we OCR TWO variants of every image — an upscaled pass
 * and a native-resolution pass — and return BOTH texts. The analyzer then
 * reconciles them per-marker by medical plausibility (see fallback.ts), keeping
 * whichever reading actually makes sense. Engine priority per pass:
 *   1. System Tesseract CLI (primary — a real document/table OCR engine)
 *   2. AI Vision (TrOCR) — last resort only, when Tesseract is unavailable.
 */

import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ocrWithVision } from './ocrVision'
import { cleanOcrText } from './ocr-cleaner'

const execFileAsync = promisify(execFile)

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const isServerless = isVercel || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

async function findTesseract(): Promise<string | null> {
  const candidates = [
    'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
    'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
  ]
  for (const candidate of candidates) {
    try { await fs.access(candidate); return candidate } catch { /* keep looking */ }
  }
  try {
    await execFileAsync('tesseract', ['--version'], { timeout: 10_000 })
    return 'tesseract'
  } catch {
    return null
  }
}

async function runTesseract(tesseractCmd: string, pngBuffer: Buffer): Promise<string> {
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocr-'))
  const pngPath = path.join(tmpdir, 'img.png')
  try {
    await fs.writeFile(pngPath, pngBuffer)
    const args = [
      pngPath, 'stdout',
      '-l', 'eng',
      '--oem', '1',
      '--psm', '6',
      '-c', 'preserve_interword_spaces=1',
    ]
    const { stdout } = await execFileAsync(tesseractCmd, args, {
      encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 60_000,
    })
    return String(stdout ?? '')
  } finally {
    try { await fs.rm(tmpdir, { recursive: true, force: true }) } catch { /* noop */ }
  }
}

/**
 * Build the two preprocessing variants. We avoid the brightness/contrast
 * heuristics (which darkened images and dissolved decimal dots); both variants
 * are gentle and decimal-safe — the only difference is scale.
 */
async function buildVariants(buffer: ArrayBuffer): Promise<Buffer[]> {
  const sharp = (await import('sharp')).default
  const input = Buffer.from(buffer)
  const meta = await sharp(input).metadata()
  const w = meta.width ?? 0
  const h = meta.height ?? 0
  if (!w || !h) {
    const png = await sharp(input).png().toBuffer()
    return [png]
  }
  const longEdge = Math.max(w, h)
  const MAX_EDGE = 4000

  // Variant A — UPSCALED (~3.5×, capped) + mild contrast for small/low-res
  // images: maximizes how many faint markers/decimals are recovered. Any digit
  // distortion this introduces on crisp images is corrected by Variant B via
  // reconciliation, and impossible decimals are repaired by the analyzer.
  const scaleA = Math.max(1, Math.min(3.5, MAX_EDGE / longEdge))
  const upscaled = await sharp(input)
    .grayscale()
    .resize(Math.round(w * scaleA), Math.round(h * scaleA), { kernel: sharp.kernel.lanczos3 })
    .linear(1.15, 0)
    .sharpen({ sigma: 1, m1: 0.5, m2: 0.3 })
    .normalise()
    .png()
    .toBuffer()

  // Variant B — NATIVE resolution (only modest upscale for very small images),
  // which keeps crisp digital text undistorted.
  const scaleB = Math.max(1, Math.min(1.5, 1600 / longEdge))
  const native = await sharp(input)
    .grayscale()
    .resize(Math.round(w * scaleB), Math.round(h * scaleB), { kernel: sharp.kernel.lanczos3 })
    .normalise()
    .png()
    .toBuffer()

  // If the two scales collapse to the same thing, one pass is enough.
  return Math.abs(scaleA - scaleB) < 0.05 ? [upscaled] : [upscaled, native]
}

/**
 * OCR an image and return one cleaned text per preprocessing variant. The
 * analyzer reconciles multiple texts; callers that only want one can use the
 * first entry (see ocrBuffer).
 */
export async function ocrBufferMulti(buffer: ArrayBuffer): Promise<string[]> {
  let variants: Buffer[]
  try {
    variants = await buildVariants(buffer)
    console.log('[OCR] Built', variants.length, 'preprocessing variant(s)')
  } catch (err) {
    console.warn('[OCR] Preprocessing failed, using original buffer:', err)
    variants = [Buffer.from(buffer)]
  }

  const isNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node)
  const tesseractCmd = isNode && !isServerless ? await findTesseract() : null

  const texts: string[] = []

  if (tesseractCmd) {
    console.log('[OCR] Using tesseract:', tesseractCmd)
    for (let i = 0; i < variants.length; i++) {
      try {
        const raw = await runTesseract(tesseractCmd, variants[i])
        if (raw && raw.trim().length > 5) {
          texts.push(cleanOcrText(raw))
          console.log(`[OCR] Variant ${i + 1} OK, length:`, raw.length)
        }
      } catch (err) {
        console.warn(`[OCR] Tesseract failed on variant ${i + 1}:`, err)
      }
    }
    if (texts.length > 0) return texts
    console.log('[OCR] Tesseract produced nothing, trying AI vision fallback...')
  } else {
    console.log('[OCR] Tesseract not available, trying AI vision fallback...')
  }

  // Last resort: AI vision on the upscaled variant only.
  try {
    const v = variants[0]
    const ab = v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) as ArrayBuffer
    const raw = await ocrWithVision(ab)
    if (raw && raw.length > 5) return [cleanOcrText(raw)]
  } catch (err) {
    console.warn('[OCR] Vision model failed:', err)
  }

  console.error('[OCR] All OCR methods failed')
  return []
}

/**
 * Backwards-compatible single-text OCR. Returns the upscaled pass (best general
 * default). Prefer ocrBufferMulti + reconciliation for highest accuracy.
 */
export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  const texts = await ocrBufferMulti(buffer)
  return texts[0] ?? ''
}
