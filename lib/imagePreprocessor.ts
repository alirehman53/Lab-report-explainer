/**
 * Image preprocessing utilities to improve OCR accuracy
 * Applies various image enhancement techniques before OCR
 */

import sharp from 'sharp'

interface PreprocessOptions {
  // Image enhancement options
  sharpen?: boolean
  denoise?: boolean
  contrast?: number // -100 to 100
  brightness?: number // -100 to 100
  threshold?: number // 0-255 for binarization
  
  // Geometric options
  deskew?: boolean
  scale?: number // scaling factor
  
  // Advanced options
  removeBackground?: boolean
  enhanceText?: boolean
}

/**
 * Preprocess image to improve OCR accuracy
 */
export async function preprocessImage(
  buffer: Buffer,
  options: PreprocessOptions = {}
): Promise<Buffer> {
  const {
    sharpen = true,
    denoise = true,
    contrast = 20,
    brightness = 0,
    threshold = null,
    scale = 2,
    enhanceText = true
  } = options
  
  let pipeline = sharp(buffer)

  // First, convert to grayscale for better text processing
  pipeline = pipeline.grayscale()

  // Scale up the image for better OCR (especially for small text).
  // Upscaling is the single most important step for preserving small glyphs
  // like decimal points: at higher resolution a "." becomes several pixels
  // wide and survives the rest of the pipeline. Empirically, ~3.5× recovers
  // decimals on low-resolution lab photos that 2.5× loses (e.g. "7.6" read as
  // "76"). We cap the resulting longest edge so very large phone photos are
  // not blown up to an excessive, slow-to-OCR size.
  if (scale && scale !== 1) {
    const metadata = await sharp(buffer).metadata()
    if (metadata.width && metadata.height) {
      const longEdge = Math.max(metadata.width, metadata.height)
      const MAX_EDGE = 4000 // px — keep OCR fast and within memory limits
      // Never downscale (≥1), never exceed the requested scale or MAX_EDGE.
      const effectiveScale = Math.max(1, Math.min(scale, MAX_EDGE / longEdge))
      if (effectiveScale > 1) {
        pipeline = pipeline.resize(
          Math.round(metadata.width * effectiveScale),
          Math.round(metadata.height * effectiveScale),
          {
            // Lanczos preserves fine detail (thin strokes, decimal dots) far
            // better than cubic when upscaling text.
            kernel: sharp.kernel.lanczos3,
            fastShrinkOnLoad: false
          }
        )
      }
    }
  }

  // Gentle contrast normalization so faint text stands out without crushing
  // small features. We intentionally avoid aggressive linear stretching.
  if (contrast !== 0) {
    pipeline = pipeline.linear(
      1 + Math.min(contrast, 15) / 100,
      brightness
    )
  }

  // Light sharpening to crisp up edges. Kept mild so decimal dots are not
  // dissolved into surrounding whitespace.
  if (sharpen) {
    pipeline = pipeline.sharpen({
      sigma: 1,
      m1: 0.5,
      m2: 0.3
    })
  }

  // IMPORTANT: We deliberately DO NOT apply median() denoising or a hard
  // threshold() binarization here. Both of those destroy small isolated
  // features — most notably the decimal point — which is the exact reason
  // "4.30" was being read as "430". Tesseract performs its own adaptive
  // (Otsu) thresholding internally at the upscaled resolution, where the
  // decimal dot is now large enough to survive. `denoise`, `threshold`, and
  // `enhanceText` options are accepted for backwards compatibility but are
  // intentionally treated as no-ops for the binarization/denoise steps.
  void denoise
  void threshold
  void enhanceText

  // Normalize to ensure consistent brightness/contrast across the page.
  pipeline = pipeline.normalise()

  // Convert to PNG for best OCR compatibility (lossless — no JPEG artifacts
  // that could smear a decimal point).
  pipeline = pipeline.png()

  return await pipeline.toBuffer()
}

/**
 * Detect if image needs preprocessing based on quality analysis
 */
export async function analyzeImageQuality(buffer: Buffer): Promise<{
  needsPreprocessing: boolean
  suggestedOptions: PreprocessOptions
  quality: {
    contrast: 'low' | 'normal' | 'high'
    brightness: 'dark' | 'normal' | 'bright'
    sharpness: 'blurry' | 'normal' | 'sharp'
    noise: 'noisy' | 'clean'
  }
}> {
  const image = sharp(buffer)
  const metadata = await image.metadata()
  const stats = await image.stats()
  
  // Analyze image statistics
  const meanBrightness = stats.channels[0].mean
  const stdDev = stats.channels[0].stdev
  
  // Determine quality characteristics
  const quality = {
    contrast: (stdDev < 30 ? 'low' : stdDev > 80 ? 'high' : 'normal') as 'low' | 'normal' | 'high',
    brightness: (meanBrightness < 100 ? 'dark' : meanBrightness > 200 ? 'bright' : 'normal') as 'dark' | 'normal' | 'bright',
    sharpness: 'normal' as 'blurry' | 'normal' | 'sharp', // Would need edge detection for accurate assessment
    noise: 'clean' as 'noisy' | 'clean' // Would need noise analysis for accurate assessment
  }
  
  // Determine if preprocessing is needed
  const needsPreprocessing = 
    quality.contrast === 'low' ||
    quality.brightness !== 'normal' ||
    (metadata.width ? metadata.width < 1000 : false) // Small images need scaling
  
  // Suggest preprocessing options based on analysis
  const suggestedOptions: PreprocessOptions = {
    sharpen: quality.sharpness === 'blurry',
    denoise: quality.noise === 'noisy',
    contrast: quality.contrast === 'low' ? 30 : 0,
    brightness: quality.brightness === 'dark' ? 20 : quality.brightness === 'bright' ? -20 : 0,
    scale: metadata.width && metadata.width < 1000 ? 2 : 1,
    enhanceText: true
  }
  
  return {
    needsPreprocessing,
    suggestedOptions,
    quality
  }
}

/**
 * Split multi-column layout into separate images for better OCR
 */
export async function splitColumns(buffer: Buffer): Promise<Buffer[]> {
  const metadata = await sharp(buffer).metadata()
  if (!metadata.width || !metadata.height) {
    return [buffer]
  }
  
  // Simple two-column split for now
  // More sophisticated column detection could use edge detection
  const halfWidth = Math.floor(metadata.width / 2)
  
  const leftColumn = await sharp(buffer)
    .extract({
      left: 0,
      top: 0,
      width: halfWidth,
      height: metadata.height
    })
    .toBuffer()
  
  const rightColumn = await sharp(buffer)
    .extract({
      left: halfWidth,
      top: 0,
      width: halfWidth,
      height: metadata.height
    })
    .toBuffer()
  
  return [leftColumn, rightColumn]
}

/**
 * Detect and extract table regions from image
 */
export async function extractTableRegions(buffer: Buffer): Promise<{
  tables: Buffer[]
  remainingImage: Buffer
}> {
  // This is a simplified version
  // Full implementation would use edge detection and Hough transform
  // to detect table lines and extract table regions
  
  // For now, just return the original image
  return {
    tables: [],
    remainingImage: buffer
  }
}

/**
 * Apply adaptive preprocessing based on document type
 */
export async function adaptivePreprocess(
  buffer: Buffer,
  documentType: 'lab_report' | 'prescription' | 'medical_record' | 'unknown' = 'unknown'
): Promise<Buffer> {
  // Analyze image quality
  const analysis = await analyzeImageQuality(buffer)
  
  // Apply document-type specific preprocessing
  let options: PreprocessOptions = analysis.suggestedOptions
  
  switch (documentType) {
    case 'lab_report':
      // Lab reports often have tables and small text. 3.5× (capped by MAX_EDGE
      // in preprocessImage) reliably preserves decimal points that lower scales
      // lose — e.g. "7.6"/"4.6"/"9.7" instead of "76"/"46"/"97".
      //
      // IMPORTANT: force brightness to 0. The quality heuristic flags many lab
      // scans/photos as "bright" and suggests a negative brightness offset, but
      // darkening dissolves the faint single-pixel decimal points we are trying
      // to preserve (this is what made "9.7" read as "97"). We keep contrast
      // mild and never darken for lab reports.
      options = {
        ...options,
        scale: 3.5,
        sharpen: true,
        contrast: 25,
        brightness: 0,
        enhanceText: true
      }
      break
      
    case 'prescription':
      // Prescriptions may have handwriting
      options = {
        ...options,
        scale: 2,
        denoise: true,
        sharpen: true
      }
      break
      
    case 'medical_record':
      // Medical records are usually well-formatted
      options = {
        ...options,
        scale: 1.5,
        enhanceText: true
      }
      break
      
    default:
      // Use auto-detected options
      break
  }
  
  return preprocessImage(buffer, options)
}

/**
 * Prepare image specifically for lab report OCR
 */
export async function preprocessLabReport(buffer: Buffer): Promise<Buffer> {
  console.log('[Image Preprocessor] Preparing lab report for OCR...')
  
  // Apply adaptive preprocessing for lab reports
  const processed = await adaptivePreprocess(buffer, 'lab_report')
  
  console.log('[Image Preprocessor] Lab report preprocessing complete')
  
  return processed
}