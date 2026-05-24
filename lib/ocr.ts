import { createWorker, Worker } from 'tesseract.js'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ocrWithVision } from './ocrVision'
const execFileAsync = promisify(execFile)

let sharedWorker: Worker | null = null
let initializing: Promise<void> | null = null

// Detect if running on Vercel or similar serverless platform
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const isServerless = isVercel || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

function resolveTesseractWorkerPath(): string | undefined {
  const tryResolve = (p: string): string | undefined => {
    try {
      // Use eval to prevent bundlers from statically resolving this at build time
      // which would cause module-not-found errors during Next/Turbopack compilation.
      // eslint-disable-next-line no-eval
      return (eval("require.resolve"))(p)
    } catch (_) {
      return undefined
    }
  }

  // Try several candidate locations inside the tesseract.js package
  const candidates = [
    'tesseract.js/src/worker-script/node/index.js',
    'tesseract.js/worker-script/node/index.js',
  ]
  for (const c of candidates) {
    const r = tryResolve(c)
    if (r) return r
  }

  // Fallback: resolve package root then construct path relative to it
  const root = tryResolve('tesseract.js')
  if (root) {
    return path.join(path.dirname(root), 'worker-script', 'node', 'index.js')
  }

  return undefined
}

async function ensureWorker(): Promise<Worker> {
  if (sharedWorker) return sharedWorker
  if (!initializing) {
    initializing = (async () => {
      const workerPath = resolveTesseractWorkerPath()
      const tryResolve = (p: string): string | undefined => {
        try {
          // eslint-disable-next-line no-eval
          return (eval("require.resolve"))(p)
        } catch (_) {
          return undefined
        }
      }

      // Try to locate tesseract-core.wasm so the worker doesn't try to fetch it
      const coreCandidates = [
        'tesseract.js-core/tesseract-core.wasm',
        'tesseract.js-core/dist/tesseract-core.wasm',
        'tesseract-core/tesseract-core.wasm',
      ]
      let corePath: string | undefined
      for (const c of coreCandidates) {
        const r = tryResolve(c)
        if (r) {
          corePath = r
          break
        }
      }

      const createOpts: Record<string, unknown> = {}
      if (workerPath) {
        createOpts.workerPath = workerPath
        // In Node we don't want blob URLs
        createOpts.workerBlobURL = false
      }
      if (corePath) {
        // Provide absolute wasm file path so tesseract core can read it directly
        createOpts.corePath = corePath
      }

      const w = createWorker(createOpts)
      await w.load()
      await w.loadLanguage('eng')
      await w.initialize('eng')
      sharedWorker = w
    })()
  }
  await initializing
  if (!sharedWorker) throw new Error('OCR worker failed to initialize')
  return sharedWorker
}

export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  // Priority 1: Try AI vision model (Transformers.js - runs locally, no API calls)
  try {
    const text = await ocrWithVision(buffer)
    if (text && text.length > 10) {
      return text
    }
    console.log('[OCR] Vision model returned empty/short text, trying fallback...')
  } catch (visionErr) {
    console.warn('[OCR] Vision model failed:', visionErr)
  }

  // Priority 2: Try system tesseract CLI (best for Docker/Railway/local development)
  const isNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node)
  if (isNode && !isServerless) {
    try {
      const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocr-'))
      const imgPath = path.join(tmpdir, 'img')
      const pngPath = imgPath + '.png'
      await fs.writeFile(pngPath, Buffer.from(buffer))
      const execOpts = { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 60_000 }
      try {
        const { stdout } = await execFileAsync('tesseract', [pngPath, 'stdout', '-l', 'eng'], execOpts)
        return String(stdout ?? '')
      } finally {
        try { await fs.rm(tmpdir, { recursive: true, force: true }) } catch (_) {}
      }
    } catch (cliErr) {
      // If the system `tesseract` binary isn't installed (ENOENT), try
      // initializing the tesseract.js worker as a fallback. This allows
      // deployments without the CLI to still perform OCR if the wasm core
      // is available via node_modules.
      if ((cliErr as any)?.code === 'ENOENT') {
        // Continue to WASM fallback below
      } else {
        console.error('tesseract CLI fallback failed on Node:', cliErr)
        throw cliErr
      }
    }
  }

  // Priority 3: Try tesseract.js in-process with proper WASM loading
  if (isNode) {
    console.log('[OCR] Using local tesseract.js in-process')
    try {
      const { createWorker } = await import('tesseract.js')
      
      const workerOpts: any = {
        logger: () => {}, // Suppress logs
        cachePath: path.join(os.tmpdir(), '.tesseract-cache'),
      }
      
      // Manually construct worker path from node_modules
      // Don't use require.resolve() as it returns virtual Turbopack paths
      const possibleWorkerPaths = [
        path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js'),
        path.join(process.cwd(), 'node_modules', '.pnpm', 'tesseract.js@2.1.5', 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js'),
      ]
      
      for (const p of possibleWorkerPaths) {
        if (await fs.stat(p).then(() => true).catch(() => false)) {
          console.log('[OCR] Found worker script at:', p)
          workerOpts.workerPath = p
          workerOpts.workerBlobURL = false
          break
        }
      }
      
      // Use local WASM file from public folder
      const publicWasm = path.join(process.cwd(), 'public', 'tesseract-core.wasm')
      if (await fs.stat(publicWasm).then(() => true).catch(() => false)) {
        console.log('[OCR] Found local WASM at:', publicWasm)
        workerOpts.corePath = publicWasm
      }
      
      console.log('[OCR] Creating worker...')
      const worker = await createWorker(workerOpts)
      
      try {
        console.log('[OCR] Loading tessdata...')
        await worker.load()
        await worker.loadLanguage('eng')
        await worker.initialize('eng')
        
        console.log('[OCR] Recognizing text...')
        const { data } = await worker.recognize(Buffer.from(buffer))
        const text = data?.text ?? ''
        
        console.log('[OCR] Successfully extracted text, length:', text.length)
        await worker.terminate()
        return text
      } catch (err) {
        console.warn('[OCR] Worker recognition failed:', err)
        try { await worker.terminate() } catch (_) {}
        return ''
      }
    } catch (importErr) {
      console.warn('[OCR] Failed to load tesseract.js:', importErr)
      return ''
    }
  }

  // All methods failed - return empty string
  return ''
}

export async function shutdownOcrWorker(): Promise<void> {
  if (sharedWorker) {
    try { await sharedWorker.terminate() } catch (_) {}
    sharedWorker = null
    initializing = null
  }
}
