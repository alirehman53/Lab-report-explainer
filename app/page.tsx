'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/upload.module.scss'

type Gender = 'unknown' | 'female' | 'male'

export default function HomePage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [rawText,   setRawText]   = useState('')
  const [gender,    setGender]    = useState<Gender>('unknown')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [dragging,  setDragging]  = useState(false)

  // ── File reading ────────────────────────────────────────────────────────

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Could not read file'))
      reader.readAsText(file)
    })
  }

  async function handleFile(file: File) {
    if (!file) return
    try {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        // image or PDF — set preview and keep for upload (PDF shows a preview link)
        const url = URL.createObjectURL(file)
        setImagePreview(url)
        setImageFile(file)
        return
      }

      const text = await readFileAsText(file)
      setRawText(prev => (prev ? prev + '\n' + text : text))
    } catch {
      setError('Could not read file. Try copying and pasting your values instead.')
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // ── Drag and drop ───────────────────────────────────────────────────────

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setError('')
    const text = rawText.trim()
    if (!text && !imageFile) {
      setError('Please enter your report text, upload a file, or upload an image.')
      return
    }

    setLoading(true)
    try {
      let res: Response
      if (imageFile && !text) {
        const form = new FormData()
        form.append('file', imageFile)
        form.append('gender', gender)
        res = await fetch('/api/analyze', { method: 'POST', body: form })
      } else {
        res = await fetch('/api/analyze', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ rawText: text, gender }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      // If server returns the PDF-extraction placeholder, show inline guidance instead of navigating
      if (Array.isArray(data.results)) {
        const pdfPlaceholder = data.results.find(
          (r: any) => r && (r.markerId === 'uploaded-pdf' || r.markerId === 'uploaded-image') && typeof r.findingText === 'string' && r.findingText.includes('Could not extract selectable text')
        )
        if (pdfPlaceholder) {
          setError(pdfPlaceholder.findingText)
          setLoading(false)
          return
        }
      }

      if (!data.results || data.results.length === 0) {
        setError(
          'No recognizable values found. Try typing examples or paste a short excerpt like: "Hemoglobin 11.2, MCV 74" or "Urinalysis: leukocyte esterase positive"'
        )
        return
      }

      // Store result in sessionStorage and navigate to results page
      sessionStorage.setItem('labAnalysis', JSON.stringify(data))
      router.push('/results')

    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Quick examples / helpers ───────────────────────────────────────────
  const examples = [
    'Hemoglobin 11.2, MCV 74, MCH 23, WBC 6.4',
    'Urinalysis: leukocyte esterase positive, nitrites positive, RBC 5-10/HPF',
    'Chest X-ray: cardiomegaly, mild pulmonary congestion',
  ]

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setRawText(prev => (prev ? prev + '\n' + text : text))
    } catch {
      setError('Could not access clipboard. Paste manually instead.')
    }
  }

  function clearInput() {
    setRawText('')
    setError('')
  }

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
          </div>
          <span className={styles.logoText}>Lab<span>Lens</span></span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navBadge}>Free · No signup</span>
          <button
            className={styles.navCta}
            onClick={() => {
              textareaRef.current?.focus();
              textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          >
            New analysis
          </button>
          <button className={styles.secondaryBtn} onClick={() => router.push('/about')}>About</button>
        </div>
      </nav>

      <main className={styles.main}>

        {/* Hero */}
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Medical Report Explainer</p>
          <h1 className={styles.title}>
            Your medical reports,<br /><em>clearly explained.</em>
          </h1>
          <p className={styles.subtitle}>
            Paste values or upload any medical test report (blood, urine, imaging, microbiology).
            We explain findings in plain language, highlight important flags, and suggest questions for your clinician.
          </p>
        </div>

        {/* Upload card */}
        <div className={styles.uploadCard}>

          {/* Gender selector */}
          <div>
            <span className={styles.genderLabel}>Your biological sex (for accurate reference ranges)</span>
            <div className={styles.genderRow}>
              {(['unknown', 'female', 'male'] as Gender[]).map(g => (
                <button
                  key={g}
                  className={`${styles.genderBtn} ${gender === g ? styles.active : ''}`}
                  onClick={() => setGender(g)}
                >
                  {g === 'unknown' ? "Don't specify" : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            aria-label="Upload lab report file"
          >
            <div className={styles.uploadIcon}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className={styles.uploadTitle}>Drop your medical report here</p>
            <p className={styles.uploadSub}>TXT, CSV, or plain text · values and findings extracted automatically</p>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.text,image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </div>

          {imagePreview && (
            <div className={styles.imagePreviewWrap}>
              {imageFile?.type === 'application/pdf' ? (
                <div>
                  <a href={imagePreview} target="_blank" rel="noreferrer" className={styles.pdfPreviewLink}>Preview PDF</a>
                </div>
              ) : (
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              )}
              <div style={{ marginTop: 8 }}>
                <button className={styles.secondaryBtn} onClick={() => { setImagePreview(null); setImageFile(null) }}>
                  Remove image
                </button>
                <span style={{ marginLeft: 12, color: 'var(--color-ink-muted)' }}>OCR extraction is not available yet.</span>
              </div>
            </div>
          )}

          <div className={styles.divider}>or type / paste your values</div>

          <textarea
            className={styles.textarea}
            ref={textareaRef}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="e.g. Hemoglobin 11.2, MCV 74, Urinalysis: leukocyte esterase positive, Chest X-ray: cardiomegaly ..."
            rows={4}
          />

          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.helperRow}>
            <div className={styles.chips}>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className={styles.chip}
                  onClick={() => setRawText(prev => (prev ? prev + '\n' + ex : ex))}
                >
                  {ex.split(',')[0]}
                </button>
              ))}
            </div>
            <div className={styles.helperBtns}>
              <button className={styles.secondaryBtn} onClick={pasteFromClipboard}>
                Paste from clipboard
              </button>
              <button className={styles.secondaryBtn} onClick={clearInput}>
                Clear
              </button>
            </div>
          </div>

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading || (!rawText.trim() && !imageFile)}
          >
            {loading ? (
              <span className={styles.loadingText}>
                <span className={styles.spinner} />
                Analyzing your results…
              </span>
            ) : (
              'Explain my results →'
            )}
          </button>
        </div>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>6B+</span>
            <span className={styles.statLabel}>lab tests done globally every year</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>~3 min</span>
            <span className={styles.statLabel}>avg time doctor spends explaining</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>78%</span>
            <span className={styles.statLabel}>of patients leave confused</span>
          </div>
        </div>

      </main>
    </div>
  )
}
