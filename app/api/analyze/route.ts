import { NextRequest, NextResponse } from 'next/server'
import { analyzeReport } from '@/lib/fallback'
import { ocrBuffer } from '@/lib/ocr'
import { PatientContext } from '@/types/lab'

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || ''

    // Handle multipart/form-data (image uploads)
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      const gender = (form.get('gender') as string) || 'unknown'
      const ageStr = form.get('age') as string | null
      const age = ageStr ? parseInt(ageStr, 10) : undefined
      
      const context: PatientContext = {
        gender: gender as 'male' | 'female' | 'unknown',
        age: age && age > 0 && age < 120 ? age : undefined
      }

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
      }

      // Check if file is empty
      if (file.size === 0) {
        console.error('[/api/analyze] File is empty (0 bytes)')
        return NextResponse.json({ 
          error: 'Uploaded file is empty (0 bytes). Please check your upload and try again.' 
        }, { status: 400 })
      }

      console.log('[/api/analyze] File size:', file.size, 'bytes')

      // If the upload is an image, attempt OCR using tesseract.js
      if (file.type?.startsWith('image/')) {
        try {
          console.log('[/api/analyze] Processing image upload:', file.name, file.type)
          const buffer = await file.arrayBuffer()
          console.log('[/api/analyze] Buffer size:', buffer.byteLength)
          const text = await ocrBuffer(buffer)
          console.log('[/api/analyze] OCR extracted text length:', text?.length || 0)
          console.log('[/api/analyze] OCR first 200 chars:', text?.substring(0, 200))
          if (text && text.trim().length > 5) {
            console.log('[/api/analyze] Analyzing OCR text...')
            const analysis = await analyzeReport(text, context)
            console.log('[/api/analyze] Analysis complete, results:', analysis.results.length)
            return NextResponse.json(analysis)
          } else {
            console.warn('[/api/analyze] OCR text too short or empty')
          }
        } catch (err) {
          console.error('[/api/analyze] OCR failed:', err)
          // fall through to placeholder below
        }
      }

      // If the upload is a PDF, extract text and analyze
      if (file.type === 'application/pdf') {
        try {
          console.log('[/api/analyze] Processing PDF upload:', file.name, file.type)
          const pdfBuf = await file.arrayBuffer()
          console.log('[/api/analyze] PDF buffer size:', pdfBuf.byteLength)
          
          if (pdfBuf.byteLength === 0) {
            console.error('[/api/analyze] PDF buffer is empty after reading')
            return NextResponse.json({ 
              error: 'PDF file appears to be empty. Please check the file and try uploading again.' 
            }, { status: 400 })
          }
          
          const { extractPdfText } = await import('@/lib/pdfText')
          const extracted = await extractPdfText(pdfBuf)
          console.log('[/api/analyze] PDF extracted text length:', extracted?.length || 0)
          console.log('[/api/analyze] PDF first 200 chars:', extracted?.substring(0, 200))

          if (extracted && extracted.trim().length > 20) {
            console.log('[/api/analyze] Analyzing PDF text...')
            const analysis = await analyzeReport(extracted, context)
            console.log('[/api/analyze] PDF analysis complete, results:', analysis.results.length)
            return NextResponse.json(analysis)
          }

          // No selectable text — try extracting embedded images from the PDF and OCR them
          console.log('[/api/analyze] No selectable text in PDF, trying embedded images...')
          try {
            const { extractImagesFromPdf } = await import('@/lib/pdfImages')
            const images = await extractImagesFromPdf(pdfBuf)
            console.log('[/api/analyze] Found', images?.length || 0, 'embedded images in PDF')
            
            if (images && images.length > 0) {
              let allText = ''
              for (let i = 0; i < images.length; i++) {
                const imgBytes = images[i]
                try {
                  console.log(`[/api/analyze] OCRing embedded image ${i + 1}/${images.length}...`)
                  const text = await ocrBuffer(imgBytes.buffer as ArrayBuffer)
                  console.log(`[/api/analyze] Image ${i + 1} extracted text length:`, text?.length || 0)
                  if (text && text.trim().length > 0) allText += '\n\n' + text.trim()
                } catch (e) {
                  console.warn(`[/api/analyze] OCR on embedded image ${i + 1} failed:`, e)
                }
              }

              if (allText.trim().length > 20) {
                console.log('[/api/analyze] Analyzing text from embedded images...')
                const analysis = await analyzeReport(allText.trim(), context)
                console.log('[/api/analyze] PDF image analysis complete, results:', analysis.results.length)
                
                // Only return if we actually found lab results, not just random text from logos
                if (analysis.results.length > 0 || analysis.qualitativeResults?.length > 0) {
                  return NextResponse.json(analysis)
                } else {
                  console.log('[/api/analyze] Embedded images produced text but no lab results found, continuing to page rendering...')
                }
              } else {
                console.log('[/api/analyze] Embedded images produced insufficient text')
              }
            }
          } catch (e) {
            console.warn('[/api/analyze] Extracting embedded images failed:', e)
          }

          // If all methods fail, return helpful error
          // Note: PDFs are now converted to images client-side before upload
          console.log('[/api/analyze] All PDF extraction methods exhausted')
          return NextResponse.json({
            error: 'Unable to extract text from this PDF. The file may be corrupted or password-protected.',
          }, { status: 422 })

        } catch (err) {
          console.error('[/api/analyze] PDF extraction error:', err)
          const errorMsg = err instanceof Error ? err.message : String(err)
          return NextResponse.json({
            error: `Failed to process PDF: ${errorMsg}. Please try uploading the report as an image (PNG/JPEG) or paste the values as text.`,
          }, { status: 422 })
        }
      }

      // For PDFs or failed OCR, return placeholder finding so UI can show it.
      const analysis = {
        results: [
          {
            kind: 'finding',
            markerId: 'uploaded-image',
            displayName: 'Uploaded File',
            fullName: 'Uploaded File',
            findingText: `Received ${file.name} (${file.type}). OCR extraction failed or is not available for this file type. Please paste text instead or try an image/photo of the report.`,
            explanation: 'File uploaded. OCR extraction may not be available for this file type.',
            severity: 1,
            category: 'other'
          }
        ],
        detectedPatterns: [],
        doctorQuestions: [],
        summary: { normal: 0, low: 0, high: 0, critical: 0 },
        source: 'offline'
      }

      return NextResponse.json(analysis)
    }

    const body = await req.json()
    const { rawText, gender, age } = body as { rawText: string; gender?: string; age?: number }
    
    const context: PatientContext = {
      gender: (gender as 'male' | 'female' | 'unknown') ?? 'unknown',
      age: age && age > 0 && age < 120 ? age : undefined
    }

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No lab data provided.' },
        { status: 400 }
      )
    }

    if (rawText.length > 20000) {
      return NextResponse.json(
        { error: 'Input too large. Please paste key values only.' },
        { status: 400 }
      )
    }

    const analysis = await analyzeReport(rawText.trim(), context)

    return NextResponse.json(analysis)

  } catch (err) {
    console.error('[/api/analyze] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
