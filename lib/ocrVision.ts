/**
 * OCR using Transformers.js - runs AI models completely locally
 * No API calls, no tokens needed. Models are downloaded once and cached.
 */

import { pipeline } from '@xenova/transformers'

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
    
    // Convert ArrayBuffer to Buffer
    const imageBuffer = Buffer.from(buffer)
    
    // Run OCR - completely local, no API calls
    const result = await ocr(imageBuffer)
    
    if (result && result[0]?.generated_text) {
      const text = result[0].generated_text
      console.log('[OCR Vision] Extracted text length:', text.length)
      return text
    }

    return ''
  } catch (err) {
    console.error('[OCR Vision] Error:', err)
    return ''
  }
}
