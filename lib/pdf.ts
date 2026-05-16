import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { spawnSync } from 'child_process'

export async function pdfToPng(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const tmp = tmpdir()
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
  const pdfPath = join(tmp, `upload-${id}.pdf`)
  const outPrefix = join(tmp, `out-${id}`)
  const outPng = `${outPrefix}.png` // pdftoppm with -singlefile creates this

  try {
    await fs.writeFile(pdfPath, Buffer.from(pdfBuffer))

    // Run pdftoppm -png -singlefile input.pdf outPrefix
    const res = spawnSync('pdftoppm', ['-png', '-singlefile', pdfPath, outPrefix], { encoding: 'utf8', timeout: 30000 })
    if (res.error) {
      throw res.error
    }
    if (res.status !== 0) {
      throw new Error(`pdftoppm failed: ${res.stderr || res.stdout}`)
    }

    const png = await fs.readFile(outPng)
    return new Uint8Array(png)
  } finally {
    // cleanup best-effort
    try { await fs.unlink(pdfPath) } catch (_) {}
    try { await fs.unlink(outPng) } catch (_) {}
  }
}

export function isPdftoppmAvailable(): boolean {
  try {
    const res = spawnSync('pdftoppm', ['-v'], { encoding: 'utf8', timeout: 5000 })
    // Some pdftoppm versions return status 0 and print version to stderr/stdout
    return res.status === 0 || res.stdout?.length > 0 || res.stderr?.length > 0
  } catch (err) {
    return false
  }
}
