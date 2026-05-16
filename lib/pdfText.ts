import type { PDFDocumentProxy } from 'pdfjs-dist'

// export async function extractPdfText(buffer: ArrayBuffer, maxPages = 3): Promise<string> {
//   // Dynamically import to avoid bundling issues
//   const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js')

//   // Disable worker usage on the server to avoid requiring pdf.worker.js and canvas native bindings
//   ;(pdfjs as any).GlobalWorkerOptions = (pdfjs as any).GlobalWorkerOptions || {}
//   ;(pdfjs as any).GlobalWorkerOptions.workerSrc = ''
//   const loadingTask = (pdfjs as any).getDocument({ data: buffer, disableWorker: true })
//   const doc: PDFDocumentProxy = await loadingTask.promise
//   const pageCount = Math.min(doc.numPages, maxPages)
//   const texts: string[] = []

//   for (let i = 1; i <= pageCount; i++) {
//     const page = await doc.getPage(i)
//     const content = await page.getTextContent()
//     const pageText = content.items.map((it: any) => it.str).join(' ')
//     if (pageText && pageText.trim().length > 0) texts.push(pageText.trim())
//   }

//   await doc.destroy()
//   return texts.join('\n\n')
// }


// lib/pdfText.ts
// Uses pdf-parse — a reliable Node.js PDF text extractor with no native deps

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: Buffer.from(buffer) })
  const result = await parser.getText()
  return result.text ?? ''
}
