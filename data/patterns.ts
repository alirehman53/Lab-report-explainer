import {
  AnalyzedResult,
  AnalyzedQualitativeResult,
  ParsedQualitativeValue,
  Pattern
} from '@/types/lab'
import {
  isPositive,
  isNegative,
  hasTitreAbove,
  hasQualMarker
} from '@/lib/qualitative-parser'

type DetectFn = (
  results: AnalyzedResult[],
  derivedResults: AnalyzedResult[],
  qualResults: AnalyzedQualitativeResult[],
  parsedQualValues: ParsedQualitativeValue[]
) => boolean

interface PatternDef {
  id: string
  name: string
  confidence: 'likely' | 'possible'
  markerIds: string[]
  detect: DetectFn
  explanation: string
}

// Helper functions for numeric results
function isLow(id: string, results: AnalyzedResult[], derivedResults: AnalyzedResult[]): boolean {
  const allResults = [...results, ...derivedResults]
  const r = allResults.find(r => r.markerId === id)
  return !!r && (r.status === 'low' || r.status === 'critical-low')
}

function isHigh(id: string, results: AnalyzedResult[], derivedResults: AnalyzedResult[]): boolean {
  const allResults = [...results, ...derivedResults]
  const r = allResults.find(r => r.markerId === id)
  return !!r && (r.status === 'high' || r.status === 'critical-high')
}

function hasMarker(id: string, results: AnalyzedResult[], derivedResults: AnalyzedResult[]): boolean {
  const allResults = [...results, ...derivedResults]
  return allResults.some(r => r.markerId === id)
}

export const PATTERN_DEFINITIONS: PatternDef[] = [

  {
    id: 'iron-deficiency-anemia',
    name: 'Iron Deficiency Anemia',
    confidence: 'likely',
    markerIds: ['hemoglobin', 'mcv', 'mch'],
    detect: (r, d) => isLow('hemoglobin', r, d) && isLow('mcv', r, d) && isLow('mch', r, d),
    explanation:
      'The combination of low hemoglobin, small red blood cells (low MCV), and low MCH is the classic triad of iron deficiency anemia — the most common nutritional deficiency worldwide. Easily confirmed with a ferritin test and treated with iron supplementation.',
  },

  {
    id: 'iron-deficiency-anemia-possible',
    name: 'Possible Iron Deficiency Anemia',
    confidence: 'possible',
    markerIds: ['hemoglobin', 'mcv'],
    detect: (r, d) =>
      isLow('hemoglobin', r, d) &&
      isLow('mcv', r, d) &&
      !hasMarker('mch', r, d),
    explanation:
      'Low hemoglobin with small red blood cells (low MCV) suggests iron deficiency anemia. Confirming with MCH, serum iron, and ferritin would give a clearer picture.',
  },

  {
    id: 'b12-folate-deficiency-anemia',
    name: 'Possible B12 or Folate Deficiency Anemia',
    confidence: 'likely',
    markerIds: ['hemoglobin', 'mcv'],
    detect: (r, d) => isLow('hemoglobin', r, d) && isHigh('mcv', r, d),
    explanation:
      'Low hemoglobin with abnormally large red blood cells (high MCV) is the signature of megaloblastic anemia — usually caused by B12 or folate deficiency. Common in vegetarians, vegans, elderly patients, and those with malabsorption.',
  },

  {
    id: 'hypothyroidism',
    name: 'Likely Hypothyroidism',
    confidence: 'likely',
    markerIds: ['tsh', 't4'],
    detect: (r, d) => isHigh('tsh', r, d) && isLow('t4', r, d),
    explanation:
      'High TSH with low T4 is the diagnostic pattern of primary hypothyroidism. Your thyroid gland is under-producing hormones. This is very common and highly treatable with daily levothyroxine tablets.',
  },

  {
    id: 'subclinical-hypothyroidism',
    name: 'Subclinical Hypothyroidism',
    confidence: 'possible',
    markerIds: ['tsh'],
    detect: (r, d) => isHigh('tsh', r, d) && !hasMarker('t4', r, d),
    explanation:
      'An elevated TSH without T4 data may indicate subclinical hypothyroidism — where the thyroid is struggling but still compensating. A T4 test would help confirm this.',
  },

  {
    id: 'hyperthyroidism',
    name: 'Likely Hyperthyroidism',
    confidence: 'likely',
    markerIds: ['tsh', 't4'],
    detect: (r, d) => isLow('tsh', r, d) && isHigh('t4', r, d),
    explanation:
      'Low TSH with high T4 indicates an overactive thyroid (hyperthyroidism). Symptoms include weight loss, rapid heartbeat, tremors, and anxiety. Several treatment options exist.',
  },

  {
    id: 'diabetes',
    name: 'Possible Diabetes / Prediabetes',
    confidence: 'likely',
    markerIds: ['glucose_fasting', 'hba1c'],
    detect: (r, d) => isHigh('glucose_fasting', r, d) || isHigh('hba1c', r, d),
    explanation:
      'Elevated fasting glucose or HbA1c suggests impaired blood sugar control. Prediabetes (100–125 mg/dL fasting; 5.7–6.4% HbA1c) is often reversible with lifestyle changes. Confirmed diabetes requires immediate management to prevent long-term complications.',
  },

  {
    id: 'dyslipidemia',
    name: 'Dyslipidemia (Abnormal Cholesterol)',
    confidence: 'likely',
    markerIds: ['ldl', 'hdl', 'triglycerides'],
    detect: (r, d) => isHigh('ldl', r, d) || isLow('hdl', r, d) || isHigh('triglycerides', r, d),
    explanation:
      'Abnormal lipid values — high LDL, low HDL, or high triglycerides — increase the risk of cardiovascular disease over time. The combination of high triglycerides and low HDL is particularly common in South Asian populations and is linked to insulin resistance.',
  },

  {
    id: 'liver-disease',
    name: 'Possible Liver Stress or Disease',
    confidence: 'likely',
    markerIds: ['alt', 'ast'],
    detect: (r, d) => isHigh('alt', r, d) && isHigh('ast', r, d),
    explanation:
      'Both ALT and AST being elevated suggests liver cell damage. The most common cause in Pakistan and South Asia is non-alcoholic fatty liver disease (NAFLD), often linked to obesity and metabolic syndrome. Hepatitis B/C are also important considerations.',
  },

  {
    id: 'liver-elevated-alt-only',
    name: 'Possible Liver Inflammation',
    confidence: 'possible',
    markerIds: ['alt'],
    detect: (r, d) => isHigh('alt', r, d) && !hasMarker('ast', r, d),
    explanation:
      'Elevated ALT alone can indicate early liver stress. ALT is more liver-specific than AST. Further testing (AST, bilirubin, ultrasound) would help clarify.',
  },

  {
    id: 'kidney-disease',
    name: 'Possible Kidney Dysfunction',
    confidence: 'likely',
    markerIds: ['creatinine', 'bun'],
    detect: (r, d) => isHigh('creatinine', r, d) && isHigh('bun', r, d),
    explanation:
      'Both creatinine and BUN being elevated suggests the kidneys are not filtering waste efficiently. This could be acute (dehydration, medication) or chronic. An eGFR test helps stage kidney function.',
  },

  {
    id: 'kidney-disease-possible',
    name: 'Possible Kidney Stress',
    confidence: 'possible',
    markerIds: ['creatinine'],
    detect: (r, d) => isHigh('creatinine', r, d) && !hasMarker('bun', r, d),
    explanation:
      'Elevated creatinine alone may indicate kidney stress. Dehydration is a common cause. A BUN test and eGFR would help evaluate kidney function more completely.',
  },

  {
    id: 'vitamin-d-deficiency',
    name: 'Vitamin D Deficiency',
    confidence: 'likely',
    markerIds: ['vitamin_d'],
    detect: (r, d) => isLow('vitamin_d', r, d),
    explanation:
      'Low Vitamin D is extremely prevalent in Pakistan and South Asia. It affects bone strength, immune function, mood, and muscle performance. Correction is straightforward with supplementation and is highly recommended.',
  },

  {
    id: 'b12-deficiency',
    name: 'Vitamin B12 Deficiency',
    confidence: 'likely',
    markerIds: ['vitamin_b12'],
    detect: (r, d) => isLow('vitamin_b12', r, d),
    explanation:
      'B12 deficiency is common, especially in vegetarians and those with digestive issues. It causes fatigue, neurological symptoms (tingling, numbness), and can lead to megaloblastic anemia if untreated.',
  },

  {
    id: 'thalassemia-trait',
    name: 'Possible Thalassemia Trait',
    confidence: 'possible',
    markerIds: ['hemoglobin', 'mcv', 'rbc'],
    detect: (r, d) =>
      isLow('mcv', r, d) &&
      !isLow('hemoglobin', r, d) &&
      !isLow('rbc', r, d),
    explanation:
      'Normal or near-normal hemoglobin with small red blood cells (low MCV) and normal/high RBC count can suggest thalassemia trait — a common inherited condition in South Asian populations. Unlike iron deficiency, thalassemia trait usually does not require treatment, but iron supplements should be avoided unless iron deficiency is also confirmed.',
  },

  {
    id: 'gout-risk',
    name: 'Elevated Uric Acid (Gout Risk)',
    confidence: 'likely',
    markerIds: ['uric_acid'],
    detect: (r, d) => isHigh('uric_acid', r, d),
    explanation:
      'High uric acid increases the risk of gout — painful joint attacks — and kidney stones. Common in Pakistan due to diet rich in red meat, pulses, and sugary drinks. Manageable with dietary changes and medication.',
  },

  {
    id: 'inflammation',
    name: 'Active Inflammation or Infection',
    confidence: 'possible',
    markerIds: ['crp', 'esr', 'wbc'],
    detect: (r, d) =>
      (isHigh('crp', r, d) && isHigh('esr', r, d)) ||
      (isHigh('crp', r, d) && isHigh('wbc', r, d)) ||
      (isHigh('esr', r, d) && isHigh('wbc', r, d)),
    explanation:
      'Multiple inflammation markers being elevated simultaneously suggests an active infection, autoimmune flare, or inflammatory condition. The source needs to be identified — could be bacterial infection, viral illness, or chronic inflammation.',
  },

  {
    id: 'dehydration',
    name: 'Possible Dehydration',
    confidence: 'possible',
    markerIds: ['bun', 'creatinine', 'sodium'],
    detect: (r, d) =>
      isHigh('bun', r, d) &&
      !isHigh('creatinine', r, d) &&
      (isHigh('sodium', r, d) || isHigh('albumin', r, d)),
    explanation:
      'High BUN without proportionally high creatinine, especially with high sodium, is a classic pattern of dehydration rather than kidney disease. Drinking more water may normalize these values.',
  },

  // ── Infectious disease patterns (qualitative) ──────────────────────────

  {
    id: 'hepatitis-b-active',
    name: 'Active Hepatitis B Infection',
    confidence: 'likely',
    markerIds: ['hbsag', 'hbeag'],
    detect: (r, d, q, p) =>
      isPositive('hbsag', p) && isPositive('hbeag', p),
    explanation:
      'Both HBsAg and HBeAg are positive, indicating active Hepatitis B infection with high viral replication. This requires immediate medical evaluation, possible antiviral treatment, and monitoring of liver function. Family members should be tested and vaccinated if not immune.',
  },

  {
    id: 'hepatitis-b-carrier',
    name: 'Hepatitis B Carrier State',
    confidence: 'likely',
    markerIds: ['hbsag', 'anti-hbe'],
    detect: (r, d, q, p) =>
      isPositive('hbsag', p) && 
      isPositive('anti_hbe', p) &&
      !isPositive('hbeag', p),
    explanation:
      'HBsAg positive with Anti-HBe positive suggests inactive carrier state — the virus is present but not actively replicating. Regular monitoring of liver enzymes and viral load is important. Vaccination of close contacts is recommended.',
  },

  {
    id: 'hepatitis-c-reactive',
    name: 'Hepatitis C Detected',
    confidence: 'likely',
    markerIds: ['hcv_antibody'],
    detect: (r, d, q, p) => isPositive('hcv_antibody', p),
    explanation:
      'Hepatitis C antibody detected. This indicates exposure to Hepatitis C virus. Follow-up RNA testing (PCR) is essential to confirm active infection, as antibodies persist even after clearance. Hepatitis C is curable with modern direct-acting antiviral medications.',
  },

  {
    id: 'dengue-acute',
    name: 'Acute Dengue Fever',
    confidence: 'likely',
    markerIds: ['dengue_ns1', 'dengue_igm', 'platelets'],
    detect: (r, d, q, p) =>
      (isPositive('dengue_ns1', p) || isPositive('dengue_igm', p)) &&
      isLow('platelets', r, d),
    explanation:
      'Positive dengue test with low platelets confirms acute dengue infection. Monitor platelets daily, watch for warning signs (severe abdominal pain, persistent vomiting, bleeding), stay hydrated, avoid NSAIDs (use paracetamol only). Seek immediate care if warning signs appear.',
  },

  {
    id: 'uti-likely',
    name: 'Likely Urinary Tract Infection',
    confidence: 'likely',
    markerIds: ['leukocyte_esterase_urine', 'nitrites_urine', 'wbc'],
    detect: (r, d, q, p) =>
      isPositive('leukocyte_esterase_urine', p) &&
      isPositive('nitrites_urine', p),
    explanation:
      'Both leukocyte esterase and nitrites positive on urinalysis strongly suggests bacterial urinary tract infection (UTI). Urine culture recommended to identify the bacteria and guide antibiotic choice. Drink plenty of water and complete the full antibiotic course if prescribed.',
  },

  // ── Derived/metabolic patterns ─────────────────────────────────────────

  {
    id: 'insulin-resistance',
    name: 'Possible Insulin Resistance',
    confidence: 'likely',
    markerIds: ['homa_ir', 'glucose_fasting'],
    detect: (r, d) => isHigh('homa_ir', r, d),
    explanation:
      'Elevated HOMA-IR indicates insulin resistance — your cells are not responding efficiently to insulin. This is a key feature of prediabetes, metabolic syndrome, and PCOS. Reversible with weight loss, exercise, and low-carb diet.',
  },

  {
    id: 'metabolic-syndrome-risk',
    name: 'Metabolic Syndrome Risk',
    confidence: 'likely',
    markerIds: ['triglycerides', 'hdl', 'glucose_fasting', 'non_hdl_cholesterol'],
    detect: (r, d) =>
      isHigh('triglycerides', r, d) &&
      isLow('hdl', r, d) &&
      isHigh('glucose_fasting', r, d),
    explanation:
      'High triglycerides, low HDL, and elevated fasting glucose together form the core of metabolic syndrome — a cluster of conditions that increase risk of heart disease, stroke, and diabetes. Very common in South Asian populations. Lifestyle modification is the first-line treatment.',
  },
]

export function detectPatterns(
  results: AnalyzedResult[],
  derivedResults: AnalyzedResult[],
  qualResults: AnalyzedQualitativeResult[],
  parsedQualValues: ParsedQualitativeValue[]
): Pattern[] {
  const detected: Pattern[] = []

  for (const def of PATTERN_DEFINITIONS) {
    if (def.detect(results, derivedResults, qualResults, parsedQualValues)) {
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
