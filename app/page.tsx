'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/upload.module.scss'

type Gender = 'unknown' | 'female' | 'male'

export default function HomePage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

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
    if (!text) {
      setError('Please enter your lab values or upload a file.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rawText: text, gender }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      if (!data.results || data.results.length === 0) {
        setError(
          'No recognizable lab values found. Try typing them like: "Hemoglobin 11.2, MCV 74, WBC 6.4"'
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
        </div>
      </nav>

      <main className={styles.main}>

        {/* Hero */}
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Lab Report Explainer</p>
          <h1 className={styles.title}>
            Your blood test,<br /><em>finally explained.</em>
          </h1>
          <p className={styles.subtitle}>
            Paste your lab values or upload a report. We explain every number in plain
            language, flag what needs attention, and give you the right questions for your doctor.
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
            <p className={styles.uploadTitle}>Drop your lab report here</p>
            <p className={styles.uploadSub}>TXT or CSV file · values extracted automatically</p>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.text"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </div>

          <div className={styles.divider}>or type / paste your values</div>

          <textarea
            className={styles.textarea}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="e.g. Hemoglobin 11.2, MCV 74, MCH 23, WBC 6.4, Platelets 210, TSH 3.2, ALT 35 ..."
            rows={4}
          />

          {error && <div className={styles.errorBox}>{error}</div>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading || !rawText.trim()}
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
