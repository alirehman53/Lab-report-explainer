const fs = require('fs')
const path = require('path')

function tryResolve(p) {
  try { return require.resolve(p) } catch (e) { return undefined }
}

const candidates = [
  'tesseract.js-core/dist/tesseract-core.wasm',
  'tesseract.js-core/tesseract-core.wasm',
  'tesseract-core/tesseract-core.wasm'
]

let src
for (const c of candidates) {
  const r = tryResolve(c)
  if (r) { src = r; break }
}

if (!src) {
  console.log('copy-tesseract-wasm: no wasm found in node_modules')
  process.exit(0)
}

const destDir = path.join(process.cwd(), 'public')
try { fs.mkdirSync(destDir, { recursive: true }) } catch (e) {}
const dest = path.join(destDir, 'tesseract-core.wasm')
try {
  fs.copyFileSync(src, dest)
  console.log('copy-tesseract-wasm: copied', src, '->', dest)
} catch (e) {
  console.warn('copy-tesseract-wasm: failed to copy wasm:', e)
}
