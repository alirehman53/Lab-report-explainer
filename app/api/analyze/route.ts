import { NextRequest, NextResponse } from 'next/server'
import { analyzeReport } from '@/lib/fallback'
import { Gender } from '@/types/lab'

export async function POST(req: NextRequest) {
  try {
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
