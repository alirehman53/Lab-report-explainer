import { NextRequest, NextResponse } from 'next/server'
import { analyzeReport } from '@/lib/fallback'
import { ocrBuffer } from '@/lib/ocr'
import { Gender } from '@/types/lab'

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || ''

    // Handle multipart/form-data (image uploads)
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      const gender = (form.get('gender') as string) as Gender | undefined

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
      }

      // If the upload is an image, attempt OCR using tesseract.js
      if (file.type?.startsWith('image/')) {
        try {
          const buffer = await file.arrayBuffer()
          const text = await ocrBuffer(buffer)
          if (text && text.trim().length > 5) {
            const analysis = await analyzeReport(text, gender ?? 'unknown')
            return NextResponse.json(analysis)
          }
        } catch (err) {
          console.error('[/api/analyze] OCR failed:', err)
          // fall through to placeholder below
        }
      }

      // If the upload is a PDF, try converting to PNG and OCR the first page
      if (file.type === 'application/pdf') {
        try {
          const pdfBuf = await file.arrayBuffer()
          const { extractPdfText } = await import('@/lib/pdfText')
          const extracted = await extractPdfText(pdfBuf)

          if (extracted && extracted.trim().length > 20) {
            const analysis = await analyzeReport(extracted, gender ?? 'unknown')
            return NextResponse.json(analysis)
          }

          // No selectable text — try extracting embedded images from the PDF and OCR them
          try {
            const { extractImagesFromPdf } = await import('@/lib/pdfImages')
            const images = await extractImagesFromPdf(pdfBuf)
            if (images && images.length > 0) {
              let allText = ''
              for (const imgBytes of images) {
                try {
                  const text = await ocrBuffer(imgBytes.buffer as ArrayBuffer)
                  if (text && text.trim().length > 0) allText += '\n\n' + text.trim()
                } catch (e) {
                  console.warn('[/api/analyze] OCR on embedded image failed:', e)
                }
              }

              if (allText.trim().length > 20) {
                const analysis = await analyzeReport(allText.trim(), gender ?? 'unknown')
                return NextResponse.json(analysis)
              }
            }
          } catch (e) {
            console.warn('[/api/analyze] extracting embedded images failed:', e)
          }

          // If we reach here, no selectable text and no embedded images produced usable OCR
          return NextResponse.json({
            error: 'This PDF appears to be a scanned image or contains embedded images we could not OCR. Please upload a PNG/JPEG photo of the report or paste the values as text. For automatic PDF→image conversion, enable Poppler (pdftoppm) on the server.',
          }, { status: 422 })

        } catch (err) {
          console.error('[/api/analyze] PDF extraction failed:', err)
          return NextResponse.json({
            error: 'Could not read this PDF. Please upload a photo (PNG/JPEG) of the report or paste the values directly.',
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
    const { rawText, gender } = body as { rawText: string; gender?: Gender }

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

    const analysis = await analyzeReport(rawText.trim(), gender ?? 'unknown')

    return NextResponse.json(analysis)

  } catch (err) {
    console.error('[/api/analyze] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
