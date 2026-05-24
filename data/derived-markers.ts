import { MarkerCategory } from '@/types/lab'

export interface DerivedMarkerDef {
  id: string
  displayName: string
  fullName: string
  unit: string
  category: MarkerCategory
  requiredMarkers: string[]   // marker IDs that must be present to calculate
  calculate: (values: Record<string, number>) => number | null
  formula: string             // human-readable formula
  ranges?: {
    male?: { low: number; high: number; criticalLow: number; criticalHigh: number }
    female?: { low: number; high: number; criticalLow: number; criticalHigh: number }
    universal?: { low: number; high: number; criticalLow: number; criticalHigh: number }
  }
}

export const DERIVED_MARKER_DEFS: DerivedMarkerDef[] = [
  {
    id: 'homa_ir',
    displayName: 'HOMA-IR',
    fullName: 'Homeostatic Model Assessment of Insulin Resistance',
    unit: 'index',
    category: 'derived',
    requiredMarkers: ['glucose_fasting', 'fasting_insulin'],
    calculate: (v) => {
      const glucose = v.glucose_fasting || v.fbs || v.glucose
      const insulin = v.fasting_insulin || v.insulin
      if (!glucose || !insulin) return null
      return (glucose * insulin) / 405
    },
    formula: '(Fasting Glucose mg/dL × Fasting Insulin μIU/mL) / 405',
    ranges: {
      universal: {
        low: 0.5,
        high: 2.0,      // <2.0 = normal insulin sensitivity
        criticalLow: 0,
        criticalHigh: 5.0  // >5.0 = severe insulin resistance
      }
    }
  },

  {
    id: 'ldl_friedewald',
    displayName: 'LDL (Calculated)',
    fullName: 'Low-Density Lipoprotein (Friedewald Formula)',
    unit: 'mg/dL',
    category: 'derived',
    requiredMarkers: ['total_cholesterol', 'hdl', 'triglycerides'],
    calculate: (v) => {
      const tc = v.total_cholesterol || v.cholesterol
      const hdl = v.hdl
      const tg = v.triglycerides || v.trig
      if (!tc || !hdl || !tg) return null
      if (tg > 400) return null // Formula invalid above 400 mg/dL triglycerides
      return tc - hdl - (tg / 5)
    },
    formula: 'Total Cholesterol − HDL − (Triglycerides / 5)',
    ranges: {
      universal: {
        low: 0,
        high: 100,      // Optimal <100, borderline 100-129, high ≥130
        criticalLow: 0,
        criticalHigh: 190
      }
    }
  },

  {
    id: 'bun_creatinine_ratio',
    displayName: 'BUN/Creatinine Ratio',
    fullName: 'Blood Urea Nitrogen to Creatinine Ratio',
    unit: 'ratio',
    category: 'derived',
    requiredMarkers: ['bun', 'creatinine'],
    calculate: (v) => {
      if (!v.bun || !v.creatinine) return null
      return v.bun / v.creatinine
    },
    formula: 'BUN / Creatinine',
    ranges: {
      universal: {
        low: 6,
        high: 20,       // Normal 10-20, <10 suggests liver disease or malnutrition, >20 suggests prerenal issues
        criticalLow: 3,
        criticalHigh: 35
      }
    }
  },

  {
    id: 'ast_alt_ratio',
    displayName: 'AST/ALT Ratio',
    fullName: 'Aspartate Aminotransferase to Alanine Aminotransferase Ratio',
    unit: 'ratio',
    category: 'derived',
    requiredMarkers: ['ast', 'alt'],
    calculate: (v) => {
      if (!v.ast || !v.alt) return null
      if (v.alt === 0) return null
      return v.ast / v.alt
    },
    formula: 'AST / ALT',
    ranges: {
      universal: {
        low: 0.5,
        high: 1.2,      // >2 suggests alcoholic liver disease or cirrhosis
        criticalLow: 0,
        criticalHigh: 4
      }
    }
  },

  {
    id: 'anion_gap',
    displayName: 'Anion Gap',
    fullName: 'Anion Gap · Acid-base balance indicator',
    unit: 'mEq/L',
    category: 'derived',
    requiredMarkers: ['sodium', 'chloride', 'bicarbonate'],
    calculate: (v) => {
      const na = v.sodium || v.na
      const cl = v.chloride || v.cl
      const hco3 = v.bicarbonate || v.hco3 || v.co2
      if (!na || !cl || !hco3) return null
      return na - (cl + hco3)
    },
    formula: 'Sodium − (Chloride + Bicarbonate)',
    ranges: {
      universal: {
        low: 3,
        high: 12,       // Normal 8-12, >12 suggests metabolic acidosis
        criticalLow: 0,
        criticalHigh: 20
      }
    }
  },

  {
    id: 'non_hdl_cholesterol',
    displayName: 'Non-HDL Cholesterol',
    fullName: 'Non-HDL Cholesterol · Atherogenic lipoproteins',
    unit: 'mg/dL',
    category: 'derived',
    requiredMarkers: ['total_cholesterol', 'hdl'],
    calculate: (v) => {
      const tc = v.total_cholesterol || v.cholesterol
      const hdl = v.hdl
      if (!tc || !hdl) return null
      return tc - hdl
    },
    formula: 'Total Cholesterol − HDL',
    ranges: {
      universal: {
        low: 0,
        high: 130,      // Optimal <130, borderline 130-159, high ≥160
        criticalLow: 0,
        criticalHigh: 220
      }
    }
  },

  {
    id: 'cardiac_risk_ratio',
    displayName: 'Cardiac Risk Ratio',
    fullName: 'Total Cholesterol to HDL Ratio',
    unit: 'ratio',
    category: 'derived',
    requiredMarkers: ['total_cholesterol', 'hdl'],
    calculate: (v) => {
      const tc = v.total_cholesterol || v.cholesterol
      const hdl = v.hdl
      if (!tc || !hdl || hdl === 0) return null
      return tc / hdl
    },
    formula: 'Total Cholesterol / HDL',
    ranges: {
      male: {
        low: 1,
        high: 5.0,      // Optimal <3.5 for men, <3.0 for women
        criticalLow: 0,
        criticalHigh: 9.0
      },
      female: {
        low: 1,
        high: 4.5,
        criticalLow: 0,
        criticalHigh: 7.0
      }
    }
  },

  {
    id: 'psa_ratio',
    displayName: 'Free/Total PSA Ratio',
    fullName: 'Free PSA to Total PSA Ratio',
    unit: '%',
    category: 'derived',
    requiredMarkers: ['psa_total', 'psa_free'],
    calculate: (v) => {
      if (!v.psa_total || !v.psa_free || v.psa_total === 0) return null
      return (v.psa_free / v.psa_total) * 100
    },
    formula: '(Free PSA / Total PSA) × 100',
    ranges: {
      universal: {
        low: 10,        // <10% suggests higher cancer risk
        high: 25,       // >25% suggests lower cancer risk
        criticalLow: 0,
        criticalHigh: 50
      }
    }
  }
]
