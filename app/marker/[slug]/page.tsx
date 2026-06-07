import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMarkerPageData, markerPageSlugs } from '@/lib/markerPages'
import MedicalDisclaimer from '@/components/MedicalDisclaimer'
import AdSense from '@/components/AdSense'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lab-report-explainer-sigma.vercel.app'

export const dynamicParams = false

export function generateStaticParams() {
  return markerPageSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = getMarkerPageData(slug)
  if (!data) return { title: 'Test not found' }

  const { marker, cleanName, ranges } = data
  const rangeStr = ranges[0]?.value ? ` (normal: ${ranges[0].value})` : ''
  const title = `${cleanName} Blood Test — Normal Range & What High or Low Means`
  const description = `What does your ${cleanName} (${marker.displayName}) result mean${rangeStr}? Understand the normal range and what high and low ${cleanName} levels indicate, in plain English — then analyze your full report free.`

  return {
    title,
    description,
    keywords: [
      `${cleanName.toLowerCase()} normal range`,
      `high ${cleanName.toLowerCase()}`,
      `low ${cleanName.toLowerCase()}`,
      `${marker.displayName.toLowerCase()} blood test`,
      `what does ${cleanName.toLowerCase()} mean`,
    ],
    alternates: { canonical: `/marker/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/marker/${slug}`,
    },
    robots: { index: true, follow: true },
  }
}

export default async function MarkerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = getMarkerPageData(slug)
  if (!data) notFound()

  const { marker, cleanName, descriptor, categoryLabel, interp, ranges, related } = data

  const highText = interp.high ?? interp['critical-high']
  const lowText = interp.low ?? interp['critical-low']
  const normalText = interp.normal

  // FAQPage structured data — eligible for rich results / AI-overview citations.
  const faqs: { q: string; a: string }[] = []
  if (ranges.length) {
    faqs.push({
      q: `What is a normal ${cleanName} level?`,
      a: `A normal ${cleanName} (${marker.displayName}) level is ${ranges.map((r) => `${r.value} for ${r.label.toLowerCase()}`).join(', ')}. Reference ranges vary slightly between laboratories, so always compare against the range printed on your own report.`,
    })
  }
  if (highText) faqs.push({ q: `What does a high ${cleanName} mean?`, a: highText })
  if (lowText) faqs.push({ q: `What does a low ${cleanName} mean?`, a: lowText })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${SITE_URL}/marker/${slug}`,
    name: `${cleanName} Blood Test`,
    description: `Normal range and meaning of high and low ${cleanName} (${marker.displayName}) results.`,
    medicalAudience: 'https://schema.org/Patient',
    about: {
      '@type': 'MedicalTest',
      name: cleanName,
      ...(descriptor ? { description: descriptor } : {}),
    },
    isPartOf: { '@type': 'WebSite', name: 'Lab Lens', url: SITE_URL },
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-14 max-w-3xl">
            <nav className="mb-4 text-sm text-blue-100">
              <Link href="/marker" className="hover:text-white">Lab test guides</Link>
              <span className="mx-2 opacity-60">/</span>
              <span>{categoryLabel}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {cleanName} — Normal Range &amp; What Your Result Means
            </h1>
            {descriptor && <p className="mt-3 text-blue-100 text-lg">{descriptor}</p>}
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* At-a-glance range card */}
          <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-emerald-600">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Normal {cleanName} range ({marker.displayName}, {marker.unit})
            </h2>
            {ranges.length ? (
              <ul className="space-y-2">
                {ranges.map((r) => (
                  <li key={r.label} className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">{r.label}</span>
                    <span className="font-semibold text-gray-900">{r.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 m-0">Reference range depends on your laboratory and clinical context.</p>
            )}
            <p className="text-xs text-gray-500 mt-4 mb-0">
              Ranges are typical adult values and vary between labs. Use the range on your own report.
            </p>
          </section>

          <div className="my-8">
            <p className="text-center text-xs text-gray-400 mb-2 uppercase tracking-wider">Advertisement</p>
            <AdSense format="horizontal" />
          </div>

          <article className="blog-content max-w-none">
            {normalText && (
              <>
                <h2>What is {cleanName} ({marker.displayName})?</h2>
                <p>
                  {cleanName} is measured as part of a {categoryLabel.toLowerCase()} panel. {normalText}
                </p>
              </>
            )}

            {highText && (
              <>
                <h2>What does a high {cleanName} mean?</h2>
                <p>{highText}</p>
                {interp['critical-high'] && interp.high && (
                  <p><strong>If markedly elevated:</strong> {interp['critical-high']}</p>
                )}
              </>
            )}

            {lowText && (
              <>
                <h2>What does a low {cleanName} mean?</h2>
                <p>{lowText}</p>
                {interp['critical-low'] && interp.low && (
                  <p><strong>If markedly low:</strong> {interp['critical-low']}</p>
                )}
              </>
            )}

            <h2>Understand your whole report, not just one number</h2>
            <p>
              A single value rarely tells the full story — {cleanName} is best read alongside the
              rest of your panel. Paste your values or upload your report and get a plain-English
              explanation of every marker, with the important results flagged.
            </p>
          </article>

          <div className="mt-6 mb-10">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
            >
              Explain my lab report →
            </Link>
          </div>

          {faqs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                {cleanName}: frequently asked questions
              </h2>
              <div className="space-y-4">
                {faqs.map((f) => (
                  <details key={f.q} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="text-gray-700 mt-3 mb-0 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Related {categoryLabel} tests</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/marker/${r.slug}`}
                    className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="font-semibold text-gray-900">{r.displayName}</span>
                    {r.descriptor && <span className="block text-sm text-gray-500">{r.descriptor}</span>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <MedicalDisclaimer />
        </div>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </>
  )
}
