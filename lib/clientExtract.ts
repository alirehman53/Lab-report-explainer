/**
 * Browser-side text extraction for uploaded reports.
 *
 * WHY THIS EXISTS
 * ----------------
 * The server runs on Vercel's serverless runtime, where there is no Tesseract
 * CLI binary and the @xenova/transformers TrOCR fallback (a ~350 MB model loaded
 * per request) OOMs/times out and crashes the function (HTTP 500). So we never
 * OCR on the server. Instead we extract text IN THE BROWSER and send only plain
 * text to /api/analyze — the deterministic text path that works perfectly on
 * serverless.
 *
 * STRATEGY (most accurate first)
 *   1. PDF with a text layer  → read the embedded text via pdf.js. This is the
 *      common case for digital lab reports and is decimal-perfect (no OCR), which
 *      is exactly why "4.30" is no longer misread as "430".
 *   2. PDF with NO text layer (a scan) → rasterize each page and OCR it.
 *   3. Image (photo/screenshot) → OCR it.
 *   4. Anything else (txt/csv) → read as text.
 *
 * OCR uses tesseract.js loaded from a CDN at runtime (see loadTesseract). We load
 * it on demand rather than bundling it: OCR is only needed for scans/photos, and
 * runtime loading avoids bundler worker/wasm wiring entirely.
 */

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'

export type ExtractProgress = (message: string) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWindow(): any {
  if (typeof window === 'undefined') throw new Error('Text extraction must run in the browser')
  return window
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tesseractPromise: Promise<any> | null = null

/** Inject the tesseract.js UMD bundle once and resolve the global Tesseract. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadTesseract(): Promise<any> {
  const w = getWindow()
  if (w.Tesseract) return Promise.resolve(w.Tesseract)
  if (tesseractPromise) return tesseractPromise

  tesseractPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TESSERACT_CDN
    script.async = true
    script.onload = () => {
      if (w.Tesseract) resolve(w.Tesseract)
      else reject(new Error('OCR engine loaded but was unavailable.'))
    }
    script.onerror = () => {
      tesseractPromise = null
      reject(new Error('Could not load the OCR engine. Check your connection and try again.'))
    }
    document.head.appendChild(script)
  })
  return tesseractPromise
}

/** A PDF text layer is "usable" if it has real content (some letters + a digit). */
function hasUsableText(text: string): boolean {
  const compact = text.replace(/\s+/g, '')
  return compact.length >= 25 && /\d/.test(text) && /[a-z]/i.test(text)
}

/**
 * Draw an image source onto a canvas, upscaling small images so that small
 * decimal points survive OCR (Tesseract likes ~1600px+ on the long edge). We do
 * NOT threshold/binarize — that previously dissolved decimal dots.
 */
function toOcrCanvas(
  source: CanvasImageSource,
  srcW: number,
  srcH: number
): HTMLCanvasElement {
  const longEdge = Math.max(srcW, srcH)
  const TARGET = 2000
  const MAX = 4000
  const scale = Math.max(1, Math.min(TARGET / longEdge, MAX / longEdge))
  const w = Math.round(srcW * scale)
  const h = Math.round(srcH * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)

  // Light grayscale to steady the background without touching the glyph dots.
  try {
    const img = ctx.getImageData(0, 0, w, h)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0
      d[i] = d[i + 1] = d[i + 2] = g
    }
    ctx.putImageData(img, 0, 0)
  } catch {
    /* tainted canvas (shouldn't happen for local files) — OCR raw colors */
  }
  return canvas
}

/** Run a single decimal-safe OCR pass over a canvas/image source. */
async function ocrCanvas(canvas: HTMLCanvasElement, onProgress?: ExtractProgress): Promise<string> {
  const Tesseract = await loadTesseract()
  const worker = await Tesseract.createWorker('eng', 1, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: (m: any) => {
      if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(`Reading text… ${Math.round(m.progress * 100)}%`)
      }
    },
  })
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: '6', // assume a uniform block of text (tables)
      preserve_interword_spaces: '1',
    })
    const { data } = await worker.recognize(canvas)
    return String(data?.text ?? '')
  } finally {
    await worker.terminate()
  }
}

function loadImageElement(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read the image.')) }
    img.src = url
  })
}

async function ocrImageFile(file: Blob, onProgress?: ExtractProgress): Promise<string> {
  onProgress?.('Preparing image…')
  const img = await loadImageElement(file)
  const canvas = toOcrCanvas(img, img.naturalWidth, img.naturalHeight)
  return ocrCanvas(canvas, onProgress)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPdfjs(): Promise<any> {
  const pdfjs = await import('pdfjs-dist')
  // Worker is served from /public (already shipped for the old flow).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfjs as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  return pdfjs
}

async function extractPdf(file: File, onProgress?: ExtractProgress): Promise<string> {
  onProgress?.('Opening PDF…')
  const pdfjs = await getPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const pageCount = Math.min(pdf.numPages, 15)

  // 1) Try the embedded text layer (decimal-perfect, no OCR).
  let textLayer = ''
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const line = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ')
    textLayer += line + '\n'
  }
  if (hasUsableText(textLayer)) {
    onProgress?.('Text extracted from PDF')
    return textLayer.trim()
  }

  // 2) Scanned PDF — rasterize pages and OCR (cap pages to bound time).
  onProgress?.('Scanned PDF detected — running OCR…')
  const ocrPages = Math.min(pdf.numPages, 5)
  let ocrText = ''
  for (let i = 1; i <= ocrPages; i++) {
    onProgress?.(`Reading page ${i} of ${ocrPages}…`)
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    const pageText = await ocrCanvas(canvas, onProgress)
    if (pageText.trim()) ocrText += pageText.trim() + '\n'
  }
  return ocrText.trim()
}

function readAsText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsText(file)
  })
}

/**
 * Extract plain text from any supported upload, entirely in the browser.
 * Returns the extracted text (which the caller posts to /api/analyze as rawText).
 */
export async function extractTextFromFile(file: File, onProgress?: ExtractProgress): Promise<string> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractPdf(file, onProgress)
  }
  if (file.type.startsWith('image/')) {
    return ocrImageFile(file, onProgress)
  }
  return readAsText(file)
}
