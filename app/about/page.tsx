import Link from 'next/link'
import styles from '@/styles/upload.module.scss'

export default function AboutPage() {
  return (
    <div className={styles.page}>
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
          <Link href="/" className={styles.backBtn}>Home</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>LabLens — what we do and why it matters</h1>
          <p className={styles.subtitle}>
            LabLens helps people make sense of medical test reports by translating technical
            findings into clear, practical information. We cover laboratory tests, urinalysis,
            microbiology reports, and common imaging findings.
          </p>
        </div>

        <section className={styles.uploadCard}>
          <h2 style={{ marginBottom: 12 }}>Our story</h2>
          <p style={{ marginBottom: 12 }}>
            LabLens began when clinicians and patients told us the same thing — medical reports
            are full of jargon and numbers that are hard to interpret outside a clinic visit.
            Many people leave appointments confused or anxious. We built LabLens to bridge that
            gap by providing reliable, patient-focused explanations that are grounded in clinical
            convention and widely accepted reference ranges.
          </p>

          <h2 style={{ marginBottom: 12 }}>How LabLens works</h2>
          <ol style={{ marginLeft: 18, color: 'var(--color-ink-secondary)', lineHeight: 1.6 }}>
            <li><strong>Input handling:</strong> You can paste text, upload CSV/TXT reports, or upload images (images currently show a placeholder until OCR is enabled).</li>
            <li><strong>Offline parsing:</strong> We parse numeric values and detect common marker names against an internal dictionary.</li>
            <li><strong>Rule-based interpretation:</strong> Numeric values are checked against sex-specific and universal reference ranges; common patterns (e.g., iron deficiency, liver enzyme elevations) are detected using conservative rules.</li>
            <li><strong>Optional AI enrichment:</strong> If enabled, a language model provides clearer, patient-facing explanations and suggested doctor questions. AI enrichment is a best-effort layer — the core numeric interpretation always comes from the offline engine.</li>
          </ol>

          <h2 style={{ marginBottom: 12 }}>Data & privacy</h2>
          <p style={{ marginBottom: 12 }}>
            We care about privacy. Uploaded data is processed transiently to produce the analysis
            and is not used to train models. If you enable any cloud services (OCR, AI enrichment),
            those external services may process data according to their policies — we will surface
            those details if you opt in. Never share personally identifiable information in free-form
            text unless you are comfortable with it being processed.
          </p>

          <h2 style={{ marginBottom: 12 }}>Common tests explained (overview)</h2>
          <div style={{ color: 'var(--color-ink-secondary)', lineHeight: 1.6 }}>
            <h3 style={{ marginBottom: 8 }}>Complete Blood Count (CBC)</h3>
            <p style={{ marginBottom: 8 }}>
              The CBC measures components of blood — red cells, white cells, and platelets. Key numbers:
              hemoglobin (oxygen-carrying protein), MCV/MCH (cell size and content), WBC (infection/inflammation),
              and platelets (clotting). Small, isolated variations are common; combinations of changes give clinical clues.
            </p>

            <h3 style={{ marginBottom: 8 }}>Basic Metabolic Panel / Kidney tests</h3>
            <p style={{ marginBottom: 8 }}>
              Tests like sodium, potassium, creatinine, and BUN help evaluate kidney function and electrolyte balance.
              Mild changes can reflect hydration or diet; persistent or large deviations may prompt follow-up testing.
            </p>

            <h3 style={{ marginBottom: 8 }}>Urinalysis</h3>
            <p style={{ marginBottom: 8 }}>
              A urinalysis checks urine appearance, dipstick markers (blood, protein, nitrites, leukocyte esterase),
              and microscopic cells. Positive nitrites or leukocyte esterase commonly suggest urinary tract infection,
              while blood or protein might prompt kidney evaluation.
            </p>

            <h3 style={{ marginBottom: 8 }}>Microbiology & cultures</h3>
            <p style={{ marginBottom: 8 }}>
              Culture reports list organisms grown from samples and their antibiotic susceptibilities. These require
              clinician interpretation to choose appropriate treatment — LabLens highlights organism names and flags
              key susceptibility results but does not recommend antibiotics.
            </p>

            <h3 style={{ marginBottom: 8 }}>Imaging reports (X-ray, CT, MRI)</h3>
            <p style={{ marginBottom: 8 }}>
              Radiology reports contain descriptive findings (e.g., ‘small effusion’, ‘consolidation’, ‘nodule’). These
              are text-based and need clinical correlation. LabLens extracts the reported phrases and summarizes them
              in lay language; it does not replace a radiologist’s opinion.
            </p>
          </div>

          <h2 style={{ marginBottom: 12 }}>Roadmap</h2>
          <ul style={{ marginLeft: 18, color: 'var(--color-ink-secondary)', lineHeight: 1.6 }}>
            <li>Enable OCR for uploaded images (beta) so photos of printed reports are auto-extracted.</li>
            <li>Improve microbiology parsing and add structured culture result tables.</li>
            <li>Add localized reference ranges and language support for more regions.</li>
            <li>Integrate optional sources of patient-facing guidance and citations to clinical guidelines.</li>
          </ul>

          <h2 style={{ marginBottom: 12 }}>Frequently asked questions</h2>
          <details style={{ marginBottom: 8 }}>
            <summary>Is LabLens giving medical advice?</summary>
            <div style={{ marginTop: 8 }}>No. LabLens provides informational explanations to help you understand results and prepare questions for your clinician. It does not diagnose or prescribe.</div>
          </details>

          <details style={{ marginBottom: 8 }}>
            <summary>How accurate are the interpretations?</summary>
            <div style={{ marginTop: 8 }}>
              Our numeric interpretations use published reference ranges and conservative rules. They are suitable for general
              educational use but not a substitute for clinical judgment. Always review results with your healthcare provider.
            </div>
          </details>

          <details style={{ marginBottom: 8 }}>
            <summary>Can I upload images of my report?</summary>
            <div style={{ marginTop: 8 }}>Yes — images are accepted. OCR is coming soon; until then images appear as uploaded placeholders.</div>
          </details>

          <h2 style={{ marginBottom: 12 }}>Contributors & acknowledgements</h2>
          <p style={{ marginBottom: 12 }}>
            LabLens is built by a small team of engineers and clinicians. We are grateful to clinicians who contributed
            interpretation rules and to patients who shared feedback to improve clarity.
          </p>

          <p style={{ marginTop: 16 }}>
            Want us to expand or add content? Share feedback via the project repository or the contact link on the homepage.
          </p>
        </section>
      </main>
    </div>
  )
}
