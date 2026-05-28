import { LabMarker } from '@/types/lab'

export const LAB_MARKERS: Record<string, LabMarker> = {

  // ── CBC ──────────────────────────────────────────────────────────────────

  hemoglobin: {
    id: 'hemoglobin',
    names: ['hemoglobin', 'hb', 'hgb', 'haemoglobin'],
    displayName: 'Hemoglobin',
    fullName: 'Hemoglobin · Oxygen-carrying protein',
    unit: 'g/dL',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      male:   { low: 13.5, high: 17.5, criticalLow: 7.0,  criticalHigh: 20.0 },
      female: { low: 12.0, high: 16.0, criticalLow: 7.0,  criticalHigh: 20.0 },
    },
  },

  hematocrit: {
    id: 'hematocrit',
    names: ['hematocrit', 'hct', 'pcv', 'packed cell volume'],
    displayName: 'Hematocrit',
    fullName: 'Hematocrit · Red cell percentage',
    unit: '%',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      male:   { low: 41, high: 53, criticalLow: 21, criticalHigh: 65 },
      female: { low: 36, high: 46, criticalLow: 21, criticalHigh: 65 },
    },
  },

  rbc: {
    id: 'rbc',
    names: ['rbc', 'red blood cells', 'red blood cell count', 'erythrocytes'],
    displayName: 'RBC',
    fullName: 'Red Blood Cell Count',
    unit: '×10⁶/μL',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      male:   { low: 4.5, high: 5.9, criticalLow: 2.0, criticalHigh: 8.0 },
      female: { low: 4.0, high: 5.2, criticalLow: 2.0, criticalHigh: 8.0 },
    },
  },

  mcv: {
    id: 'mcv',
    names: ['mcv', 'mean corpuscular volume', 'mean cell volume'],
    displayName: 'MCV',
    fullName: 'Mean Corpuscular Volume · Cell size',
    unit: 'fL',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 80, high: 100, criticalLow: 60, criticalHigh: 125 },
    },
  },

  mch: {
    id: 'mch',
    names: ['mch', 'mean corpuscular hemoglobin', 'mean cell hemoglobin'],
    displayName: 'MCH',
    fullName: 'Mean Corpuscular Hemoglobin · Hb per cell',
    unit: 'pg',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 27, high: 33, criticalLow: 15, criticalHigh: 45 },
    },
  },

  mchc: {
    id: 'mchc',
    names: ['mchc', 'mean corpuscular hemoglobin concentration'],
    displayName: 'MCHC',
    fullName: 'Mean Corpuscular Hemoglobin Concentration',
    unit: 'g/dL',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 32, high: 36, criticalLow: 28, criticalHigh: 40 },
    },
  },

  wbc: {
    id: 'wbc',
    names: ['wbc', 'white blood cells', 'white blood cell count', 'leukocytes', 'tлc', 'tlc'],
    displayName: 'WBC',
    fullName: 'White Blood Cell Count · Immune defense',
    unit: '×10³/μL',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 4.5, high: 11.0, criticalLow: 2.0, criticalHigh: 30.0 },
    },
  },

  neutrophils: {
    id: 'neutrophils',
    names: ['neutrophils', 'neutrophil', 'neut', 'pmn', 'polys'],
    displayName: 'Neutrophils',
    fullName: 'Neutrophils · Bacterial fighters',
    unit: '%',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 40, high: 70, criticalLow: 20, criticalHigh: 90 },
    },
  },

  lymphocytes: {
    id: 'lymphocytes',
    names: ['lymphocytes', 'lymphocyte', 'lymphs', 'lymp'],
    displayName: 'Lymphocytes',
    fullName: 'Lymphocytes · Viral fighters',
    unit: '%',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 20, high: 40, criticalLow: 5, criticalHigh: 70 },
    },
  },

  monocytes: {
    id: 'monocytes',
    names: ['monocytes', 'monocyte', 'mono'],
    displayName: 'Monocytes',
    fullName: 'Monocytes · Immune cleanup cells',
    unit: '%',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 2, high: 8, criticalLow: 0, criticalHigh: 20 },
    },
  },

  eosinophils: {
    id: 'eosinophils',
    names: ['eosinophils', 'eosinophil', 'eos'],
    displayName: 'Eosinophils',
    fullName: 'Eosinophils · Allergy & parasite response',
    unit: '%',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 1, high: 4, criticalLow: 0, criticalHigh: 15 },
    },
  },

  platelets: {
    id: 'platelets',
    names: ['platelets', 'platelet count', 'plt', 'thrombocytes'],
    displayName: 'Platelets',
    fullName: 'Platelet Count · Blood clotting',
    unit: '×10³/μL',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 150, high: 400, criticalLow: 50, criticalHigh: 1000 },
    },
  },

  rdw: {
    id: 'rdw',
    names: ['rdw', 'red cell distribution width', 'rdw-cv'],
    displayName: 'RDW',
    fullName: 'Red Cell Distribution Width · Cell size variation',
    unit: '%',
    category: 'cbc',
    resultType: 'numeric',
    ranges: {
      universal: { low: 11.5, high: 14.5, criticalLow: 9, criticalHigh: 20 },
    },
  },

  // ── IRON ─────────────────────────────────────────────────────────────────

  serum_iron: {
    id: 'serum_iron',
    names: ['serum iron', 's. iron', 'iron', 'fe'],
    displayName: 'Serum Iron',
    fullName: 'Serum Iron · Circulating iron',
    unit: 'μg/dL',
    category: 'iron',
    resultType: 'numeric',
    ranges: {
      male:   { low: 65, high: 175, criticalLow: 20, criticalHigh: 350 },
      female: { low: 50, high: 170, criticalLow: 20, criticalHigh: 350 },
    },
  },

  ferritin: {
    id: 'ferritin',
    names: ['ferritin', 's. ferritin', 'serum ferritin'],
    displayName: 'Ferritin',
    fullName: 'Ferritin · Iron storage protein',
    unit: 'ng/mL',
    category: 'iron',
    resultType: 'numeric',
    ranges: {
      male:   { low: 24, high: 336, criticalLow: 5,  criticalHigh: 1000 },
      female: { low: 11, high: 307, criticalLow: 5,  criticalHigh: 1000 },
    },
  },

  tibc: {
    id: 'tibc',
    names: ['tibc', 'total iron binding capacity', 'iron binding capacity'],
    displayName: 'TIBC',
    fullName: 'Total Iron Binding Capacity',
    unit: 'μg/dL',
    category: 'iron',
    resultType: 'numeric',
    ranges: {
      universal: { low: 250, high: 370, criticalLow: 100, criticalHigh: 500 },
    },
  },

  // ── LIVER ────────────────────────────────────────────────────────────────

  alt: {
    id: 'alt',
    names: ['alt', 'alanine aminotransferase', 'alanine transaminase', 'sgpt'],
    displayName: 'ALT',
    fullName: 'Alanine Aminotransferase · Liver enzyme',
    unit: 'U/L',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      male:   { low: 7,  high: 56, criticalLow: 0, criticalHigh: 500 },
      female: { low: 7,  high: 45, criticalLow: 0, criticalHigh: 500 },
    },
  },

  ast: {
    id: 'ast',
    names: ['ast', 'aspartate aminotransferase', 'aspartate transaminase', 'sgot'],
    displayName: 'AST',
    fullName: 'Aspartate Aminotransferase · Liver/heart enzyme',
    unit: 'U/L',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      male:   { low: 10, high: 40, criticalLow: 0, criticalHigh: 500 },
      female: { low: 10, high: 35, criticalLow: 0, criticalHigh: 500 },
    },
  },

  alp: {
    id: 'alp',
    names: ['alp', 'alkaline phosphatase', 'alk phos', 'alkphos'],
    displayName: 'ALP',
    fullName: 'Alkaline Phosphatase · Liver/bone enzyme',
    unit: 'U/L',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      universal: { low: 44, high: 147, criticalLow: 0, criticalHigh: 600 },
    },
  },

  bilirubin_total: {
    id: 'bilirubin_total',
    names: ['total bilirubin', 't. bilirubin', 'bilirubin total', 'tbil'],
    displayName: 'Total Bilirubin',
    fullName: 'Total Bilirubin · Bile pigment',
    unit: 'mg/dL',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0.1, high: 1.2, criticalLow: 0, criticalHigh: 15 },
    },
  },

  bilirubin_direct: {
    id: 'bilirubin_direct',
    names: ['direct bilirubin', 'd. bilirubin', 'bilirubin direct', 'dbil', 'conjugated bilirubin'],
    displayName: 'Direct Bilirubin',
    fullName: 'Direct Bilirubin · Conjugated bile pigment',
    unit: 'mg/dL',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0, high: 0.3, criticalLow: 0, criticalHigh: 10 },
    },
  },

  albumin: {
    id: 'albumin',
    names: ['albumin', 'serum albumin'],
    displayName: 'Albumin',
    fullName: 'Albumin · Main blood protein',
    unit: 'g/dL',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      universal: { low: 3.5, high: 5.0, criticalLow: 2.0, criticalHigh: 6.0 },
    },
  },

  total_protein: {
    id: 'total_protein',
    names: ['total protein', 'protein total', 'tp'],
    displayName: 'Total Protein',
    fullName: 'Total Protein · Blood protein level',
    unit: 'g/dL',
    category: 'liver',
    resultType: 'numeric',
    ranges: {
      universal: { low: 6.0, high: 8.3, criticalLow: 3.0, criticalHigh: 12.0 },
    },
  },

  // ── THYROID ──────────────────────────────────────────────────────────────

  tsh: {
    id: 'tsh',
    names: ['tsh', 'thyroid stimulating hormone', 'thyrotropin'],
    displayName: 'TSH',
    fullName: 'Thyroid Stimulating Hormone',
    unit: 'mIU/L',
    category: 'thyroid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0.4, high: 4.0, criticalLow: 0.01, criticalHigh: 100 },
    },
  },

  t3: {
    id: 't3',
    names: ['t3', 'triiodothyronine', 'total t3', 'free t3', 'ft3'],
    displayName: 'T3',
    fullName: 'Triiodothyronine · Active thyroid hormone',
    unit: 'ng/dL',
    category: 'thyroid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 80, high: 200, criticalLow: 40, criticalHigh: 400 },
    },
  },

  t4: {
    id: 't4',
    names: ['t4', 'thyroxine', 'total t4', 'free t4', 'ft4'],
    displayName: 'T4',
    fullName: 'Thyroxine · Thyroid hormone',
    unit: 'μg/dL',
    category: 'thyroid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 4.5, high: 11.2, criticalLow: 1.0, criticalHigh: 20 },
    },
  },

  // ── KIDNEY ───────────────────────────────────────────────────────────────

  creatinine: {
    id: 'creatinine',
    names: ['creatinine', 'creat', 's. creatinine', 'serum creatinine'],
    displayName: 'Creatinine',
    fullName: 'Creatinine · Kidney filtration marker',
    unit: 'mg/dL',
    category: 'kidney',
    resultType: 'numeric',
    ranges: {
      male:   { low: 0.7, high: 1.3, criticalLow: 0.1, criticalHigh: 10.0 },
      female: { low: 0.6, high: 1.1, criticalLow: 0.1, criticalHigh: 10.0 },
    },
  },

  bun: {
    id: 'bun',
    names: ['bun', 'blood urea nitrogen', 'urea nitrogen'],
    displayName: 'BUN',
    fullName: 'Blood Urea Nitrogen · Kidney waste marker',
    unit: 'mg/dL',
    category: 'kidney',
    resultType: 'numeric',
    ranges: {
      universal: { low: 7, high: 20, criticalLow: 2, criticalHigh: 100 },
    },
  },

  urea: {
    id: 'urea',
    names: ['urea', 'serum urea', 'blood urea', 's. urea'],
    displayName: 'Urea',
    fullName: 'Blood Urea · Kidney waste product',
    unit: 'mg/dL',
    category: 'kidney',
    resultType: 'numeric',
    ranges: {
      universal: { low: 15, high: 45, criticalLow: 5, criticalHigh: 200 },
    },
  },

  egfr: {
    id: 'egfr',
    names: ['egfr', 'gfr', 'estimated gfr', 'estimated glomerular filtration rate'],
    displayName: 'eGFR',
    fullName: 'Estimated Glomerular Filtration Rate',
    unit: 'mL/min/1.73m²',
    category: 'kidney',
    resultType: 'numeric',
    ranges: {
      universal: { low: 60, high: 120, criticalLow: 15, criticalHigh: 150 },
    },
  },

  uric_acid: {
    id: 'uric_acid',
    names: ['uric acid', 's. uric acid', 'serum uric acid', 'ua'],
    displayName: 'Uric Acid',
    fullName: 'Uric Acid · Gout marker',
    unit: 'mg/dL',
    category: 'kidney',
    resultType: 'numeric',
    ranges: {
      male:   { low: 3.5, high: 7.2, criticalLow: 1.0, criticalHigh: 15.0 },
      female: { low: 2.6, high: 6.0, criticalLow: 1.0, criticalHigh: 15.0 },
    },
  },

  // ── LIPID ────────────────────────────────────────────────────────────────

  cholesterol_total: {
    id: 'cholesterol_total',
    names: ['total cholesterol', 'cholesterol', 'chol', 'tc'],
    displayName: 'Total Cholesterol',
    fullName: 'Total Cholesterol · Blood fat',
    unit: 'mg/dL',
    category: 'lipid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0, high: 200, criticalLow: 0, criticalHigh: 400 },
    },
  },

  hdl: {
    id: 'hdl',
    names: ['hdl', 'hdl cholesterol', 'hdl-c', 'good cholesterol'],
    displayName: 'HDL',
    fullName: 'HDL Cholesterol · "Good" cholesterol',
    unit: 'mg/dL',
    category: 'lipid',
    resultType: 'numeric',
    ranges: {
      male:   { low: 40, high: 60, criticalLow: 20, criticalHigh: 120 },
      female: { low: 50, high: 60, criticalLow: 20, criticalHigh: 120 },
    },
  },

  ldl: {
    id: 'ldl',
    names: ['ldl', 'ldl cholesterol', 'ldl-c', 'bad cholesterol'],
    displayName: 'LDL',
    fullName: 'LDL Cholesterol · "Bad" cholesterol',
    unit: 'mg/dL',
    category: 'lipid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0, high: 100, criticalLow: 0, criticalHigh: 300 },
    },
  },

  triglycerides: {
    id: 'triglycerides',
    names: ['triglycerides', 'tg', 'trigs', 'triglyceride'],
    displayName: 'Triglycerides',
    fullName: 'Triglycerides · Blood fat storage',
    unit: 'mg/dL',
    category: 'lipid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0, high: 150, criticalLow: 0, criticalHigh: 1000 },
    },
  },

  vldl: {
    id: 'vldl',
    names: ['vldl', 'vldl cholesterol', 'vldl-c'],
    displayName: 'VLDL',
    fullName: 'VLDL Cholesterol · Very low density lipoprotein',
    unit: 'mg/dL',
    category: 'lipid',
    resultType: 'numeric',
    ranges: {
      universal: { low: 2, high: 30, criticalLow: 0, criticalHigh: 100 },
    },
  },

  // ── DIABETES ─────────────────────────────────────────────────────────────

  glucose_fasting: {
    id: 'glucose_fasting',
    names: ['fasting glucose', 'fbs', 'fasting blood sugar', 'glucose fasting', 'fasting blood glucose', 'fbg'],
    displayName: 'Fasting Glucose',
    fullName: 'Fasting Blood Sugar · Diabetes marker',
    unit: 'mg/dL',
    category: 'diabetes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 70, high: 99, criticalLow: 40, criticalHigh: 500 },
    },
  },

  glucose_random: {
    id: 'glucose_random',
    names: ['random glucose', 'rbs', 'random blood sugar', 'glucose random', 'rbg'],
    displayName: 'Random Glucose',
    fullName: 'Random Blood Sugar',
    unit: 'mg/dL',
    category: 'diabetes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 70, high: 140, criticalLow: 40, criticalHigh: 600 },
    },
  },

  hba1c: {
    id: 'hba1c',
    names: ['hba1c', 'hb a1c', 'glycated hemoglobin', 'glycosylated hemoglobin', 'a1c'],
    displayName: 'HbA1c',
    fullName: 'Glycated Hemoglobin · 3-month blood sugar average',
    unit: '%',
    category: 'diabetes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0, high: 5.7, criticalLow: 0, criticalHigh: 15 },
    },
  },

  // ── ELECTROLYTES ─────────────────────────────────────────────────────────

  sodium: {
    id: 'sodium',
    names: ['sodium', 'na', 'serum sodium', 's. sodium'],
    displayName: 'Sodium',
    fullName: 'Sodium · Fluid & nerve balance',
    unit: 'mEq/L',
    category: 'electrolytes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 136, high: 145, criticalLow: 120, criticalHigh: 160 },
    },
  },

  potassium: {
    id: 'potassium',
    names: ['potassium', 'k', 'serum potassium', 's. potassium'],
    displayName: 'Potassium',
    fullName: 'Potassium · Heart & muscle function',
    unit: 'mEq/L',
    category: 'electrolytes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 3.5, high: 5.0, criticalLow: 2.5, criticalHigh: 6.5 },
    },
  },

  calcium: {
    id: 'calcium',
    names: ['calcium', 'ca', 'serum calcium', 's. calcium'],
    displayName: 'Calcium',
    fullName: 'Calcium · Bone & muscle function',
    unit: 'mg/dL',
    category: 'electrolytes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 8.5, high: 10.5, criticalLow: 6.0, criticalHigh: 14.0 },
    },
  },

  magnesium: {
    id: 'magnesium',
    names: ['magnesium', 'mg', 'serum magnesium', 's. magnesium'],
    displayName: 'Magnesium',
    fullName: 'Magnesium · Muscle & enzyme function',
    unit: 'mg/dL',
    category: 'electrolytes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 1.7, high: 2.2, criticalLow: 1.0, criticalHigh: 4.0 },
    },
  },

  chloride: {
    id: 'chloride',
    names: ['chloride', 'cl', 'serum chloride'],
    displayName: 'Chloride',
    fullName: 'Chloride · Fluid balance',
    unit: 'mEq/L',
    category: 'electrolytes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 96, high: 106, criticalLow: 80, criticalHigh: 120 },
    },
  },

  bicarbonate: {
    id: 'bicarbonate',
    names: ['bicarbonate', 'hco3', 'co2', 'bicarb'],
    displayName: 'Bicarbonate',
    fullName: 'Bicarbonate · Acid-base balance',
    unit: 'mEq/L',
    category: 'electrolytes',
    resultType: 'numeric',
    ranges: {
      universal: { low: 22, high: 29, criticalLow: 10, criticalHigh: 40 },
    },
  },

  // ── CARDIAC ──────────────────────────────────────────────────────────────

  crp: {
    id: 'crp',
    names: ['crp', 'c-reactive protein', 'c reactive protein', 'hs-crp'],
    displayName: 'CRP',
    fullName: 'C-Reactive Protein · Inflammation marker',
    unit: 'mg/L',
    category: 'cardiac',
    resultType: 'numeric',
    ranges: {
      universal: { low: 0, high: 5.0, criticalLow: 0, criticalHigh: 200 },
    },
  },

  esr: {
    id: 'esr',
    names: ['esr', 'erythrocyte sedimentation rate', 'sed rate'],
    displayName: 'ESR',
    fullName: 'Erythrocyte Sedimentation Rate · Inflammation',
    unit: 'mm/hr',
    category: 'cardiac',
    resultType: 'numeric',
    ranges: {
      male:   { low: 0, high: 15, criticalLow: 0, criticalHigh: 120 },
      female: { low: 0, high: 20, criticalLow: 0, criticalHigh: 120 },
    },
  },

  vitamin_d: {
    id: 'vitamin_d',
    names: ['vitamin d', 'vit d', '25-oh vitamin d', '25-hydroxyvitamin d', '25(oh)d', 'vitamin d3'],
    displayName: 'Vitamin D',
    fullName: 'Vitamin D · Bone & immune health',
    unit: 'ng/mL',
    category: 'cardiac',
    resultType: 'numeric',
    ranges: {
      universal: { low: 30, high: 100, criticalLow: 10, criticalHigh: 150 },
    },
  },

  vitamin_b12: {
    id: 'vitamin_b12',
    names: ['vitamin b12', 'vit b12', 'b12', 'cobalamin', 'cyanocobalamin'],
    displayName: 'Vitamin B12',
    fullName: 'Vitamin B12 · Nerve & blood cell health',
    unit: 'pg/mL',
    category: 'cardiac',
    resultType: 'numeric',
    ranges: {
      universal: { low: 200, high: 900, criticalLow: 100, criticalHigh: 2000 },
    },
  },
}

// Build a flat lookup: normalized alias → markerId
export const MARKER_ALIAS_MAP: Record<string, string> = {}
for (const [id, marker] of Object.entries(LAB_MARKERS)) {
  for (const name of marker.names) {
    MARKER_ALIAS_MAP[name.toLowerCase().trim()] = id
  }
}
