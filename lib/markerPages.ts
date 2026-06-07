/**
 * Data layer for the programmatic /marker/[slug] SEO pages.
 *
 * Each numeric lab marker we already model (data/markers.ts) plus its plain-
 * English interpretations (data/interpretations.ts) becomes one indexable page
 * targeting real searches like "what does a high TSH mean" or "normal hemoglobin
 * range". This turns data we already maintain into dozens of landing pages — the
 * highest-leverage organic-reach lever for the site.
 */

import { LAB_MARKERS } from '@/data/markers'
import { INTERPRETATIONS } from '@/data/interpretations'
import type { LabMarker, MarkerCategory, MarkerStatus, RangeSet } from '@/types/lab'

export type InterpretationMap = Partial<Record<MarkerStatus, string>>

export interface MarkerPageData {
  slug: string
  marker: LabMarker
  /** marker.fullName with the trailing "· description" stripped, if present */
  cleanName: string
  /** the short descriptor after "·" in fullName, if any (e.g. "Oxygen-carrying protein") */
  descriptor: string | null
  categoryLabel: string
  interp: InterpretationMap
  ranges: { label: string; value: string }[]
  related: { slug: string; displayName: string; descriptor: string | null }[]
}

export const CATEGORY_LABELS: Record<MarkerCategory, string> = {
  cbc: 'Complete Blood Count (CBC)',
  iron: 'Iron Studies',
  liver: 'Liver Function',
  thyroid: 'Thyroid',
  kidney: 'Kidney Function',
  lipid: 'Lipid / Cholesterol',
  diabetes: 'Diabetes & Blood Sugar',
  electrolytes: 'Electrolytes',
  cardiac: 'Cardiac',
  'hormones-female': 'Female Hormones',
  'hormones-male': 'Male Hormones',
  'hormones-adrenal': 'Adrenal Hormones',
  coagulation: 'Coagulation',
  'tumor-markers': 'Tumor Markers',
  'infectious-serology': 'Infectious Disease Serology',
  autoimmune: 'Autoimmune',
  'urinalysis-numeric': 'Urinalysis',
  'urinalysis-qualitative': 'Urinalysis',
  'bone-minerals': 'Bone & Minerals',
  'vitamins-nutrition': 'Vitamins & Nutrition',
  'allergy-immunology': 'Allergy & Immunology',
  'drug-monitoring': 'Drug Monitoring',
  'cardiac-markers': 'Cardiac Markers',
  stool: 'Stool',
  csf: 'Cerebrospinal Fluid (CSF)',
  derived: 'Calculated Values',
  imaging: 'Imaging',
  microbiology: 'Microbiology',
  other: 'Other Tests',
}

function splitFullName(fullName: string): { cleanName: string; descriptor: string | null } {
  const idx = fullName.indexOf('·')
  if (idx === -1) return { cleanName: fullName.trim(), descriptor: null }
  return {
    cleanName: fullName.slice(0, idx).trim(),
    descriptor: fullName.slice(idx + 1).trim() || null,
  }
}

function formatRangeSet(r: RangeSet, unit: string): string {
  return `${r.low}–${r.high} ${unit}`.trim()
}

function buildRanges(marker: LabMarker): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = []
  const r = marker.ranges
  if (!r) return out
  if (r.universal) out.push({ label: 'Adults', value: formatRangeSet(r.universal, marker.unit) })
  if (r.male) out.push({ label: 'Men', value: formatRangeSet(r.male, marker.unit) })
  if (r.female) out.push({ label: 'Women', value: formatRangeSet(r.female, marker.unit) })
  return out
}

/** All marker ids that have BOTH a range/definition and interpretation text. */
export function markerPageSlugs(): string[] {
  return Object.values(LAB_MARKERS)
    .filter((m) => m.resultType === 'numeric' && INTERPRETATIONS[m.id])
    .map((m) => m.id)
}

export function getMarkerPageData(slug: string): MarkerPageData | null {
  const marker = LAB_MARKERS[slug]
  if (!marker || !INTERPRETATIONS[marker.id]) return null

  const { cleanName, descriptor } = splitFullName(marker.fullName)

  const related = Object.values(LAB_MARKERS)
    .filter(
      (m) =>
        m.id !== marker.id &&
        m.category === marker.category &&
        m.resultType === 'numeric' &&
        INTERPRETATIONS[m.id]
    )
    .slice(0, 6)
    .map((m) => {
      const parts = splitFullName(m.fullName)
      return { slug: m.id, displayName: m.displayName, descriptor: parts.descriptor }
    })

  return {
    slug: marker.id,
    marker,
    cleanName,
    descriptor,
    categoryLabel: CATEGORY_LABELS[marker.category] ?? 'Lab Test',
    interp: INTERPRETATIONS[marker.id],
    ranges: buildRanges(marker),
    related,
  }
}

/** Markers grouped by category label, for the /marker index page. */
export function markerPagesByCategory(): { category: string; markers: { slug: string; displayName: string; descriptor: string | null }[] }[] {
  const groups = new Map<string, { slug: string; displayName: string; descriptor: string | null }[]>()
  for (const slug of markerPageSlugs()) {
    const m = LAB_MARKERS[slug]
    const label = CATEGORY_LABELS[m.category] ?? 'Other Tests'
    const parts = splitFullName(m.fullName)
    const entry = { slug, displayName: m.displayName, descriptor: parts.descriptor }
    const list = groups.get(label) ?? []
    list.push(entry)
    groups.set(label, list)
  }
  return Array.from(groups.entries())
    .map(([category, markers]) => ({ category, markers }))
    .sort((a, b) => a.category.localeCompare(b.category))
}
