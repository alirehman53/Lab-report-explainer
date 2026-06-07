/**
 * Inline medical disclaimer used on content pages (marker guides, etc.).
 * Health content is "Your Money or Your Life" in Google's eyes and is judged on
 * E-E-A-T, so a clear, visible disclaimer + sourcing note is both a trust signal
 * for readers and a ranking signal.
 */
export default function MedicalDisclaimer() {
  return (
    <aside
      role="note"
      className="mt-12 rounded-2xl border border-amber-300/40 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900"
    >
      <p className="m-0">
        <span className="font-semibold">⚠️ Medical disclaimer:</span> This page is for general
        education only and is not medical advice, diagnosis, or treatment. Reference ranges vary
        between laboratories — always read your result against the range printed on your own report
        and discuss it with a qualified healthcare professional.
      </p>
    </aside>
  )
}
