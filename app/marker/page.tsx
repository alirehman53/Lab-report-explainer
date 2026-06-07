import type { Metadata } from 'next'
import Link from 'next/link'
import { markerPagesByCategory, markerPageSlugs } from '@/lib/markerPages'

export const metadata: Metadata = {
  title: 'Lab Test Guides — Normal Ranges & What Your Results Mean',
  description:
    'Plain-English guides to common blood and lab tests: normal ranges and what high or low results mean for hemoglobin, TSH, cholesterol, glucose, liver and kidney tests, and more.',
  keywords: ['lab test guide', 'blood test normal ranges', 'what do lab results mean', 'lab report explainer'],
  alternates: { canonical: '/marker' },
  openGraph: {
    title: 'Lab Test Guides — Normal Ranges & What Your Results Mean',
    description: 'Plain-English guides to common blood and lab tests and what your results mean.',
    type: 'website',
    url: '/marker',
  },
}

export default function MarkerIndexPage() {
  const groups = markerPagesByCategory()
  const total = markerPageSlugs().length

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-14 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">Lab Test Guides</h1>
          <p className="mt-3 text-blue-100 text-lg">
            Plain-English explanations of {total}+ common lab tests — normal ranges and what high or
            low results mean. Pick a test, or{' '}
            <Link href="/" className="underline hover:text-white">analyze your whole report</Link>.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {groups.map((group) => (
          <section key={group.category} className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{group.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.markers.map((m) => (
                <Link
                  key={m.slug}
                  href={`/marker/${m.slug}`}
                  className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-semibold text-gray-900">{m.displayName}</span>
                  {m.descriptor && <span className="block text-sm text-gray-500">{m.descriptor}</span>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
