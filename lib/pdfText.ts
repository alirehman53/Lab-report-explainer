/**
 * Extract text from PDF using pdf-parse library
 * Works reliably in Node.js without worker issues
 */

export async function extractPdfText(buffer: ArrayBuffer, maxPages = 3): Promise<string> {
  try {
    // Use pdf-parse - simple and reliable for Node.js
    // Use dynamic require for CommonJS module
    const pdfParse = require('pdf-parse')
    
    // Convert ArrayBuffer to Buffer
    const pdfBuffer = Buffer.from(buffer)
    
    // Parse PDF
    const data = await pdfParse(pdfBuffer, {
      max: maxPages, // Limit to first N pages for performance
    })
    
    console.log('[PDF] Extracted text from', data.numpages, 'pages')
    return data.text || ''
  } catch (err) {
    console.error('[PDF] pdf-parse failed:', err)
    
    // Fallback: try pdf-lib for text extraction
    try {
      console.log('[PDF] Trying fallback with pdf-lib...')
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPages()
      const texts: string[] = []
      
      // pdf-lib doesn't extract text directly, but we can try
      // This is a basic fallback - won't work for all PDFs
      for (let i = 0; i < Math.min(pages.length, maxPages); i++) {
        // pdf-lib doesn't have built-in text extraction
        // Return empty string to trigger image extraction fallback
        console.log('[PDF] pdf-lib cannot extract text, will try image extraction')
        return ''
      }
      
      return texts.join('\n\n')
    } catch (fallbackErr) {
      console.error('[PDF] All text extraction methods failed:', fallbackErr)
      throw new Error('Could not extract text from PDF')
    }
  }
}
