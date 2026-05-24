#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

// Suppress unhandled rejections and exceptions immediately
// Exit gracefully to prevent Node from printing error traces
process.on('unhandledRejection', (reason) => {
  process.exit(0)
})
process.on('uncaughtException', (err) => {
  process.exit(0)
})

// CRITICAL: Set up fetch polyfill FIRST, before any other modules load
// This prevents "TypeError: fetch failed" from appearing in stdout
const debugLog = []
if (typeof globalThis.fetch === 'function') {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async function(url, ...args) {
    // Log all fetch attempts for debugging
    debugLog.push(`FETCH: ${url}`)
    
    // Handle file:// URLs by reading from filesystem
    if (typeof url === 'string' && url.startsWith('file://')) {
      try {
        const filePath = url.replace('file://', '').replace(/^\/([A-Z]:)/, '$1')
        debugLog.push(`FILE: ${filePath}`)
        const buffer = fs.readFileSync(filePath)
        debugLog.push(`READ: ${buffer.length} bytes`)
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          blob: async () => new Blob([buffer]),
          text: async () => buffer.toString('utf8'),
          json: async () => JSON.parse(buffer.toString('utf8'))
        }
      } catch (err) {
        debugLog.push(`ERROR: ${err.message}`)
        // Return empty response instead of throwing
        return {
          ok: false,
          status: 500,
          arrayBuffer: async () => new ArrayBuffer(0),
          text: async () => '',
        }
      }
    }
    // Wrap original fetch to catch and suppress errors
    try {
      return await originalFetch(url, ...args)
    } catch (err) {
      debugLog.push(`FETCH_ERROR: ${err.message}`)
      // Return empty response instead of throwing
      return {
        ok: false,
        status: 500,
        arrayBuffer: async () => new ArrayBuffer(0),
        text: async () => '',
      }
    }
  }
}

// Suppress all console output during tesseract initialization
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.log = () => {}
console.error = () => {}
console.warn = () => {}

async function main() {
  const img = process.argv[2]
  if (!img) {
    console.error('Missing image path')
    process.exit(2)
  }

  try {
    const { createWorker } = require('tesseract.js')

    const tryResolve = (p) => {
      try {
        return require.resolve(p)
      } catch (e) {
        return undefined
      }
    }

    const candidates = [
      'tesseract.js/src/worker-script/node/index.js',
      'tesseract.js/worker-script/node/index.js'
    ]
    let workerPath
    for (const c of candidates) {
      const r = tryResolve(c)
      if (r) {
        workerPath = r
        break
      }
    }
    if (!workerPath) {
      const root = tryResolve('tesseract.js')
      if (root) workerPath = path.join(path.dirname(root), 'worker-script', 'node', 'index.js')
    }

    const coreCandidates = [
      'tesseract.js-core/tesseract-core.wasm',
      'tesseract.js-core/dist/tesseract-core.wasm',
      'tesseract-core/tesseract-core.wasm'
    ]
    let corePath
    for (const c of coreCandidates) {
      const r = tryResolve(c)
      if (r) {
        corePath = r
        break
      }
    }

    // Also prefer a bundled wasm in the project's public/ folder if present
    try {
      const publicPath = path.join(process.cwd(), 'public', 'tesseract-core.wasm')
      if (!corePath && fs.existsSync(publicPath)) {
        corePath = publicPath
        debugLog.push(`FOUND_PUBLIC_WASM: ${publicPath}`)
      }
    } catch (e) {
      // ignore
    }

    const createOpts = {
      // Reduce logging for cleaner output
      logger: () => {},
      // Optimize for serverless (faster cold starts)
      cachePath: path.join(require('os').tmpdir(), '.tesseract-cache'),
    }
    
    if (workerPath) {
      createOpts.workerPath = workerPath
      createOpts.workerBlobURL = false
    }
    
    // Use the WASM file we found
    if (corePath) {
      debugLog.push(`SETTING_CORE_PATH: ${corePath}`)
      createOpts.corePath = corePath
    } else {
      debugLog.push(`NO_CORE_PATH_FOUND`)
    }

    const worker = createWorker(createOpts)
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const { data } = await worker.recognize(img)
    
    // Restore console ONLY for final output
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    
    // Output ONLY the OCR text to stdout
    console.log(data?.text || '')
    try { await worker.terminate() } catch (_) {}
    process.exit(0)
  } catch (err) {
    // Restore console and output debug log
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    console.error('[OCR DEBUG]', debugLog.join(' | '))
    console.error('[OCR ERROR]', err.message)
    process.exit(0)
  }
}

main().catch((err) => {
  // Restore console and output debug log
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.error('[OCR DEBUG]', debugLog.join(' | '))
  console.error('[OCR MAIN ERROR]', err?.message || err)
  process.exit(0)
})
