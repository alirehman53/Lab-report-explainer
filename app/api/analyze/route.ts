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
        // First try to extract embedded text using pdf.js (fast, no native deps)
        try {
          const pdfBuf = await file.arrayBuffer()
          const { extractPdfText } = await import('@/lib/pdfText')
          const extracted = await extractPdfText(pdfBuf)
          if (extracted && extracted.trim().length > 20) {
            const analysis = await analyzeReport(extracted, gender ?? 'unknown')
            return NextResponse.json(analysis)
          }
        } catch (err) {
          console.warn('[/api/analyze] pdf.js text extraction failed:', err)
          // We do not perform server-side PDF->image conversion. Ask user to upload an image or paste text.
          const analysis = {
            results: [
              {
                kind: 'finding',
                markerId: 'uploaded-pdf',
                displayName: 'Uploaded PDF',
                fullName: 'Uploaded PDF',
                findingText: `Received ${file.name} (${file.type}). Could not extract selectable text from this PDF. Please upload an image (PNG/JPEG) of the report or paste the report text directly.`,
                explanation: 'PDF text extraction failed; try uploading an image or pasting text.',
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
