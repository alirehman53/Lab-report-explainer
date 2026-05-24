/**
 * OCR using Transformers.js - runs AI models completely locally
 * No API calls, no tokens needed. Models are downloaded once and cached.
 */

import { pipeline, RawImage } from '@xenova/transformers'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'

let ocrPipeline: any = null

async function getOcrPipeline() {
  if (!ocrPipeline) {
    console.log('[OCR Vision] Loading TrOCR model (first time only, will be cached)...')
    // Use TrOCR for handwritten/printed text recognition
    // Model is ~350MB, downloads once and caches locally
    ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-small-printed')
    console.log('[OCR Vision] Model loaded successfully')
  }
  return ocrPipeline
}

export async function ocrWithVision(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log('[OCR Vision] Using local Transformers.js TrOCR model')
    
    const ocr = await getOcrPipeline()
    
    // Create a temporary file for the image
    // TrOCR expects a file path or RawImage, not raw buffer
    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocr-vision-'))
    const imgPath = path.join(tmpdir, 'image.png')
    
    try {
      // Write buffer to temp file
      await fs.writeFile(imgPath, Buffer.from(buffer))
      
      // Load image using RawImage.read() for local file paths
      const image = await RawImage.read(imgPath)
      
      // Run OCR - completely local, no API calls
      const result = await ocr(image)
      
      if (result && result[0]?.generated_text) {
        const text = result[0].generated_text
        console.log('[OCR Vision] Extracted text length:', text.length)
        return text
      }

      return ''
    } finally {
      // Clean up temp file
      try {
        await fs.rm(tmpdir, { recursive: true, force: true })
      } catch (_) {}
    }
  } catch (err) {
    console.error('[OCR Vision] Error:', err)
    return ''
  }
}
