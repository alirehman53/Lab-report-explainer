import { AnalyzedResult, Pattern } from '@/types/lab'

type DetectFn = (results: AnalyzedResult[]) => boolean

interface PatternDef {
  id: string
  name: string
  confidence: 'likely' | 'possible'
  markerIds: string[]
  detect: DetectFn
  explanation: string
}

function isLow(id: string, results: AnalyzedResult[]): boolean {
  const r = results.find(r => r.markerId === id)
  return !!r && (r.status === 'low' || r.status === 'critical-low')
}

function isHigh(id: string, results: AnalyzedResult[]): boolean {
  const r = results.find(r => r.markerId === id)
  return !!r && (r.status === 'high' || r.status === 'critical-high')
}

function hasMarker(id: string, results: AnalyzedResult[]): boolean {
  return results.some(r => r.markerId === id)
}

export const PATTERN_DEFINITIONS: PatternDef[] = [

  {
    id: 'iron-deficiency-anemia',
    name: 'Iron Deficiency Anemia',
    confidence: 'likely',
    markerIds: ['hemoglobin', 'mcv', 'mch'],
    detect: (r) => isLow('hemoglobin', r) && isLow('mcv', r) && isLow('mch', r),
    explanation:
      'The combination of low hemoglobin, small red blood cells (low MCV), and low MCH is the classic triad of iron deficiency anemia — the most common nutritional deficiency worldwide. Easily confirmed with a ferritin test and treated with iron supplementation.',
  },

  {
    id: 'iron-deficiency-anemia-possible',
    name: 'Possible Iron Deficiency Anemia',
    confidence: 'possible',
    markerIds: ['hemoglobin', 'mcv'],
    detect: (r) =>
      isLow('hemoglobin', r) &&
      isLow('mcv', r) &&
      !hasMarker('mch', r),
    explanation:
      'Low hemoglobin with small red blood cells (low MCV) suggests iron deficiency anemia. Confirming with MCH, serum iron, and ferritin would give a clearer picture.',
  },

  {
    id: 'b12-folate-deficiency-anemia',
    name: 'Possible B12 or Folate Deficiency Anemia',
    confidence: 'likely',
    markerIds: ['hemoglobin', 'mcv'],
    detect: (r) => isLow('hemoglobin', r) && isHigh('mcv', r),
    explanation:
      'Low hemoglobin with abnormally large red blood cells (high MCV) is the signature of megaloblastic anemia — usually caused by B12 or folate deficiency. Common in vegetarians, vegans, elderly patients, and those with malabsorption.',
  },

  {
    id: 'hypothyroidism',
    name: 'Likely Hypothyroidism',
    confidence: 'likely',
    markerIds: ['tsh', 't4'],
    detect: (r) => isHigh('tsh', r) && isLow('t4', r),
    explanation:
      'High TSH with low T4 is the diagnostic pattern of primary hypothyroidism. Your thyroid gland is under-producing hormones. This is very common and highly treatable with daily levothyroxine tablets.',
  },

  {
    id: 'subclinical-hypothyroidism',
    name: 'Subclinical Hypothyroidism',
    confidence: 'possible',
    markerIds: ['tsh'],
    detect: (r) => isHigh('tsh', r) && !hasMarker('t4', r),
    explanation:
      'An elevated TSH without T4 data may indicate subclinical hypothyroidism — where the thyroid is struggling but still compensating. A T4 test would help confirm this.',
  },

  {
    id: 'hyperthyroidism',
    name: 'Likely Hyperthyroidism',
    confidence: 'likely',
    markerIds: ['tsh', 't4'],
    detect: (r) => isLow('tsh', r) && isHigh('t4', r),
    explanation:
      'Low TSH with high T4 indicates an overactive thyroid (hyperthyroidism). Symptoms include weight loss, rapid heartbeat, tremors, and anxiety. Several treatment options exist.',
  },

  {
    id: 'diabetes',
    name: 'Possible Diabetes / Prediabetes',
    confidence: 'likely',
    markerIds: ['glucose_fasting', 'hba1c'],
    detect: (r) => isHigh('glucose_fasting', r) || isHigh('hba1c', r),
    explanation:
      'Elevated fasting glucose or HbA1c suggests impaired blood sugar control. Prediabetes (100–125 mg/dL fasting; 5.7–6.4% HbA1c) is often reversible with lifestyle changes. Confirmed diabetes requires immediate management to prevent long-term complications.',
  },

  {
    id: 'dyslipidemia',
    name: 'Dyslipidemia (Abnormal Cholesterol)',
    confidence: 'likely',
    markerIds: ['ldl', 'hdl', 'triglycerides'],
    detect: (r) => isHigh('ldl', r) || isLow('hdl', r) || isHigh('triglycerides', r),
    explanation:
      'Abnormal lipid values — high LDL, low HDL, or high triglycerides — increase the risk of cardiovascular disease over time. The combination of high triglycerides and low HDL is particularly common in South Asian populations and is linked to insulin resistance.',
  },

  {
    id: 'liver-disease',
    name: 'Possible Liver Stress or Disease',
    confidence: 'likely',
    markerIds: ['alt', 'ast'],
    detect: (r) => isHigh('alt', r) && isHigh('ast', r),
    explanation:
      'Both ALT and AST being elevated suggests liver cell damage. The most common cause in Pakistan and South Asia is non-alcoholic fatty liver disease (NAFLD), often linked to obesity and metabolic syndrome. Hepatitis B/C are also important considerations.',
  },

  {
    id: 'liver-elevated-alt-only',
    name: 'Possible Liver Inflammation',
    confidence: 'possible',
    markerIds: ['alt'],
    detect: (r) => isHigh('alt', r) && !hasMarker('ast', r),
    explanation:
      'Elevated ALT alone can indicate early liver stress. ALT is more liver-specific than AST. Further testing (AST, bilirubin, ultrasound) would help clarify.',
  },

  {
    id: 'kidney-disease',
    name: 'Possible Kidney Dysfunction',
    confidence: 'likely',
    markerIds: ['creatinine', 'bun'],
    detect: (r) => isHigh('creatinine', r) && isHigh('bun', r),
    explanation:
      'Both creatinine and BUN being elevated suggests the kidneys are not filtering waste efficiently. This could be acute (dehydration, medication) or chronic. An eGFR test helps stage kidney function.',
  },

  {
    id: 'kidney-disease-possible',
    name: 'Possible Kidney Stress',
    confidence: 'possible',
    markerIds: ['creatinine'],
    detect: (r) => isHigh('creatinine', r) && !hasMarker('bun', r),
    explanation:
      'Elevated creatinine alone may indicate kidney stress. Dehydration is a common cause. A BUN test and eGFR would help evaluate kidney function more completely.',
  },

  {
    id: 'vitamin-d-deficiency',
    name: 'Vitamin D Deficiency',
    confidence: 'likely',
    markerIds: ['vitamin_d'],
    detect: (r) => isLow('vitamin_d', r),
    explanation:
      'Low Vitamin D is extremely prevalent in Pakistan and South Asia. It affects bone strength, immune function, mood, and muscle performance. Correction is straightforward with supplementation and is highly recommended.',
  },

  {
    id: 'b12-deficiency',
    name: 'Vitamin B12 Deficiency',
    confidence: 'likely',
    markerIds: ['vitamin_b12'],
    detect: (r) => isLow('vitamin_b12', r),
    explanation:
      'B12 deficiency is common, especially in vegetarians and those with digestive issues. It causes fatigue, neurological symptoms (tingling, numbness), and can lead to megaloblastic anemia if untreated.',
  },

  {
    id: 'thalassemia-trait',
    name: 'Possible Thalassemia Trait',
    confidence: 'possible',
    markerIds: ['hemoglobin', 'mcv', 'rbc'],
    detect: (r) =>
      isLow('mcv', r) &&
      !isLow('hemoglobin', r) &&
      !isLow('rbc', r),
    explanation:
      'Normal or near-normal hemoglobin with small red blood cells (low MCV) and normal/high RBC count can suggest thalassemia trait — a common inherited condition in South Asian populations. Unlike iron deficiency, thalassemia trait usually does not require treatment, but iron supplements should be avoided unless iron deficiency is also confirmed.',
  },

  {
    id: 'gout-risk',
    name: 'Elevated Uric Acid (Gout Risk)',
    confidence: 'likely',
    markerIds: ['uric_acid'],
    detect: (r) => isHigh('uric_acid', r),
    explanation:
      'High uric acid increases the risk of gout — painful joint attacks — and kidney stones. Common in Pakistan due to diet rich in red meat, pulses, and sugary drinks. Manageable with dietary changes and medication.',
  },

  {
    id: 'inflammation',
    name: 'Active Inflammation or Infection',
    confidence: 'possible',
    markerIds: ['crp', 'esr', 'wbc'],
    detect: (r) =>
      (isHigh('crp', r) && isHigh('esr', r)) ||
      (isHigh('crp', r) && isHigh('wbc', r)) ||
      (isHigh('esr', r) && isHigh('wbc', r)),
    explanation:
      'Multiple inflammation markers being elevated simultaneously suggests an active infection, autoimmune flare, or inflammatory condition. The source needs to be identified — could be bacterial infection, viral illness, or chronic inflammation.',
  },

  {
    id: 'dehydration',
    name: 'Possible Dehydration',
    confidence: 'possible',
    markerIds: ['bun', 'creatinine', 'sodium'],
    detect: (r) =>
      isHigh('bun', r) &&
      !isHigh('creatinine', r) &&
      (isHigh('sodium', r) || isHigh('albumin', r)),
    explanation:
      'High BUN without proportionally high creatinine, especially with high sodium, is a classic pattern of dehydration rather than kidney disease. Drinking more water may normalize these values.',
  },
]

export function detectPatterns(results: AnalyzedResult[]): Pattern[] {
  const detected: Pattern[] = []

  for (const def of PATTERN_DEFINITIONS) {
    if (def.detect(results)) {
      detected.push({
        id: def.id,
        name: def.name,
        confidence: def.confidence,
        markerIds: def.markerIds,
        explanation: def.explanation,
      })
    }
  }

  // Deduplicate: if a more specific pattern fires, skip a more generic one
  const toRemove = new Set<string>()
  if (detected.find(p => p.id === 'iron-deficiency-anemia')) {
    toRemove.add('iron-deficiency-anemia-possible')
  }
  if (detected.find(p => p.id === 'liver-disease')) {
    toRemove.add('liver-elevated-alt-only')
  }
  if (detected.find(p => p.id === 'kidney-disease')) {
    toRemove.add('kidney-disease-possible')
  }
  if (detected.find(p => p.id === 'hypothyroidism')) {
    toRemove.add('subclinical-hypothyroidism')
  }

  return detected.filter(p => !toRemove.has(p.id))
}
