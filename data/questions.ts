export const PATTERN_QUESTIONS: Record<string, string[]> = {

  'iron-deficiency-anemia': [
    'Can you confirm iron deficiency with a ferritin and serum iron test?',
    'What iron supplement should I take, and at what dose and for how long?',
    'Are there foods I should eat more of — or avoid — to improve my iron levels?',
    'Should I come back sooner than scheduled to recheck my hemoglobin?',
    'Could there be a cause for my iron loss I should investigate, such as heavy periods or a digestive issue?',
  ],

  'iron-deficiency-anemia-possible': [
    'Could my low hemoglobin and small red cells be caused by iron deficiency?',
    'Should I get a ferritin test to check my iron stores?',
    'Is there any chance this could be thalassemia trait instead of iron deficiency?',
    'What is the best next step to identify the cause of my anemia?',
    'Are there symptoms I should watch out for that would require an earlier visit?',
  ],

  'b12-folate-deficiency-anemia': [
    'Should I test my B12 and folate levels to confirm the cause of my anemia?',
    'Could my diet be contributing to B12 or folate deficiency?',
    'Do I need B12 injections or would oral supplements work?',
    'How long will it take for my blood counts to normalize with treatment?',
    'Are there any signs of nerve damage from B12 deficiency I should be aware of?',
  ],

  'hypothyroidism': [
    'Do I need to start thyroid hormone replacement (levothyroxine)?',
    'How often should I have my TSH rechecked once on treatment?',
    'Could my fatigue and other symptoms be related to my thyroid?',
    'Is this condition likely to be lifelong, or can it resolve?',
    'Are there medications or foods that interact with thyroid treatment?',
  ],

  'subclinical-hypothyroidism': [
    'Should I get a T4 and T3 test to assess my thyroid more fully?',
    'At what TSH level would you recommend starting treatment?',
    'Could subclinical hypothyroidism explain my symptoms?',
    'How often should I monitor my thyroid if we decide to watch and wait?',
    'Is there anything I can do in the meantime to support my thyroid health?',
  ],

  'hyperthyroidism': [
    'What tests should I do to confirm hyperthyroidism and identify the cause?',
    'What are my treatment options — medication, radioactive iodine, or surgery?',
    'Are my symptoms (heart palpitations, weight loss, anxiety) related to my thyroid?',
    'How quickly will I feel better with treatment?',
    'Are there any lifestyle changes I should make while being treated?',
  ],

  'diabetes': [
    'Based on my results, do I have prediabetes or diabetes?',
    'What specific dietary and lifestyle changes should I make?',
    'Do I need medication at this stage, or can I manage this with lifestyle alone?',
    'How often should I retest my blood sugar and HbA1c?',
    'Are there other tests I should have to check for complications?',
  ],

  'dyslipidemia': [
    'Based on my cholesterol profile, what is my cardiovascular risk level?',
    'What dietary changes would have the biggest impact on my lipids?',
    'Should I consider statin medication, or is lifestyle management enough?',
    'How long should I try lifestyle changes before rechecking my lipids?',
    'Is there a family history aspect to my cholesterol I should discuss?',
  ],

  'liver-disease': [
    'What is the most likely cause of my elevated liver enzymes?',
    'Should I have a liver ultrasound to check for fatty liver?',
    'Do I need to avoid any medications or supplements that could stress my liver?',
    'Are there dietary changes that can help reduce my liver enzyme levels?',
    'Should I be tested for hepatitis B or C given my elevated liver enzymes?',
  ],

  'liver-elevated-alt-only': [
    'What could be causing my elevated ALT?',
    'Should I get additional liver tests like AST, bilirubin, and albumin?',
    'Could any of my current medications be raising my liver enzymes?',
    'Is this level of elevation something to be concerned about now?',
    'Would a liver ultrasound be useful at this stage?',
  ],

  'kidney-disease': [
    'What stage of kidney function do I have, based on my results?',
    'What is the most likely cause of my elevated creatinine and BUN?',
    'Should I reduce protein intake to protect my kidneys?',
    'Are any of my medications potentially harmful to my kidneys?',
    'How often should I monitor my kidney function tests?',
  ],

  'kidney-disease-possible': [
    'Could dehydration explain my elevated creatinine, or is this a kidney issue?',
    'Should I get a full kidney function panel including BUN and eGFR?',
    'Do I need a urine test (urinalysis) alongside my blood tests?',
    'What symptoms should prompt me to come back sooner?',
    'Are there any medications I take that might be affecting my kidneys?',
  ],

  'vitamin-d-deficiency': [
    'How much Vitamin D supplement do you recommend, and for how long?',
    'Should I also take calcium alongside Vitamin D?',
    'How long before my Vitamin D levels normalize with supplementation?',
    'How much sun exposure would be helpful for my Vitamin D?',
    'Are there any symptoms I have that could be related to low Vitamin D?',
  ],

  'b12-deficiency': [
    'Is my B12 level low enough to require injections, or will oral supplements work?',
    'Could my diet be the cause of my low B12, and what foods should I eat more of?',
    'Do I have any symptoms that might be related to low B12, such as tingling or fatigue?',
    'How often should I retest my B12 after starting supplements?',
    'Is there an absorption issue that might explain my low B12?',
  ],

  'thalassemia-trait': [
    'Could my small red blood cells be due to thalassemia trait rather than iron deficiency?',
    'Should I have a hemoglobin electrophoresis test to check for thalassemia?',
    'Should I avoid taking iron supplements if thalassemia trait is suspected?',
    'Are there genetic implications for my children if I do have thalassemia trait?',
    'Do I need to do anything differently if I have thalassemia trait?',
  ],

  'gout-risk': [
    'Is my uric acid level high enough to cause gout, or just a risk factor?',
    'What dietary changes can help reduce my uric acid — what should I avoid?',
    'Do I need medication to lower my uric acid at this level?',
    'Should I drink more water to help flush out uric acid?',
    'What are the warning signs of a gout attack I should watch for?',
  ],

  'inflammation': [
    'What could be causing my elevated inflammation markers?',
    'Do I need additional tests to identify the source of inflammation?',
    'Could this inflammation be linked to a chronic condition or infection?',
    'How long should I wait before rechecking my CRP and ESR?',
    'Are there lifestyle changes that can help reduce chronic inflammation?',
  ],

  'dehydration': [
    'Could dehydration be the explanation for my abnormal kidney markers?',
    'How much fluid should I be drinking daily?',
    'Would it be worth repeating the blood test after improving my hydration?',
    'Are there other signs of dehydration or kidney stress I should monitor?',
    'Is there any risk I need to be concerned about even if this is just dehydration?',
  ],
}

export const DEFAULT_QUESTIONS = [
  'What is the most important thing my results tell you about my health?',
  'Are there any values that concern you and require follow-up tests?',
  'Should I repeat any of these tests, and if so, when?',
  'Are there lifestyle or dietary changes I should make based on these results?',
  'Are there any symptoms I should watch for that would mean I need to come in sooner?',
]

export function buildDoctorQuestions(patternIds: string[]): string[] {
  if (patternIds.length === 0) return DEFAULT_QUESTIONS

  const seen = new Set<string>()
  const questions: string[] = []

  for (const id of patternIds) {
    const qs = PATTERN_QUESTIONS[id] || []
    for (const q of qs) {
      if (!seen.has(q) && questions.length < 7) {
        seen.add(q)
        questions.push(q)
      }
    }
  }

  // Always pad with defaults if fewer than 5
  for (const q of DEFAULT_QUESTIONS) {
    if (!seen.has(q) && questions.length < 5) {
      seen.add(q)
      questions.push(q)
    }
  }

  return questions.slice(0, 6)
}
