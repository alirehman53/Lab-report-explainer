Here's the complete master prompt — covers every type of lab test, all edge cases, all parsers:

---

```
SYSTEM CONTEXT
==============
You are an expert Next.js 14 (App Router) developer and medical data engineer.
You are extending a project called LabLens — a healthcare lab report explainer
built with Next.js 14, TypeScript, plain SCSS Modules (no Tailwind, no shadcn),
and a Hugging Face LLM backend (moonshotai/Kimi-K2-Instruct-0905) via the
OpenAI-compatible router.

The system has a two-layer fallback architecture that must NEVER be broken:

LAYER 1 — OFFLINE ENGINE (always runs, zero API, zero cost)
  All logic lives in data/ files as hardcoded TypeScript.
  This layer ALWAYS returns a complete ReportAnalysis regardless of
  whether the AI is available or not.

LAYER 2 — AI ENRICHMENT (optional, best-effort, fails silently)
  Calls Hugging Face. If it fails for any reason, Layer 1 result is
  returned untouched. The user never sees an error from the AI layer.


════════════════════════════════════════════════════════════
COMPLETE TYPE SYSTEM
════════════════════════════════════════════════════════════

// types/lab.ts

export type MarkerStatus =
  | 'normal'
  | 'low'
  | 'high'
  | 'critical-low'
  | 'critical-high'

export type QualitativeStatus =
  | 'negative'       // non-reactive, not detected, absent
  | 'positive'       // reactive, detected, present
  | 'borderline'     // equivocal, indeterminate, weakly reactive
  | 'trace'          // trace amounts detected
  | 'info'           // informational only (blood group, Rh factor)

export type MarkerCategory =
  | 'cbc'
  | 'iron'
  | 'liver'
  | 'thyroid'
  | 'kidney'
  | 'lipid'
  | 'diabetes'
  | 'electrolytes'
  | 'cardiac'
  | 'hormones-female'
  | 'hormones-male'
  | 'hormones-adrenal'
  | 'coagulation'
  | 'tumor-markers'
  | 'infectious-serology'
  | 'autoimmune'
  | 'urinalysis-numeric'
  | 'urinalysis-qualitative'
  | 'bone-minerals'
  | 'vitamins-nutrition'
  | 'allergy-immunology'
  | 'drug-monitoring'
  | 'cardiac-markers'
  | 'stool'
  | 'csf'
  | 'derived'        // calculated markers (HOMA-IR, LDL-Friedewald, etc.)

export type ResultType = 'numeric' | 'qualitative' | 'titre' | 'ratio' | 'derived'

export interface PatientContext {
  gender: 'male' | 'female' | 'unknown'
  age?: number      // in years; undefined = adult assumed
}

export interface RangeSet {
  low: number
  high: number
  criticalLow: number
  criticalHigh: number
}

export interface AgeAdjustedRange {
  ageMin: number     // inclusive
  ageMax: number     // inclusive
  ranges: {
    male?: RangeSet
    female?: RangeSet
    universal?: RangeSet
  }
}

export interface LabMarker {
  id: string
  names: string[]           // all aliases for parser matching
  displayName: string
  fullName: string
  unit: string
  category: MarkerCategory
  resultType: ResultType
  ranges?: {
    male?: RangeSet
    female?: RangeSet
    universal?: RangeSet
  }
  ageRanges?: AgeAdjustedRange[]   // overrides ranges when age is provided
  derivedFrom?: string[]           // marker IDs needed to calculate this
  formula?: string                 // human-readable formula for documentation
}

export interface QualitativeMarker {
  id: string
  names: string[]
  displayName: string
  fullName: string
  category: MarkerCategory
  resultType: 'qualitative' | 'titre'
  // For qualitative: what strings map to which status
  positiveAliases: string[]   // 'reactive', 'positive', 'detected', etc.
  negativeAliases: string[]   // 'non-reactive', 'negative', 'not detected', etc.
  borderlineAliases: string[] // 'equivocal', 'indeterminate', 'weakly reactive'
  traceAliases: string[]      // 'trace', 'trace amounts'
  // For titre: threshold above which result is clinically significant
  titreThreshold?: number     // e.g. 1:80 for Widal = significant at 80
}

export interface ParsedValue {
  markerId: string
  rawName: string
  value: number
  unit?: string
  resultType: 'numeric' | 'derived'
}

export interface ParsedQualitativeValue {
  markerId: string
  rawName: string
  status: QualitativeStatus
  rawValue: string          // exactly what was on the report
  titreValue?: number       // for Widal/ASO titre results
  resultType: 'qualitative' | 'titre'
}

export interface AnalyzedResult {
  markerId: string
  displayName: string
  fullName: string
  value: number
  unit: string
  status: MarkerStatus
  normalRange: string
  percentPosition: number   // 0–100 for status bar UI
  explanation: string
  severity: 1 | 2 | 3
  category: MarkerCategory
  resultType: 'numeric' | 'derived'
  isDerived?: boolean
}

export interface AnalyzedQualitativeResult {
  markerId: string
  displayName: string
  fullName: string
  rawValue: string
  status: QualitativeStatus
  explanation: string
  severity: 1 | 2 | 3
  category: MarkerCategory
  resultType: 'qualitative' | 'titre'
  titreValue?: number
  clinicalSignificance: 'none' | 'monitor' | 'action-required' | 'urgent'
}

export interface Pattern {
  id: string
  name: string
  confidence: 'likely' | 'possible'
  markerIds: string[]
  explanation: string
}

export interface ReportAnalysis {
  // Numeric results (existing)
  results: AnalyzedResult[]
  // Qualitative results (new)
  qualitativeResults: AnalyzedQualitativeResult[]
  // Derived/calculated results
  derivedResults: AnalyzedResult[]
  // Pattern detection across ALL result types
  detectedPatterns: Pattern[]
  doctorQuestions: string[]
  summary: {
    normal: number
    low: number
    high: number
    critical: number
    positive: number      // qualitative positives
    negative: number      // qualitative negatives
    borderline: number    // qualitative borderlines
  }
  source: 'ai' | 'offline' | 'hybrid'
  patientContext: PatientContext
}


════════════════════════════════════════════════════════════
EXISTING ARCHITECTURE (do not modify these files)
════════════════════════════════════════════════════════════

lib/llm.ts          — callLLM(prompt, apiKey, maxTokens) → LLMResponse
lib/prompts.ts      — buildLabPrompt(rawText, offlineResult) → string
app/api/analyze/route.ts — POST handler, calls analyzeReport()

These files accept the updated ReportAnalysis type but their internal
logic must not be changed.


════════════════════════════════════════════════════════════
FILES TO GENERATE
════════════════════════════════════════════════════════════

You will generate these files completely, in order:

──────────────────────────────────────────────────────────
FILE 1: data/markers.ts  (NUMERIC markers — extend existing)
──────────────────────────────────────────────────────────
Add ALL of the following marker categories. Each marker entry must follow
the exact LabMarker interface. Include ageRanges[] for any marker where
pediatric or elderly ranges differ significantly from adult ranges.

CATEGORIES TO INCLUDE (with minimum markers per category):

CBC (already exists — keep, add pediatric age ranges)
Iron Studies (already exists — keep)
Liver Panel (already exists — keep)
Thyroid Panel (already exists — keep)
Kidney Function (already exists — keep)
Lipid Panel (already exists — keep)
Blood Sugar / Diabetes (already exists — keep)
Electrolytes (already exists — keep)
Inflammation & Vitamins (already exists — keep)

NEW NUMERIC CATEGORIES:

Female Hormones:
  FSH, LH, Estradiol (E2), Progesterone, Prolactin, AMH,
  Beta-hCG (quantitative), SHBG, Total Testosterone (female),
  Free Testosterone (female)
  Note: FSH/LH/Estradiol ranges vary by menstrual cycle phase —
  include ranges for: follicular, ovulatory, luteal, postmenopausal

Male Hormones:
  Total Testosterone, Free Testosterone, SHBG, FSH (male), LH (male),
  Prolactin (male), DHEA-S, Estradiol (male)

Adrenal Hormones:
  Cortisol (morning), Cortisol (random/evening), ACTH,
  Aldosterone, DHEA-S, 17-OH Progesterone

Coagulation:
  PT (Prothrombin Time), INR, aPTT, Fibrinogen, D-Dimer,
  Thrombin Time, Bleeding Time, Clotting Time, Factor VIII,
  Factor IX, Protein C, Protein S, Anti-thrombin III

Tumor Markers:
  PSA (Total), PSA (Free), Free/Total PSA ratio,
  CA-125, CA 19-9, CA 15-3, CEA, AFP (tumor),
  Beta-hCG (tumor), LDH, NSE, Cyfra 21-1, CA 72-4

Cardiac Markers:
  Troponin I, Troponin T, hs-Troponin I, hs-Troponin T,
  BNP, NT-proBNP, CK (total), CK-MB, CK-MB mass,
  Myoglobin, Homocysteine, Lipoprotein(a), hs-CRP

Bone & Minerals:
  PTH (intact), Phosphorus, Bone-specific ALP,
  Zinc, Copper, Selenium, Osteocalcin,
  25-OH Vitamin D (already exists — keep),
  1,25-OH Vitamin D, Calcium (already exists — keep)

Vitamins & Nutrition:
  Folate (serum), RBC Folate, Vitamin B1 (Thiamine),
  Vitamin B6 (Pyridoxine), Vitamin A (Retinol),
  Vitamin E (Alpha-tocopherol), Omega-3 Index, CoQ10,
  Vitamin C (Ascorbic acid)

Allergy & Immunology:
  Total IgE, IgG (total), IgA (total), IgM (total),
  IgG subclasses (IgG1, IgG2, IgG3, IgG4),
  Complement C3, Complement C4, CH50

Drug Monitoring:
  Digoxin, Phenytoin, Valproic Acid, Carbamazepine,
  Lithium, Cyclosporine, Tacrolimus, Methotrexate,
  Vancomycin (trough), Gentamicin (peak/trough),
  Theophylline, Phenobarbitone

Urinalysis Numeric:
  Urine pH, Urine Specific Gravity, Urine Protein (quantitative),
  Urine Glucose (quantitative), Urine Creatinine,
  Urine Albumin, Urine Albumin/Creatinine ratio (ACR),
  Urine Protein/Creatinine ratio, Urine Calcium,
  Urine Uric Acid, Urine Osmolality,
  Urine RBCs/HPF (microscopy), Urine WBCs/HPF (microscopy),
  Urine Casts/LPF

CSF (Cerebrospinal Fluid):
  CSF Glucose, CSF Protein, CSF WBC count, CSF RBC count,
  CSF Chloride, Opening Pressure

Autoimmune Numeric:
  Anti-dsDNA (quantitative), Complement C3, Complement C4,
  IgG (quantitative — already above), RF (quantitative),
  Anti-CCP (quantitative), ANCA (quantitative)

Stool Numeric:
  Calprotectin (fecal), Lactoferrin (fecal), Elastase (fecal),
  Occult Blood (quantitative)

DERIVED MARKERS (include formula in formula field):
  HOMA-IR = (Fasting Glucose mg/dL × Fasting Insulin μIU/mL) / 405
  LDL-Friedewald = Total Cholesterol − HDL − (Triglycerides / 5)
  BUN/Creatinine ratio = BUN / Creatinine
  AST/ALT ratio = AST / ALT
  Free T4 Index = T4 × T3-uptake
  Anion Gap = Sodium − (Chloride + Bicarbonate)
  eGFR-CKD-EPI (simplified approximation from creatinine + age + gender)
  Total PSA/Free PSA ratio (already listed above)
  Non-HDL Cholesterol = Total Cholesterol − HDL
  Cardiac Risk Ratio = Total Cholesterol / HDL

MARKER ALIASES RULE:
Every marker's names[] array must include every variation a Pakistani
diagnostic lab might print, including:
- Full English name
- Common abbreviation
- Any alternate abbreviation
- Urdu-transliterated version if commonly used
- How Chughtai Lab, Aga Khan, Excel Lab, Essa Lab typically print it
Example for Hemoglobin:
  ['hemoglobin', 'hb', 'hgb', 'haemoglobin', 'hb conc', 'blood hemoglobin']

AGE RANGES RULE:
Add ageRanges[] for these markers (at minimum):
  Hemoglobin:   neonate (0–1mo), infant (1–12mo), child (1–12y), adolescent (12–18y)
  WBC:          neonate, infant, child, adolescent
  Platelets:    neonate, infant, child
  ALP:          child (0–12y) — 3–4× higher than adult
  PSA:          40–49y, 50–59y, 60–69y, 70+y (age-specific PSA thresholds)
  Creatinine:   child (0–12y), adolescent (12–18y)
  TSH:          neonate (0–4d), infant (2w–1y), child (1–12y)
  Cortisol:     child vs adult (different morning ranges)
  GH / IGF-1:   wide variation by age and puberty stage


──────────────────────────────────────────────────────────
FILE 2: data/qualitative-markers.ts  (NEW FILE)
──────────────────────────────────────────────────────────
Define QualitativeMarker for every test that returns text, not a number.

CATEGORIES AND MARKERS:

Infectious Serology:
  HBsAg (Hepatitis B surface antigen)
  Anti-HBs (Hepatitis B surface antibody)
  HBeAg (Hepatitis B e antigen)
  Anti-HBe (Hepatitis B e antibody)
  Anti-HBc IgM (Hepatitis B core antibody, acute)
  Anti-HBc Total (Hepatitis B core antibody, total)
  HCV Antibody (Hepatitis C antibody)
  HCV RNA (qualitative PCR)
  HBV DNA (qualitative PCR)
  HIV 1/2 Antibody
  HIV p24 Antigen
  HIV Ag/Ab Combo
  Dengue NS1 Antigen
  Dengue IgM
  Dengue IgG
  Typhoid IgM (Typhidot)
  Typhoid IgG (Typhidot)
  Malaria RDT (P. falciparum antigen)
  Malaria RDT (P. vivax antigen)
  H. pylori Antibody (serum)
  H. pylori Stool Antigen
  CMV IgM
  CMV IgG
  EBV VCA IgM
  EBV VCA IgG
  Toxoplasma IgM
  Toxoplasma IgG
  Rubella IgM
  Rubella IgG
  Varicella IgM
  Varicella IgG
  HSV 1/2 IgM
  HSV 1/2 IgG
  COVID-19 Antigen (rapid)
  COVID-19 IgM
  COVID-19 IgG
  SARS-CoV-2 RNA (qualitative PCR)
  Typhoid blood culture (positive/negative)
  Urine culture (positive/negative — organism reported separately)
  Blood culture (positive/negative)
  Throat culture (positive/negative)
  Stool culture (positive/negative)

Autoimmune Qualitative:
  ANA (Antinuclear Antibody) — positive/negative + pattern
  Anti-dsDNA (qualitative)
  Anti-Smith (Anti-Sm)
  Anti-SSA (Ro)
  Anti-SSB (La)
  Anti-Scl-70
  Anti-Jo-1
  Anti-histone
  p-ANCA
  c-ANCA
  Rheumatoid Factor (qualitative)
  Anti-CCP (qualitative)
  Anti-phospholipid IgM
  Anti-phospholipid IgG
  Lupus Anticoagulant
  Direct Coombs Test
  Indirect Coombs Test

Urinalysis Qualitative:
  Urine Appearance (clear / turbid / cloudy / hazy)
  Urine Color (yellow / pale / dark / amber / red)
  Urine Protein (dipstick: negative / trace / 1+ / 2+ / 3+)
  Urine Glucose (dipstick: negative / trace / 1+ / 2+ / 3+)
  Urine Ketones (negative / trace / 1+ / 2+ / 3+)
  Urine Blood (negative / trace / 1+ / 2+ / 3+)
  Urine Nitrites (negative / positive)
  Urine Leukocyte Esterase (negative / trace / 1+ / 2+ / 3+)
  Urine Bilirubin (negative / 1+ / 2+ / 3+)
  Urine Urobilinogen (normal / 1+ / 2+ / 3+)
  Urine Casts (hyaline / granular / RBC / WBC / waxy — qualitative)
  Urine Crystals (uric acid / calcium oxalate / triple phosphate / none)
  Urine Bacteria (none / few / moderate / many)

Stool Analysis:
  Stool Consistency (formed / soft / loose / watery)
  Stool Color (brown / yellow / green / black / red / pale)
  Stool Blood (occult — positive/negative)
  Stool Mucus (absent / present)
  Stool Pus Cells (none / few / moderate / many /HPF)
  Stool RBCs (none / few / moderate / many /HPF)
  Ova & Parasites (negative / positive — organism named)
  H. pylori Stool Antigen (positive/negative — already above)
  Giardia Antigen (positive/negative)
  Cryptosporidium Antigen (positive/negative)
  Clostridium difficile Toxin (positive/negative)

Pregnancy & Fertility:
  Urine Pregnancy Test (hCG) — positive/negative
  Serum Pregnancy Test (qualitative hCG)
  Fern Test (cervical mucus)
  Post-coital Test

Blood Group & Compatibility:
  ABO Blood Group (A / B / AB / O)
  Rh Factor (positive / negative)
  Crossmatch (compatible / incompatible)

Genetic & Molecular:
  Factor V Leiden (present / absent)
  MTHFR C677T (normal / heterozygous / homozygous)
  HLA-B27 (positive / negative)
  BCR-ABL (positive / negative)
  JAK2 V617F (positive / negative)
  BRCA1 / BRCA2 (positive / negative)

Microbiology Sensitivity:
  Sensitivity results (sensitive / intermediate / resistant)
  — for common antibiotics reported alongside cultures

Titre-format Tests:
  Widal Test (Salmonella typhi H: titre, Salmonella typhi O: titre,
              Salmonella paratyphi AH, BH — titres like 1:80, 1:160)
  ASO Titre (Anti-Streptolysin O — titre value, significant if >200 IU/mL)
  RF Titre (if reported as titre rather than numeric)
  ANA Titre (1:40, 1:80, 1:160, 1:320 — significant at ≥1:80)
  Anti-dsDNA Titre
  Cold Agglutinin Titre

ALIASES RULE FOR QUALITATIVE:
positiveAliases must include every variation labs use:
  ['reactive', 'positive', 'detected', 'present', 'pos', 'react',
   'weakly reactive', 'repeatedly reactive', '(+)', 'yes', 'found']
negativeAliases must include:
  ['non-reactive', 'negative', 'not detected', 'absent', 'neg',
   'non react', 'nr', '(-)', 'no', 'not found', 'normal']
borderlineAliases:
  ['equivocal', 'indeterminate', 'borderline', 'weakly positive',
   'repeat testing recommended', 'grey zone']


──────────────────────────────────────────────────────────
FILE 3: data/interpretations.ts  (extend existing)
──────────────────────────────────────────────────────────
Add plain-language interpretations for all NEW numeric markers added in File 1.
Follow the exact existing format:

export const INTERPRETATIONS: Record<string, Partial<Record<MarkerStatus, string>>> = {
  // existing...
  // new additions:
  fsh: {
    low:    "...",
    normal: "...",
    high:   "...",
  },
  // etc.
}

LANGUAGE RULES:
- Written for a Pakistani patient with no medical background
- Warm, non-alarmist — unless the value is genuinely critical
- Specific to the marker — never copy-paste generic text
- When relevant, mention Pakistani/South Asian context:
  * High hepatitis B/C prevalence
  * Common Vitamin D deficiency
  * High thalassemia trait rate (South Asia)
  * High diabetes/prediabetes prevalence
  * Common dengue/typhoid in Pakistani summers
  * High uric acid/gout in meat-rich diets
  * Common H. pylori infection rate in Pakistan
- For hormone markers: mention cycle phase context where relevant
- For drug monitoring: explain the concept of therapeutic range
- For tumor markers: explicitly state these are screening tools,
  not diagnostic — elevated ≠ cancer, reduced anxiety is important
- For INR/PT: explain context for patients on warfarin vs not


──────────────────────────────────────────────────────────
FILE 4: data/qualitative-interpretations.ts  (NEW FILE)
──────────────────────────────────────────────────────────
Provide interpretations for every QualitativeMarker across every status.

Format:
export const QUALITATIVE_INTERPRETATIONS: Record
  string,
  Partial<Record<QualitativeStatus, string>>
> = {
  hbsag: {
    negative:   "HBsAg negative means you are not currently infected...",
    positive:   "HBsAg positive means the Hepatitis B virus is present...",
    borderline: "Your result is borderline. This needs repeat testing...",
  },
  // all markers
}

CRITICAL RULES FOR QUALITATIVE INTERPRETATIONS:
1. For infectious disease positives — explain what the test detects,
   what it means, and what the immediate next step is.
   Never just say "you have X disease" from a single screening test.
   Always note that confirmatory testing may be needed.
2. For HIV — be especially careful, compassionate, and non-stigmatizing.
   A reactive screening result needs confirmatory testing.
   Always recommend speaking to a doctor and mention that treatment
   today allows people with HIV to live full, healthy lives.
3. For cancer markers — explicitly state that elevation does not mean cancer.
   Many benign conditions cause marker elevation.
4. For Hepatitis B — explain the difference between HBsAg (infection)
   vs Anti-HBs (immunity from vaccine or past infection).
5. For Widal/Typhoid — explain the limitation of Widal test
   (cross-reactivity, endemic baseline titres in Pakistan).
6. For blood group — explain what it means practically (transfusions,
   pregnancy Rh-incompatibility).
7. For ANA — explain that low-titre positivity is common in healthy
   people and does not mean lupus.
8. For pregnancy test — warm, informative, considers both
   planned and unplanned pregnancy scenarios.


──────────────────────────────────────────────────────────
FILE 5: data/patterns.ts  (extend existing)
──────────────────────────────────────────────────────────
Add pattern detection for ALL new categories.
Patterns can now span BOTH numeric and qualitative results.

New helper functions needed:
  isPositive(id, qualResults)   → boolean
  isNegative(id, qualResults)   → boolean
  isBorderline(id, qualResults) → boolean
  hasTitreAbove(id, threshold, qualResults) → boolean
  hasQualMarker(id, qualResults) → boolean

New patterns to add (minimum — add more where clinically relevant):

Hepatitis:
  'hepatitis-b-active'        HBsAg+ AND HBeAg+ (high replication)
  'hepatitis-b-carrier'       HBsAg+ AND HBeAg- AND Anti-HBe+
  'hepatitis-b-immune-vaccine' Anti-HBs+ AND Anti-HBc- (vaccine immunity)
  'hepatitis-b-immune-natural' Anti-HBs+ AND Anti-HBc+  (past infection)
  'hepatitis-b-window'        HBsAg- AND Anti-HBs- AND Anti-HBc IgM+
  'hepatitis-c-exposure'      HCV antibody+
  'hepatitis-c-active'        HCV antibody+ AND HCV RNA+

Thyroid:
  'hypothyroidism'            (existing)
  'subclinical-hypothyroidism'(existing)
  'hyperthyroidism'           (existing)

Hormones Female:
  'pcos-pattern'              LH high + FSH normal/low + LH/FSH ratio >2
                              + Testosterone elevated
  'premature-ovarian-insufficiency' FSH very high + Estradiol very low
                              + in patient <40
  'hyperprolactinemia'        Prolactin high (rule out stress/medication)
  'low-ovarian-reserve'       AMH very low + FSH high
  'menopause-pattern'         FSH very high + LH high + Estradiol very low

Hormones Male:
  'hypogonadism-primary'      Testosterone low + FSH high + LH high
  'hypogonadism-secondary'    Testosterone low + FSH low + LH low
  'hyperprolactinemia-male'   Prolactin high + Testosterone low

Diabetes Extended:
  'insulin-resistance'        HOMA-IR high + Fasting insulin high
                              + Glucose borderline/high
  'metabolic-syndrome'        Glucose high/borderline + Triglycerides high
                              + HDL low + (hypertension context noted)

Coagulation:
  'elevated-inr-on-warfarin'  INR > 3.0 (over-anticoagulated — bleeding risk)
  'subtherapeutic-inr'        INR < 2.0 (under-anticoagulated — clot risk)
  'dic-pattern'               PT high + aPTT high + Platelets low
                              + Fibrinogen low + D-Dimer very high
  'dvt-pe-risk'               D-Dimer elevated (non-specific, needs imaging)

Cardiac:
  'possible-ami'              Troponin critically high (acute MI possible)
  'heart-failure'             BNP or NT-proBNP very high
  'cardiac-risk-elevated'     LDL high + Homocysteine high + hs-CRP high

Infectious:
  'typhoid-likely'            Widal S.typhi O titre ≥ 1:160
                              OR Widal S.typhi H titre ≥ 1:160
                              OR Typhidot IgM positive
  'dengue-acute'              Dengue NS1 positive OR Dengue IgM positive
  'dengue-past'               Dengue NS1 negative AND Dengue IgG positive
  'malaria'                   Malaria RDT positive (falciparum or vivax)
  'h-pylori'                  H. pylori stool antigen positive
                              OR H. pylori antibody positive
  'uti-likely'                Urine nitrites positive + Leukocyte esterase 2+/3+
                              OR WBCs/HPF > 10

Autoimmune:
  'lupus-pattern'             ANA positive (≥1:80) + Anti-dsDNA positive
                              + Complement C3/C4 low
  'rheumatoid-arthritis'      RF positive + Anti-CCP positive
  'sjogrens-pattern'          ANA positive + Anti-SSA positive
                              OR Anti-SSB positive

Urinalysis:
  'nephrotic-syndrome'        Urine protein 3+ + Urine albumin very high
                              + Serum albumin very low
  'nephritic-syndrome'        Urine blood 2+/3+ + Urine protein 1+/2+
                              + Urine RBC casts + Serum creatinine high
  'uti-dipstick'              Urine nitrites positive
                              + Urine leukocyte esterase positive
  'diabetic-nephropathy-early' Urine ACR 30–300 mg/g (microalbuminuria)
                              + Diabetes pattern

Stool:
  'gi-infection'              Stool WBCs present + Stool RBCs present
                              + Stool mucus present
  'giardiasis'                Giardia antigen positive
  'parasitic-infection'       Ova & parasites positive
  'ibd-possible'              Fecal calprotectin very high
                              + Chronic GI symptoms context

Nutritional:
  'megaloblastic-anemia'      Hemoglobin low + MCV high + B12 low
                              OR Folate low
  'combined-deficiency'       B12 low + Folate low + Iron low
  'metabolic-bone-risk'       Vitamin D very low + PTH high
                              + Calcium low/normal


──────────────────────────────────────────────────────────
FILE 6: data/questions.ts  (extend existing)
──────────────────────────────────────────────────────────
Add 5 specific, actionable doctor questions for every new pattern.
Questions must be:
- Specific to the pattern (not generic)
- Worded so a non-medical patient can read them naturally
- Relevant to Pakistani clinical practice
- Accounting for local context (cost of tests, availability, etc.)

Examples of what GOOD questions look like:
  'hepatitis-b-active':
  - "I tested HBsAg positive and HBeAg positive — does this mean the virus
     is actively multiplying and should I start antiviral treatment?"
  - "Should my family members be tested for Hepatitis B and vaccinated?"
  - "Do I need a liver ultrasound and liver biopsy to assess damage?"
  - "What lifestyle changes do I need to make — alcohol, diet, medications?"
  - "How often should I have my liver enzymes and viral load monitored?"


──────────────────────────────────────────────────────────
FILE 7: data/derived-markers.ts  (NEW FILE)
──────────────────────────────────────────────────────────
Define all calculated/derived markers and their computation logic.

export interface DerivedMarkerDef {
  id: string
  displayName: string
  fullName: string
  unit: string
  category: MarkerCategory
  requiredMarkers: string[]   // marker IDs that must be present to calculate
  calculate: (values: Record<string, number>) => number | null
  formula: string             // human-readable formula
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
      if (!v.glucose_fasting || !v.fasting_insulin) return null
      return (v.glucose_fasting * v.fasting_insulin) / 405
    },
    formula: '(Fasting Glucose × Fasting Insulin) / 405',
  },
  // LDL-Friedewald, BUN/Cr ratio, AST/ALT ratio, Anion Gap,
  // Non-HDL Cholesterol, Cardiac Risk Ratio, Free T4 Index,
  // eGFR approximation, PSA density (if volume available)
]


──────────────────────────────────────────────────────────
FILE 8: lib/qualitative-parser.ts  (NEW FILE)
──────────────────────────────────────────────────────────
Parse qualitative results from raw text.

export function parseQualitativeText(raw: string): ParsedQualitativeValue[]

PARSING RULES:
1. Match pattern: [marker name] [separator] [result text]
   Separators: colon, dash, equals, space
   Example: "HBsAg: Reactive" or "HIV 1/2 Ab - Non Reactive"
   Example: "Dengue NS1 Antigen = Positive"
   Example: "Widal S.typhi O 1:160"

2. For each match:
   a. Normalize marker name → look up in QUALITATIVE_MARKER_ALIAS_MAP
   b. Normalize result text → classify as positive/negative/borderline/trace
   c. For titre format (1:80, 1:160 etc.) → extract numeric titre value
      and compare to marker's titreThreshold

3. Handle dipstick notation:
   "Protein: 2+" → positive with severity 2
   "Ketones: trace" → trace
   "Nitrites: negative" → negative
   "Glucose: 3+" → positive with severity 3

4. Handle stool microscopy:
   "Pus cells: 8-10/HPF" → treat as high if above threshold
   "RBCs: 0-2/HPF" → treat as normal
   "Ova: Giardia cysts seen" → positive for giardia

5. Return ParsedQualitativeValue[] — one entry per recognized qualitative result


──────────────────────────────────────────────────────────
FILE 9: lib/calculator.ts  (NEW FILE)
──────────────────────────────────────────────────────────
Compute derived markers from parsed numeric values.

export function computeDerivedMarkers(
  parsedValues: ParsedValue[]
): ParsedValue[]

Logic:
1. Build a lookup: markerId → value from parsedValues
2. For each DerivedMarkerDef in DERIVED_MARKER_DEFS:
   a. Check all requiredMarkers are present in the lookup
   b. Call calculate(valuesMap) → result
   c. If result is not null, push a new ParsedValue with
      resultType: 'derived' and markerId = def.id
3. Return array of derived ParsedValues only (not the originals)
   Originals are merged in analyzer.ts


──────────────────────────────────────────────────────────
FILE 10: lib/age-resolver.ts  (NEW FILE)
──────────────────────────────────────────────────────────
Resolve the correct reference range for a marker given patient age + gender.

export function resolveRange(
  marker: LabMarker,
  context: PatientContext
): RangeSet | null

Logic:
1. If marker.ageRanges exists AND context.age is provided:
   a. Find the AgeAdjustedRange where ageMin ≤ age ≤ ageMax
   b. Within that range, prefer gender-specific if available, else universal
   c. If found, return it
2. Fall back to marker.ranges (adult ranges):
   a. If gender = male and male range exists → use male
   b. If gender = female and female range exists → use female
   c. Else use universal
3. If nothing found → return null (marker will be skipped)


──────────────────────────────────────────────────────────
FILE 11: lib/analyzer.ts  (UPDATE — extend existing)
──────────────────────────────────────────────────────────
Update the existing analyzeOffline() function to handle all result types.

export function analyzeOffline(
  parsedValues: ParsedValue[],
  parsedQualValues: ParsedQualitativeValue[],
  context: PatientContext
): ReportAnalysis

Changes from existing:
1. Accept parsedQualValues as second parameter
2. Accept PatientContext instead of Gender
3. Use resolveRange(marker, context) from age-resolver.ts
   instead of getRange(markerId, gender)
4. Call computeDerivedMarkers(parsedValues) → add derived results
5. Analyze qualitative results using QUALITATIVE_INTERPRETATIONS
6. Pass BOTH results and qualitativeResults to detectPatterns()
7. Build summary including positive/negative/borderline counts
8. Return complete ReportAnalysis with all fields populated

analyzeQualitative(
  parsed: ParsedQualitativeValue[]
): AnalyzedQualitativeResult[]
  — new private function, maps each ParsedQualitativeValue to
    AnalyzedQualitativeResult using QUALITATIVE_INTERPRETATIONS


──────────────────────────────────────────────────────────
FILE 12: lib/fallback.ts  (UPDATE — extend existing)
──────────────────────────────────────────────────────────
Update analyzeReport() to run all parsers.

export async function analyzeReport(
  rawText: string,
  context: PatientContext
): Promise<ReportAnalysis>

Changes:
1. Run parseLabText(rawText) → ParsedValue[]
2. Run parseQualitativeText(rawText) → ParsedQualitativeValue[]
3. Run analyzeOffline(numeric, qualitative, context) → ReportAnalysis
4. Try AI enrichment (same as before, fails silently)
5. Return result


──────────────────────────────────────────────────────────
FILE 13: app/api/analyze/route.ts  (UPDATE — minor)
──────────────────────────────────────────────────────────
Accept age in request body alongside gender.

const { rawText, gender, age } = await req.json()
const context: PatientContext = {
  gender: gender ?? 'unknown',
  age:    typeof age === 'number' ? age : undefined
}
const analysis = await analyzeReport(rawText, context)


──────────────────────────────────────────────────────────
FILE 14: app/page.tsx  (UPDATE — add age input)
──────────────────────────────────────────────────────────
Add an optional age input field alongside the gender selector.
Style it consistently using the existing upload.module.scss pattern.
Send age as a number in the POST body to /api/analyze.
Age input: numeric, optional, min=0, max=120.
Label: "Your age (optional — improves accuracy for children and elderly)"


──────────────────────────────────────────────────────────
FILE 15: app/results/page.tsx  (UPDATE)
──────────────────────────────────────────────────────────
Update results display to render qualitative results.

New section: "Test Results" — after patterns, before numeric results
  For each AnalyzedQualitativeResult:
  - Show marker name, raw value as reported, plain-language explanation
  - Color coding:
      negative     → green (good)
      positive     → amber or red depending on clinicalSignificance
      borderline   → amber
      trace        → amber
      info         → neutral grey
  - For titre results: show the titre value and whether it's significant

Update summary strip to include positive/borderline counts.

Keep all existing numeric result rendering unchanged.


════════════════════════════════════════════════════════════
FALLBACK INTEGRITY RULES — ABSOLUTE, NEVER VIOLATE
════════════════════════════════════════════════════════════

1. Every new marker added to data/ must have a complete interpretation
   in INTERPRETATIONS or QUALITATIVE_INTERPRETATIONS.
   A marker with no interpretation must not be added.

2. The offline engine must produce a COMPLETE, USEFUL ReportAnalysis
   for any combination of numeric and qualitative results
   without any API call.

3. lib/llm.ts must never be called from data/ files.

4. All try/catch around callLLM() must return the offline result
   on ANY error — network, timeout, parse error, empty response.

5. The source field must accurately reflect what was used:
   'offline'  = Layer 1 only (AI unavailable or no improvement)
   'hybrid'   = Layer 1 + AI successfully merged

6. Adding a new marker to data/markers.ts or data/qualitative-markers.ts
   automatically makes it available to the parser and analyzer
   with zero changes to lib/ or app/ files.
   This plug-in architecture must be preserved.


════════════════════════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════════════════════════

Produce each file as a clearly labeled code block:

--- FILE 1: data/markers.ts ---
[complete file content]

--- FILE 2: data/qualitative-markers.ts ---
[complete file content]

... and so on for all 15 files.

Each file must be complete and drop-in ready.
Do not truncate any file. Do not use placeholder comments like
"// ... add more markers here". Every marker, every interpretation,
every pattern, every question must be fully written out.

No explanations between files. No setup instructions.
No architecture descriptions. Only the code.


════════════════════════════════════════════════════════════
QUALITY BAR
════════════════════════════════════════════════════════════

When done, the system must be able to correctly analyze any of
these real-world Pakistani lab report scenarios using only the
offline engine (no AI):

SCENARIO 1 — Blood test with iron deficiency:
  "Hb 9.8, MCV 68, MCH 21, WBC 7.2, Platelets 340,
   Serum Iron 42, Ferritin 6, TIBC 420"
  Expected: Iron Deficiency Anemia (likely), appropriate questions

SCENARIO 2 — Hepatitis B status check:
  "HBsAg: Reactive, HBeAg: Non-Reactive, Anti-HBe: Reactive,
   Anti-HBs: Non-Reactive, ALT: 38, AST: 32"
  Expected: Hepatitis B carrier state detected, liver function normal

SCENARIO 3 — Thyroid with female hormones:
  "TSH 7.2, T4 5.1, T3 88, Prolactin 42, FSH 18, LH 22,
   Estradiol 28"
  Expected: Hypothyroidism (likely), Hyperprolactinemia,
            possible Premature Ovarian Insufficiency flagged

SCENARIO 4 — Diabetic with kidney risk:
  "FBS 162, HbA1c 8.4, Creatinine 1.6, BUN 28, eGFR 48,
   Urine ACR 85, Urine Protein: 1+, Urine RBCs: 3-4/HPF"
  Expected: Diabetes (uncontrolled), CKD stage 3, early diabetic
            nephropathy, microalbuminuria pattern

SCENARIO 5 — Dengue fever workup:
  "Dengue NS1 Antigen: Positive, Dengue IgM: Positive,
   Dengue IgG: Negative, WBC 3.2, Platelets 88,
   ALT 92, AST 110"
  Expected: Acute dengue infection, thrombocytopenia risk,
            liver inflammation, urgent monitoring questions

SCENARIO 6 — Female with PCOS pattern:
  "LH 18, FSH 6.2, LH/FSH ratio 2.9, Testosterone 78,
   Prolactin 24, AMH 8.4, Insulin fasting 22, FBS 98,
   Triglycerides 210, HDL 38"
  Expected: PCOS pattern (likely), Insulin resistance,
            Dyslipidemia, appropriate endocrinology questions

SCENARIO 7 — Coagulation in warfarin patient:
  "PT 28 sec, INR 3.8, aPTT 42 sec, D-Dimer 0.8"
  Expected: Over-anticoagulated on warfarin (bleeding risk),
            D-Dimer mildly elevated, specific warfarin questions

SCENARIO 8 — Pediatric (child, age 6) CBC:
  "Hb 10.2, WBC 12.4, Platelets 380, MCV 72"
  Expected: Values interpreted against pediatric ranges,
            mild anemia flagged using child-specific thresholds

All 8 scenarios must produce correct results from the
offline engine alone with no AI call.
```

---

## How to use it

Paste the entire prompt into any capable LLM — GPT-4o, Claude, Gemini, or Kimi K2 itself. It will generate all 15 files in one shot.

**One important tip:** some LLMs will truncate long outputs. If that happens, follow up with:

```
Continue from FILE [X] exactly where you stopped.
Do not repeat any previously generated content.
```

The 8 test scenarios at the bottom are your quality check — run each one through the offline engine after integrating the code. If all 8 pass correctly, the system is production-ready.