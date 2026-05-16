import { createWorker, Worker } from 'tesseract.js'
import path from 'path'

let sharedWorker: Worker | null = null
let initializing: Promise<void> | null = null

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
      const createOpts: Record<string, unknown> = {}
      if (workerPath) {
        createOpts.workerPath = workerPath
        // In Node we don't want blob URLs
        createOpts.workerBlobURL = false
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
  const worker = await ensureWorker()
  const res = await worker.recognize(Buffer.from(buffer))
  return res?.data?.text ?? ''
}

export async function shutdownOcrWorker(): Promise<void> {
  if (sharedWorker) {
    try { await sharedWorker.terminate() } catch (_) {}
    sharedWorker = null
    initializing = null
  }
}
