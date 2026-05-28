'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/results.module.scss'
import { 
  AnalyzedResult, 
  AnalyzedQualitativeResult,
  MarkerCategory, 
  MarkerStatus,
  QualitativeStatus,
  ReportAnalysis 
} from '@/types/lab'

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<MarkerStatus, string> = {
  'normal':        '✓ Normal',
  'low':           '↓ Below normal',
  'high':          '↑ Above normal',
  'critical-low':  '⚠ Critically low',
  'critical-high': '⚠ Critically high',
}

const CATEGORY_LABEL: Record<MarkerCategory, string> = {
  cbc:                    'Complete Blood Count (CBC)',
  iron:                   'Iron Studies',
  liver:                  'Liver Panel',
  thyroid:                'Thyroid',
  kidney:                 'Kidney Function',
  lipid:                  'Lipid Panel',
  diabetes:               'Blood Sugar',
  electrolytes:           'Electrolytes',
  cardiac:                'Cardiac Markers',
  'hormones-female':      'Female Hormones',
  'hormones-male':        'Male Hormones',
  'hormones-adrenal':     'Adrenal Hormones',
  coagulation:            'Coagulation',
  'tumor-markers':        'Tumor Markers',
  'infectious-serology':  'Infectious Disease',
  autoimmune:             'Autoimmune',
  'urinalysis-numeric':   'Urinalysis (Numeric)',
  'urinalysis-qualitative': 'Urinalysis (Qualitative)',
  'bone-minerals':        'Bone & Minerals',
  'vitamins-nutrition':   'Vitamins & Nutrition',
  'allergy-immunology':   'Allergy & Immunology',
  'drug-monitoring':      'Drug Monitoring',
  'cardiac-markers':      'Cardiac Markers',
  stool:                  'Stool Analysis',
  csf:                    'CSF Analysis',
  derived:                'Calculated Values',
  imaging:                'Imaging & Radiology',
  microbiology:           'Microbiology & Cultures',
  other:                  'Other findings',
}

function cssStatus(status: MarkerStatus): string {
  if (status === 'critical-low')  return 'criticalLow'
  if (status === 'critical-high') return 'criticalHigh'
  return status
}

function isCritical(status: MarkerStatus): boolean {
  return status === 'critical-low' || status === 'critical-high'
}

// Group results by category
function groupByCategory(results: AnalyzedResult[]): Map<MarkerCategory, AnalyzedResult[]> {
  const map = new Map<MarkerCategory, AnalyzedResult[]>()
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, [])
    map.get(r.category)!.push(r)
  }
  return map
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBar({ result }: { result: AnalyzedResult }) {
  const cls = cssStatus(result.status ?? 'normal')
  const pct = `${Math.min(95, Math.max(5, result.percentPosition ?? 50))}%`

  return (
    <div className={styles.statusBarWrap}>
      <div className={styles.statusBar}>
        <div
          className={`${styles.statusFill} ${styles[cls]}`}
          style={{ width: pct }}
        />
        <div
          className={`${styles.statusDot} ${styles[cls]}`}
          style={{ left: pct }}
        />
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: AnalyzedResult }) {
  const cls    = cssStatus(result.status ?? 'normal')
  const crit   = isCritical(result.status ?? 'normal')

  return (
    <div className={`${styles.resultCard} ${crit ? styles.critical : ''}`}>
      <div className={styles.cardTop}>
        <div className={styles.markerInfo}>
          <div className={styles.markerName}>{result.displayName}</div>
          <div className={styles.markerFullName}>{result.fullName}</div>
        </div>
        <div className={styles.valueBlock}>
          <div className={`${styles.value} ${styles[cls]}`}>
            {result.value ?? '—'} {result.unit ?? ''}
          </div>
          <div className={styles.normalRange}>Normal: {result.normalRange ?? '—'}</div>
        </div>
      </div>

      <StatusBar result={result} />

      <span className={`${styles.statusBadge} ${styles[cls]}`}>
        {STATUS_LABEL[result.status ?? 'normal']}
      </span>

      <p className={styles.explanation}>{result.explanation}</p>
    </div>
  )
}

function QualitativeCard({ result }: { result: AnalyzedQualitativeResult }) {
  const getStatusColor = (status: QualitativeStatus, significance?: string): string => {
    if (status === 'negative') return 'negative'
    if (status === 'positive') {
      if (significance === 'urgent' || significance === 'action-required') return 'positive-urgent'
      return 'positive'
    }
    if (status === 'borderline') return 'borderline'
    if (status === 'trace') return 'trace'
    return 'info'
  }

  const getStatusLabel = (status: QualitativeStatus): string => {
    if (status === 'negative') return '− Negative'
    if (status === 'positive') return '+ Positive'
    if (status === 'borderline') return '~ Borderline'
    if (status === 'trace') return '± Trace'
    return 'ℹ Info'
  }

  const cls = getStatusColor(result.status, result.clinicalSignificance)
  const isUrgent = result.clinicalSignificance === 'urgent' || result.clinicalSignificance === 'action-required'

  return (
    <div className={`${styles.qualCard} ${isUrgent ? styles.urgent : ''}`}>
      <div className={styles.cardTop}>
        <div className={styles.markerInfo}>
          <div className={styles.markerName}>{result.displayName}</div>
          <div className={styles.markerFullName}>{result.fullName}</div>
        </div>
        <div className={styles.valueBlock}>
          <div className={`${styles.qualValue} ${styles[cls]}`}>
            {result.rawValue}
            {result.titreValue && <span className={styles.titre}> (titre: {result.titreValue})</span>}
          </div>
        </div>
      </div>

      <span className={`${styles.statusBadge} ${styles[cls]}`}>
        {getStatusLabel(result.status)}
      </span>

      <p className={styles.explanation}>{result.explanation}</p>

      {result.severity && typeof result.severity === 'string' && result.severity !== 'none' && (
        <div className={`${styles.severityNote} ${styles[result.severity]}`}>
          Severity: {result.severity}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('labAnalysis')
    if (!raw) {
      router.replace('/')
      return
    }
    try {
      setAnalysis(JSON.parse(raw))
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!analysis) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
          Loading…
        </div>
      </div>
    )
  }

  const { results, qualitativeResults, detectedPatterns, doctorQuestions, summary, source } = analysis

  const numericResults = results.filter(r => (r as any).value !== undefined) as AnalyzedResult[]
  const findings = results.filter(r => (r as any).kind === 'finding') as any[]
  const qualResults = qualitativeResults || []

  if (results.length === 0) {
    return (
      <div className={styles.page}>
        <nav className={styles.nav}>
          <NavLogo />
          <BackBtn router={router} />
        </nav>
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No values recognized</h2>
            <p>We couldn't identify any lab markers. Try typing them like:<br />"Hemoglobin 11.2, MCV 74, WBC 6.4"</p>
            <button className={styles.retryBtn} onClick={() => router.push('/')}>
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  const grouped = groupByCategory(numericResults)

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <NavLogo />
        <BackBtn router={router} />
      </nav>

      <main className={styles.main}>

        {/* Source badge */}
        <div className={`${styles.sourceBadge} ${styles[source]}`}>
          <span className={styles.dot} />
          {source === 'hybrid'  && 'AI-enhanced analysis'}
          {source === 'offline' && 'Offline analysis · database-powered'}
          {source === 'ai'      && 'AI analysis'}
        </div>

        {/* Summary pills */}
        <div className={styles.summaryStrip}>
          {summary.critical > 0 && (
            <span className={`${styles.summaryPill} ${styles.critical}`}>
              ⚠ {summary.critical} critical
            </span>
          )}
          {summary.positive > 0 && (
            <span className={`${styles.summaryPill} ${styles.positive}`}>
              + {summary.positive} positive
            </span>
          )}
          {summary.low > 0 && (
            <span className={`${styles.summaryPill} ${styles.low}`}>
              ↓ {summary.low} low
            </span>
          )}
          {summary.high > 0 && (
            <span className={`${styles.summaryPill} ${styles.high}`}>
              ↑ {summary.high} high
            </span>
          )}
          {summary.borderline > 0 && (
            <span className={`${styles.summaryPill} ${styles.borderline}`}>
              ~ {summary.borderline} borderline
            </span>
          )}
          {summary.normal > 0 && (
            <span className={`${styles.summaryPill} ${styles.normal}`}>
              ✓ {summary.normal} normal
            </span>
          )}
          {summary.negative > 0 && (
            <span className={`${styles.summaryPill} ${styles.negative}`}>
              − {summary.negative} negative
            </span>
          )}
        </div>

        {/* Detected patterns */}
        {detectedPatterns.length > 0 && (
          <section className={styles.patternsSection}>
            <p className={styles.sectionLabel}>What your results suggest</p>
            {detectedPatterns.map(p => (
              <div key={p.id} className={styles.patternCard}>
                <div className={styles.patternTop}>
                  <span className={styles.patternName}>{p.name}</span>
                  <span className={`${styles.patternConfidence} ${styles[p.confidence]}`}>
                    {p.confidence}
                  </span>
                </div>
                <p className={styles.patternExplanation}>{p.explanation}</p>
              </div>
            ))}
          </section>
        )}

        {/* Qualitative test results */}
        {qualResults.length > 0 && (
          <section className={styles.qualitativeSection}>
            <p className={styles.sectionLabel}>Test Results (Detected/Not Detected)</p>
            {qualResults.map((qr, idx) => (
              <QualitativeCard key={`${qr.markerId}-${idx}`} result={qr} />
            ))}
          </section>
        )}

        {/* 
        {/* Results grouped by category */}
        <section className={styles.resultsSection}>
          <p className={styles.sectionLabel}>Your values explained</p>
          {Array.from(grouped.entries()).map(([category, catResults]) => (
            <div key={category}>
              <p className={styles.categoryHeader}>{CATEGORY_LABEL[category]}</p>
              {catResults.map(r => (
                <ResultCard key={r.markerId} result={r} />
              ))}
            </div>
          ))}
        </section>

        {/* Non-numeric findings (imaging, cultures, urinalysis notes) */}
        {findings.length > 0 && (
          <section className={styles.findingsSection}>
            <p className={styles.sectionLabel}>Other findings</p>
            {findings.map((f, i) => (
              <div key={i} className={styles.findingCard}>
                <div className={styles.findingTitle}>{f.displayName}</div>
                <div className={styles.findingText}>{f.findingText}</div>
                <p className={styles.explanation}>{f.explanation}</p>
              </div>
            ))}
          </section>
        )}

        {/* Doctor questions */}
        {doctorQuestions.length > 0 && (
          <div className={styles.questionsCard}>
            <div className={styles.questionsTitle}>Ask your doctor these questions</div>
            <p className={styles.questionsSub}>
              Based on your specific results — bring this list to your next appointment.
            </p>
            <div className={styles.questionList}>
              {doctorQuestions.map((q, i) => (
                <div key={i} className={styles.questionItem}>
                  <span className={styles.qNum}>{i + 1}</span>
                  <span className={styles.qText}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ad slot */}
        <div className={styles.adSlot}>
          <div>
            <div className={styles.adLabel}>Sponsored</div>
            <div className={styles.adText}>
              Book your next blood test at Chughtai Lab — home sample collection available
            </div>
          </div>
          <button className={styles.adCta}>Book now</button>
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            LabLens explains your results in plain language for educational purposes only.
            It does not provide medical diagnoses or treatment advice.
            Always discuss your results with a qualified doctor.
          </span>
        </div>

      </main>
    </div>
  )
}

// ── Shared small components ────────────────────────────────────────────────

function NavLogo() {
  return (
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
  )
}

function BackBtn({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <button className={styles.backBtn} onClick={() => router.push('/')}>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      New analysis
    </button>
  )
}
