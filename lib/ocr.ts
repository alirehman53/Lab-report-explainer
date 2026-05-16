import { createWorker, Worker } from 'tesseract.js'

let sharedWorker: Worker | null = null
let initializing: Promise<void> | null = null

async function ensureWorker(): Promise<Worker> {
  if (sharedWorker) return sharedWorker
  if (!initializing) {
    initializing = (async () => {
      const w = createWorker()
      await w.load()
      await w.loadLanguage('eng')
      await w.initialize('eng')
      sharedWorker = w
    })()
  }
  await initializing
  // TypeScript: ensure non-null before returning
  if (!sharedWorker) throw new Error('OCR worker failed to initialize')
  return sharedWorker
}

export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  const worker = await ensureWorker()
  const res = await worker.recognize(Buffer.from(buffer))
  return res?.data?.text ?? ''
}

// Optional helper to terminate the worker (not used by default)
export async function shutdownOcrWorker(): Promise<void> {
  if (sharedWorker) {
    try { await sharedWorker.terminate() } catch (_) {}
    sharedWorker = null
    initializing = null
  }
}
