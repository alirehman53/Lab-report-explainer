import { MarkerStatus } from '@/types/lab'

type InterpretationMap = Partial<Record<MarkerStatus, string>>

export const INTERPRETATIONS: Record<string, InterpretationMap> = {

  hemoglobin: {
    'critical-low':  "Your hemoglobin is critically low. At this level, your body is severely starved of oxygen, which can cause extreme fatigue, dizziness, and shortness of breath at rest. This often requires urgent medical attention.",
    low:             "Your hemoglobin is below normal, meaning your red blood cells may not be carrying enough oxygen around your body. You might feel more tired than usual, look pale, or feel short of breath easily. This is very often due to iron deficiency — one of the most treatable conditions.",
    normal:          "Your hemoglobin is in a healthy range. Your blood is transporting oxygen effectively throughout your body.",
    high:            "Your hemoglobin is slightly elevated. This can sometimes indicate dehydration, living at high altitude, or, in rare cases, a bone marrow issue. Worth mentioning to your doctor.",
    'critical-high': "Your hemoglobin is critically high. This can thicken the blood and increase the risk of clots. Please discuss this with your doctor promptly.",
  },

  hematocrit: {
    'critical-low':  "Your hematocrit is critically low, meaning a very small proportion of your blood is made up of red blood cells. This is a serious form of anemia that needs prompt medical attention.",
    low:             "Your hematocrit is low, indicating fewer red blood cells than normal. This often accompanies low hemoglobin and may suggest anemia.",
    normal:          "Your hematocrit is normal — the proportion of red blood cells in your blood is healthy.",
    high:            "Your hematocrit is elevated, which can indicate dehydration or other conditions causing blood thickening.",
    'critical-high': "Your hematocrit is critically high, increasing risk of blood clots. Please seek medical advice.",
  },

  rbc: {
    low:    "Your red blood cell count is low, which typically accompanies low hemoglobin. Your blood may not be efficiently delivering oxygen to your tissues.",
    normal: "Your red blood cell count is normal — your body is producing an appropriate number of oxygen-carrying cells.",
    high:   "Your red blood cell count is elevated. This can result from dehydration, smoking, or certain bone marrow conditions.",
  },

  mcv: {
    'critical-low': "Your red blood cells are extremely small. This strongly suggests severe iron deficiency or a genetic condition like thalassemia.",
    low:            "Your red blood cells are smaller than normal (microcytic). Combined with low hemoglobin, this is a classic sign of iron deficiency. It can also suggest thalassemia trait — common in South Asian populations.",
    normal:         "Your red blood cell size is normal.",
    high:           "Your red blood cells are larger than normal (macrocytic). This can be caused by B12 or folate deficiency, liver disease, or hypothyroidism. Worth investigating if accompanied by low hemoglobin.",
  },

  mch: {
    low:    "Each red blood cell contains less hemoglobin than normal (hypochromic). This strongly points toward iron deficiency, especially when MCV is also low.",
    normal: "The amount of hemoglobin in each red blood cell is normal.",
    high:   "Each red blood cell contains more hemoglobin than normal, often accompanying macrocytic anemia caused by B12/folate deficiency.",
  },

  mchc: {
    low:    "Your red blood cell hemoglobin concentration is low, suggesting the cells are pale (hypochromic). Often seen in iron deficiency.",
    normal: "The hemoglobin concentration in your red blood cells is normal.",
    high:   "Hemoglobin concentration is high in your red blood cells. This can be seen in hereditary spherocytosis — a relatively rare but manageable condition.",
  },

  wbc: {
    'critical-low':  "Your white blood cell count is critically low (severe leukopenia). Your immune system may be very compromised. Please seek medical attention.",
    low:             "Your white blood cell count is below normal. This may indicate a viral infection, certain medications, or a bone marrow issue. It can mean your immune system is less equipped to fight off infections right now.",
    normal:          "Your immune cell count is normal. Your body has a healthy level of infection-fighting white blood cells.",
    high:            "Your white blood cell count is elevated. This often signals an active infection or inflammation. Less commonly, it can relate to stress, steroids, or other medical conditions.",
    'critical-high': "Your white blood cell count is critically high. This can indicate a severe infection or, in rare cases, a blood disorder. Please see a doctor promptly.",
  },

  neutrophils: {
    low:    "Your neutrophils (the main infection fighters) are low. This increases your vulnerability to bacterial infections. Common causes include viral infections, certain medications, or bone marrow issues.",
    normal: "Your neutrophil level is normal — you have adequate bacterial defense.",
    high:   "Elevated neutrophils typically indicate a bacterial infection, physical stress, inflammation, or steroid use.",
  },

  lymphocytes: {
    low:    "Your lymphocyte count is low. These cells fight viruses and are part of your long-term immune memory. Low levels can occur with viral infections (HIV, influenza), steroid use, or immune deficiency.",
    normal: "Your lymphocyte level is normal.",
    high:   "Elevated lymphocytes often occur during viral infections like Epstein-Barr (mono), CMV, or, less commonly, certain blood disorders.",
  },

  monocytes: {
    low:    "Your monocyte count is slightly low. This is rarely clinically significant on its own.",
    normal: "Your monocyte level is normal.",
    high:   "Elevated monocytes can indicate chronic infection, inflammation, or autoimmune conditions.",
  },

  eosinophils: {
    low:    "Low eosinophils are rarely concerning on their own.",
    normal: "Your eosinophil level is normal.",
    high:   "Elevated eosinophils are often a sign of an allergic reaction, asthma, or parasite infection. Common in Pakistan and South Asia due to parasitic exposures.",
  },

  platelets: {
    'critical-low':  "Your platelet count is critically low. You are at risk of serious spontaneous bleeding. Please seek immediate medical attention.",
    low:             "Your platelet count is below normal (thrombocytopenia). You may bruise or bleed more easily than usual. Causes range from viral infections to medications to immune conditions.",
    normal:          "Your platelet count is normal. Your blood's clotting ability appears healthy.",
    high:            "Your platelet count is elevated (thrombocytosis). This can occur after infection, inflammation, iron deficiency, or surgery. High counts can occasionally increase clot risk.",
    'critical-high': "Your platelet count is very high. Please discuss this with your doctor as it may increase the risk of abnormal clotting.",
  },

  rdw: {
    low:    "Your RDW is below normal — red blood cells are very uniform in size. This is rarely a concern.",
    normal: "Your red blood cells are consistent in size — normal variation.",
    high:   "Your red blood cells vary significantly in size (high RDW). This can be an early sign of nutritional deficiencies (iron, B12, folate) or mixed anemia. It helps doctors pinpoint the cause of anemia.",
  },

  serum_iron: {
    low:    "Your circulating iron is low. This is often one of the first signs of iron deficiency and usually accompanies low ferritin.",
    normal: "Your serum iron is in a normal range.",
    high:   "Elevated serum iron can indicate iron overload, liver disease, or certain anemias (like hemolytic or sideroblastic anemia).",
  },

  ferritin: {
    'critical-low': "Your ferritin is critically low — your iron stores are nearly depleted. This is a definitive sign of iron deficiency.",
    low:            "Your ferritin is low, meaning your body's iron stores are depleted. Even if other values look borderline, low ferritin confirms iron deficiency. This is the most sensitive marker for iron deficiency.",
    normal:         "Your ferritin is normal — your iron stores are adequate.",
    high:           "Elevated ferritin can indicate inflammation, infection, liver disease, or iron overload (hemochromatosis). Ferritin is also an acute-phase reactant — it rises when the body is under stress.",
  },

  tibc: {
    low:    "Your TIBC is low, meaning your blood's capacity to transport iron is reduced. This can occur in chronic inflammation or iron overload.",
    normal: "Your iron-binding capacity is normal.",
    high:   "Elevated TIBC indicates your blood has extra capacity to bind iron — a classic sign of iron deficiency, as the body tries to absorb more iron.",
  },

  alt: {
    low:    "Low ALT is rarely clinically significant.",
    normal: "Your ALT (liver enzyme) is normal — no signs of liver cell damage.",
    high:   "Elevated ALT indicates liver cell stress or damage. Common causes include fatty liver disease, hepatitis, alcohol, or certain medications. The degree of elevation matters — mildly elevated vs. 10x normal are very different situations.",
    'critical-high': "Your ALT is critically elevated, suggesting significant liver injury. Please seek medical evaluation promptly.",
  },

  ast: {
    low:    "Low AST is rarely significant.",
    normal: "Your AST is normal.",
    high:   "Elevated AST can indicate liver or heart damage. When both AST and ALT are high, it suggests liver disease. When AST is high alone, heart or muscle issues may be involved.",
    'critical-high': "Your AST is critically high, indicating significant organ injury. Please see a doctor.",
  },

  alp: {
    low:    "Low ALP is rarely a concern — occasionally related to hypothyroidism or nutritional deficiencies.",
    normal: "Your ALP is normal.",
    high:   "Elevated ALP can come from the liver (bile duct obstruction, fatty liver) or bones (fractures, Paget's disease). Your doctor can investigate the source based on your symptoms.",
  },

  bilirubin_total: {
    low:    "Low total bilirubin is not typically concerning.",
    normal: "Your bilirubin is normal — your liver is processing waste efficiently.",
    high:   "Elevated bilirubin can cause jaundice (yellowing of skin/eyes). Causes include liver disease, bile duct obstruction, or excessive red blood cell breakdown.",
    'critical-high': "Critically high bilirubin often causes visible jaundice and requires medical attention.",
  },

  bilirubin_direct: {
    normal: "Your direct bilirubin is normal.",
    high:   "Elevated direct bilirubin suggests the liver is producing bilirubin but cannot excrete it properly — often a sign of bile duct blockage or liver disease.",
  },

  albumin: {
    'critical-low': "Critically low albumin indicates severe malnutrition or significant liver/kidney disease. Requires prompt evaluation.",
    low:            "Low albumin can indicate malnutrition, liver disease (cirrhosis), kidney disease (protein loss), or chronic inflammation. It's an important marker of overall health.",
    normal:         "Your albumin is normal — a good sign of nutritional status and liver function.",
    high:           "Elevated albumin is most commonly caused by dehydration.",
  },

  total_protein: {
    low:    "Low total protein can indicate malnutrition, liver disease, or kidney disease (protein loss in urine).",
    normal: "Your total protein is normal.",
    high:   "Elevated total protein can occur with dehydration or certain conditions like multiple myeloma. Usually requires further evaluation.",
  },

  tsh: {
    'critical-low':  "Your TSH is critically low, strongly suggesting severe hyperthyroidism. Your thyroid may be overactive. Please see a doctor.",
    low:             "Your TSH is below normal, suggesting your thyroid may be overactive (hyperthyroidism). Symptoms can include weight loss, rapid heartbeat, anxiety, and heat intolerance.",
    normal:          "Your TSH is in the normal range — your thyroid appears to be functioning normally.",
    high:            "Your TSH is elevated, suggesting your thyroid may be underactive (hypothyroidism). This is one of the most common hormonal conditions. Symptoms include fatigue, weight gain, feeling cold, and dry skin.",
    'critical-high': "Your TSH is very high, indicating significant hypothyroidism. This requires medical treatment.",
  },

  t3: {
    low:    "Low T3 can indicate hypothyroidism or a low-T3 syndrome seen in chronic illness. Often evaluated together with TSH and T4.",
    normal: "Your T3 (active thyroid hormone) is in the normal range.",
    high:   "Elevated T3 suggests hyperthyroidism — your thyroid is producing too much active hormone.",
  },

  t4: {
    low:    "Low T4, especially with high TSH, confirms hypothyroidism. Your thyroid isn't producing enough hormone.",
    normal: "Your T4 is normal.",
    high:   "Elevated T4 with low TSH suggests hyperthyroidism.",
  },

  creatinine: {
    low:    "Low creatinine is usually not concerning — often related to low muscle mass.",
    normal: "Your creatinine is normal — your kidneys appear to be filtering waste effectively.",
    high:   "Elevated creatinine indicates your kidneys may not be filtering waste as efficiently as they should. Can be caused by dehydration, certain medications, or kidney disease.",
    'critical-high': "Critically high creatinine suggests significant kidney impairment. Please seek medical attention.",
  },

  bun: {
    low:    "Low BUN is rarely clinically significant — sometimes seen with liver disease or low-protein diet.",
    normal: "Your BUN is normal — kidney waste filtration is working well.",
    high:   "Elevated BUN can indicate dehydration, high protein intake, kidney disease, or internal bleeding. Usually interpreted alongside creatinine.",
    'critical-high': "Critically high BUN indicates severe kidney dysfunction. Urgent evaluation is needed.",
  },

  urea: {
    low:    "Low urea levels are rarely significant.",
    normal: "Your blood urea level is normal.",
    high:   "Elevated urea is similar to high BUN — suggests the kidneys may not be clearing waste efficiently. Dehydration is also a common cause.",
  },

  egfr: {
    'critical-low': "Your eGFR indicates severe kidney dysfunction. Kidney function is severely reduced. Please see a doctor urgently.",
    low:            "Your eGFR is below 60, indicating reduced kidney function. This may be early chronic kidney disease (CKD). Your doctor may want to monitor this closely and investigate the cause.",
    normal:         "Your eGFR is normal — your kidneys are filtering blood at a healthy rate.",
    high:           "High eGFR is generally not a concern.",
  },

  uric_acid: {
    low:    "Low uric acid is rarely significant.",
    normal: "Your uric acid is normal.",
    high:   "Elevated uric acid can cause gout — painful joint inflammation — especially in the big toe, ankles, and knees. It can also contribute to kidney stones. Dietary factors (red meat, shellfish, beer) play a role.",
    'critical-high': "Critically high uric acid significantly increases risk of gout attacks and kidney complications.",
  },

  cholesterol_total: {
    normal: "Your total cholesterol is in a desirable range — good for heart health.",
    high:   "Your total cholesterol is elevated, which over time can increase the risk of heart disease and stroke. Diet, exercise, and sometimes medication can bring this down.",
    'critical-high': "Your total cholesterol is very high. This significantly increases cardiovascular risk. Please discuss treatment options with your doctor.",
  },

  hdl: {
    low:    "Your HDL ('good' cholesterol) is low. Higher HDL actually protects against heart disease, so low levels are a risk factor. Exercise and a healthy diet can raise HDL.",
    normal: "Your HDL is in a healthy range — this 'good' cholesterol helps protect your arteries.",
    high:   "High HDL is generally beneficial — it helps remove cholesterol from arteries.",
  },

  ldl: {
    normal: "Your LDL ('bad' cholesterol) is in a healthy range.",
    high:   "Your LDL is elevated. High LDL contributes to plaque buildup in arteries, increasing risk of heart attack and stroke. Dietary changes and medications (statins) can lower LDL effectively.",
    'critical-high': "Your LDL is very high. This is a significant cardiovascular risk factor requiring medical attention.",
  },

  triglycerides: {
    normal: "Your triglycerides are normal — a good sign for heart and metabolic health.",
    high:   "Elevated triglycerides increase cardiovascular risk and can be a sign of insulin resistance, diabetes, or poor diet (especially refined carbs and sugary drinks). Quite common in South Asian populations.",
    'critical-high': "Very high triglycerides can cause pancreatitis — a serious, painful inflammation of the pancreas. Medical treatment is recommended.",
  },

  vldl: {
    normal: "Your VLDL is normal.",
    high:   "Elevated VLDL is associated with high triglycerides and cardiovascular risk.",
  },

  glucose_fasting: {
    'critical-low':  "Your blood sugar is critically low (severe hypoglycemia). This can cause confusion, seizures, and loss of consciousness. Seek immediate help.",
    low:             "Your fasting blood sugar is low (hypoglycemia). This can cause shakiness, sweating, dizziness, and confusion. Common causes include skipping meals, diabetes medication, or insulinoma.",
    normal:          "Your fasting blood sugar is in the normal range — no sign of diabetes or prediabetes.",
    high:            "Your fasting blood sugar is elevated. Values between 100–125 mg/dL indicate prediabetes. At 126+ mg/dL, this may indicate diabetes. Lifestyle changes — diet, exercise, weight management — can often reverse prediabetes.",
    'critical-high': "Your blood sugar is critically high. This level can cause diabetic emergencies. Please seek medical attention promptly.",
  },

  glucose_random: {
    'critical-low':  "Critically low blood sugar — seek immediate help.",
    low:             "Your blood sugar is low. Eat or drink something sweet and monitor carefully.",
    normal:          "Your random blood sugar is within an acceptable range.",
    high:            "Your random blood sugar is elevated. A random value over 200 mg/dL with symptoms may indicate diabetes.",
    'critical-high': "Critically high blood sugar. Seek immediate medical attention.",
  },

  hba1c: {
    normal: "Your HbA1c is below 5.7% — your average blood sugar over the past 3 months has been in the healthy range. No sign of diabetes or prediabetes.",
    high:   "Your HbA1c is elevated. 5.7–6.4% = prediabetes. 6.5%+ = diabetes. This reflects your average blood sugar over the past 3 months — not just today's reading. Lifestyle changes can significantly reduce this.",
    'critical-high': "Your HbA1c indicates poorly controlled diabetes. Long-term high blood sugar damages nerves, kidneys, and blood vessels. Working with your doctor on a management plan is important.",
  },

  sodium: {
    'critical-low':  "Critically low sodium (severe hyponatremia) can cause brain swelling, seizures, and coma. This is a medical emergency.",
    low:             "Your sodium is low (hyponatremia). Symptoms include headache, nausea, confusion, and fatigue. Can be caused by excessive water intake, kidney issues, heart failure, or certain medications.",
    normal:          "Your sodium is normal — your fluid balance is healthy.",
    high:            "Your sodium is high (hypernatremia), usually caused by dehydration. Symptoms include thirst, confusion, and muscle weakness.",
    'critical-high': "Critically high sodium — a medical emergency. Please seek care immediately.",
  },

  potassium: {
    'critical-low':  "Critically low potassium can cause dangerous heart rhythm abnormalities. This is a medical emergency.",
    low:             "Your potassium is low (hypokalemia). This can cause muscle weakness, cramps, fatigue, and heart palpitations. Often caused by diarrhea, vomiting, or certain diuretics.",
    normal:          "Your potassium is in a healthy range — important for normal heart and muscle function.",
    high:            "Your potassium is elevated (hyperkalemia). This can affect heart rhythm. Causes include kidney disease, certain medications, or excessive potassium intake.",
    'critical-high': "Critically high potassium can cause life-threatening heart arrhythmias. Seek immediate medical care.",
  },

  calcium: {
    'critical-low':  "Critically low calcium can cause muscle spasms, seizures, and heart problems. Seek immediate medical care.",
    low:             "Your calcium is low (hypocalcemia). Can cause muscle cramps, numbness/tingling, and fatigue. Often linked to vitamin D deficiency or thyroid/parathyroid issues.",
    normal:          "Your calcium is normal — important for bones, muscles, and nerves.",
    high:            "Your calcium is elevated (hypercalcemia). Symptoms include fatigue, nausea, frequent urination, and confusion. Most commonly caused by hyperparathyroidism or vitamin D toxicity.",
    'critical-high': "Critically high calcium is a medical emergency.",
  },

  magnesium: {
    low:    "Low magnesium can cause muscle cramps, fatigue, anxiety, and irregular heartbeat. Very common, and often related to poor diet or excessive alcohol.",
    normal: "Your magnesium is normal.",
    high:   "Elevated magnesium is usually caused by kidney disease or excessive supplementation.",
  },

  chloride: {
    low:    "Low chloride can indicate metabolic alkalosis, often from vomiting, diuretics, or other electrolyte imbalances.",
    normal: "Your chloride is normal.",
    high:   "High chloride can indicate metabolic acidosis or dehydration.",
  },

  bicarbonate: {
    low:    "Low bicarbonate suggests metabolic acidosis — your blood may be more acidic than normal. Can be caused by kidney disease, diarrhea, or diabetic ketoacidosis.",
    normal: "Your bicarbonate is normal — acid-base balance is maintained.",
    high:   "High bicarbonate suggests metabolic alkalosis. Common causes include vomiting, diuretics, or excessive antacid use.",
  },

  crp: {
    normal: "Your CRP is normal — no significant inflammation detected.",
    high:   "Elevated CRP indicates inflammation somewhere in your body. It's a non-specific marker — can be caused by infection, autoimmune conditions, injury, or chronic disease. Your doctor will look for the source.",
    'critical-high': "Very high CRP indicates significant inflammation or acute infection. Requires medical evaluation.",
  },

  esr: {
    normal: "Your ESR is normal.",
    high:   "Elevated ESR is a non-specific sign of inflammation or infection. It rises slowly and falls slowly — useful for tracking chronic conditions like rheumatoid arthritis or lupus.",
  },

  vitamin_d: {
    'critical-low': "Your Vitamin D is critically deficient. This level is associated with bone pain, muscle weakness, immune dysfunction, and increased risk of fractures. Supplementation is necessary.",
    low:            "Your Vitamin D is below optimal levels — deficiency is extremely common in Pakistan and South Asia due to indoor lifestyles and darker skin pigmentation. Low Vitamin D is linked to bone weakening, fatigue, low mood, and immune issues. Easily corrected with supplements.",
    normal:         "Your Vitamin D is in a good range.",
    high:           "Very high Vitamin D can cause toxicity — nausea, weakness, and elevated calcium. This usually results from excessive supplementation, not sunlight.",
    'critical-high': "Vitamin D toxicity is rare but can cause serious calcium-related complications.",
  },

  vitamin_b12: {
    'critical-low': "Your B12 is critically low. At this level, neurological damage — tingling, numbness, memory problems — can occur. Injections may be needed.",
    low:            "Your B12 is low. Vitamin B12 deficiency causes fatigue, neurological symptoms (tingling hands/feet), and megaloblastic anemia. Common in vegetarians/vegans, the elderly, and those with absorption issues.",
    normal:         "Your B12 is in a healthy range.",
    high:           "Elevated B12 is usually harmless from supplementation, but very high levels without supplementation can sometimes indicate liver disease or certain blood disorders.",
  },

  // ── Thyroid (extended) ──
  free_t3: {
    low:    "Your Free T3 is low. T3 is the active thyroid hormone; a low level often goes alongside an underactive thyroid (hypothyroidism) and can cause tiredness, weight gain, and feeling cold.",
    normal: "Your Free T3 is in a healthy range — your thyroid is producing an appropriate amount of active hormone.",
    high:   "Your Free T3 is elevated, which can point to an overactive thyroid (hyperthyroidism) — symptoms include palpitations, weight loss, and anxiety. Worth discussing with your doctor.",
  },
  free_t4: {
    low:    "Your Free T4 is low, which suggests the thyroid may be underactive (hypothyroidism). This is usually interpreted together with your TSH.",
    normal: "Your Free T4 is in a healthy range.",
    high:   "Your Free T4 is high, which can indicate an overactive thyroid. Your doctor will look at this alongside TSH and your symptoms.",
  },
  anti_tpo: {
    normal: "Your Anti-TPO antibodies are within normal limits, making autoimmune thyroid disease less likely.",
    high:   "Your Anti-TPO antibodies are raised. This points to autoimmune thyroid disease (such as Hashimoto's). It does not by itself mean your thyroid is malfunctioning — it's a marker your doctor uses alongside TSH and T4.",
  },

  // ── Liver (extended) ──
  ggt: {
    normal: "Your GGT is normal — a reassuring sign for your liver and bile ducts.",
    high:   "Your GGT is elevated. GGT rises with alcohol use, fatty liver, bile-duct issues, and some medications. A raised GGT alongside a raised ALP usually points to the bile system.",
    'critical-high': "Your GGT is very high, which warrants prompt evaluation of your liver and bile ducts.",
  },
  ldh: {
    normal: "Your LDH is normal. LDH is a general marker released when tissues are stressed or damaged.",
    high:   "Your LDH is elevated. This is non-specific — it can rise with many conditions including infections, anemia, muscle injury, or inflammation. Your doctor will interpret it in context.",
    'critical-high': "Your LDH is markedly elevated and should be evaluated promptly in the context of your other results.",
  },
  globulin: {
    low:    "Your globulin is low, which can occur with certain immune or kidney conditions. It's usually interpreted alongside your albumin.",
    normal: "Your globulin is in a healthy range — your antibody and transport proteins are balanced.",
    high:   "Your globulin is elevated, which can occur with chronic infection, inflammation, liver disease, or immune conditions.",
  },

  // ── Pancreatic ──
  amylase: {
    normal: "Your amylase is normal — no current sign of pancreatic irritation by this marker.",
    high:   "Your amylase is elevated. This can reflect inflammation of the pancreas (pancreatitis) or salivary glands. It's usually checked together with lipase.",
    'critical-high': "Your amylase is very high, which can indicate acute pancreatitis — please seek medical evaluation promptly.",
  },
  lipase: {
    normal: "Your lipase is normal, which is reassuring for the pancreas.",
    high:   "Your lipase is elevated. Lipase is more specific to the pancreas than amylase, and a high level can indicate pancreatitis.",
    'critical-high': "Your lipase is very high — this strongly suggests acute pancreatitis and needs prompt medical attention.",
  },

  // ── Cardiac markers ──
  troponin_i: {
    normal: "Your Troponin I is normal — a reassuring result, as troponin rises when heart muscle is injured.",
    high:   "Your Troponin I is elevated. Troponin is released when heart muscle is stressed or damaged. Even mild elevations should be discussed with a doctor.",
    'critical-high': "Your Troponin I is critically high. This can indicate a heart attack or significant heart-muscle injury and needs EMERGENCY medical attention.",
  },
  ck: {
    normal: "Your CK (creatine kinase) is normal.",
    high:   "Your CK is elevated. CK rises with muscle activity or injury — strenuous exercise, injections, certain medications (like statins), or muscle conditions. Heart and skeletal muscle both contribute.",
    'critical-high': "Your CK is very high, which can indicate significant muscle breakdown and should be evaluated promptly.",
  },
  ck_mb: {
    normal: "Your CK-MB is normal — this fraction is more specific to heart muscle.",
    high:   "Your CK-MB is elevated, which can indicate heart-muscle injury. It's interpreted alongside troponin and your symptoms.",
    'critical-high': "Your CK-MB is markedly elevated — please seek prompt cardiac evaluation.",
  },
  bnp: {
    normal: "Your BNP is normal, which makes significant heart failure less likely.",
    high:   "Your BNP is elevated. BNP rises when the heart is under strain, as in heart failure. Your doctor will interpret it with your symptoms and an echocardiogram if needed.",
    'critical-high': "Your BNP is very high, suggesting significant cardiac strain — please seek medical evaluation.",
  },
  nt_probnp: {
    normal: "Your NT-proBNP is normal, making significant heart failure unlikely.",
    high:   "Your NT-proBNP is elevated, which suggests the heart is under strain. This is a key marker in diagnosing and monitoring heart failure.",
    'critical-high': "Your NT-proBNP is very high — please seek prompt cardiac evaluation.",
  },
  homocysteine: {
    normal: "Your homocysteine is normal.",
    high:   "Your homocysteine is elevated. High levels are linked to an increased risk of cardiovascular disease and clots, and can reflect low folate, B12, or B6. It's often treatable with vitamins.",
  },

  // ── Coagulation ──
  pt: {
    normal: "Your Prothrombin Time (PT) is normal — your blood is clotting in the expected time.",
    high:   "Your PT is prolonged, meaning blood is taking longer to clot. This can be due to blood thinners (like warfarin), liver issues, or vitamin K deficiency.",
    'critical-high': "Your PT is markedly prolonged, which raises bleeding risk and needs prompt review — especially if you take a blood thinner.",
  },
  inr: {
    low:    "Your INR is on the lower side. If you take warfarin, this may mean you're under-anticoagulated (higher clot risk); if you don't, it's usually not a concern.",
    normal: "Your INR is in the normal range (around 1.0). If you're not on a blood thinner, this is expected.",
    high:   "Your INR is elevated. If you take warfarin, this means your blood is thinner than baseline — your target depends on why you take it (commonly 2.0–3.0). A high INR raises bleeding risk.",
    'critical-high': "Your INR is critically high, which significantly raises bleeding risk. If you take warfarin, contact your doctor promptly.",
  },
  aptt: {
    normal: "Your aPTT is normal — this part of your clotting system is working as expected.",
    high:   "Your aPTT is prolonged, meaning this clotting pathway takes longer than usual. Causes include heparin, clotting-factor deficiencies, or certain antibodies.",
    'critical-high': "Your aPTT is markedly prolonged and should be evaluated promptly for bleeding risk.",
  },
  d_dimer: {
    normal: "Your D-Dimer is normal, which makes an active blood clot unlikely.",
    high:   "Your D-Dimer is elevated. This is non-specific — it rises with clots but also with infection, inflammation, pregnancy, recent surgery, and age. A raised D-Dimer usually prompts further imaging rather than being diagnostic on its own.",
  },
  fibrinogen: {
    low:    "Your fibrinogen is low, which can impair clotting and raise bleeding risk. It can occur with severe liver disease or consumption of clotting factors.",
    normal: "Your fibrinogen is normal.",
    high:   "Your fibrinogen is elevated. As an inflammatory protein, it often rises with infection, inflammation, or pregnancy.",
  },

  // ── Female hormones ──
  fsh: {
    low:    "Your FSH is low. In the context of fertility, low FSH can relate to signaling from the brain/pituitary. Interpretation depends heavily on your cycle phase and clinical picture.",
    normal: "Your FSH is within the typical reproductive-age range. FSH varies across the menstrual cycle, so your doctor interprets it alongside the cycle day.",
    high:   "Your FSH is elevated. In women, a high FSH can indicate reduced ovarian reserve or menopause; it's interpreted with LH, estradiol, and your age.",
  },
  lh: {
    low:    "Your LH is low, which is interpreted in the context of your cycle and other hormones.",
    normal: "Your LH is within the typical reproductive-age range. LH surges mid-cycle, so timing matters for interpretation.",
    high:   "Your LH is elevated. A high LH (especially with a raised LH:FSH ratio) can be seen in PCOS, or it can indicate menopause depending on age and other hormones.",
  },
  estradiol: {
    low:    "Your estradiol (E2) is low. Low levels are normal after menopause; in younger women they're interpreted with FSH/LH and cycle phase.",
    normal: "Your estradiol is within a typical range — though normal varies a lot by cycle phase.",
    high:   "Your estradiol is elevated, which can be normal around ovulation or with certain treatments; your doctor interprets it in context.",
  },
  progesterone: {
    low:    "Your progesterone is low. A low mid-luteal progesterone can suggest a cycle without ovulation; timing relative to your cycle is key.",
    normal: "Your progesterone is within an expected range for the cycle phase tested.",
    high:   "Your progesterone is elevated, which is normal in the luteal phase and pregnancy.",
  },
  prolactin: {
    normal: "Your prolactin is in a healthy range.",
    high:   "Your prolactin is elevated. Mild rises can come from stress, recent breast exam, or medications; persistent elevation can cause irregular periods or milk production and is sometimes due to a small, benign pituitary growth. Often it should be rechecked under calm, fasting conditions.",
  },
  amh: {
    low:    "Your AMH is low, which suggests a reduced ovarian reserve (fewer remaining eggs). This is one piece of the fertility picture and is best interpreted with your age and an ultrasound.",
    normal: "Your AMH is in a typical range, suggesting a normal ovarian reserve for many women.",
    high:   "Your AMH is high, which can be seen in PCOS. It's interpreted alongside your symptoms and ultrasound.",
  },
  beta_hcg: {
    normal: "Your Beta-hCG is in the non-pregnant range.",
    high:   "Your Beta-hCG is elevated. In the right context this most commonly indicates pregnancy; levels are tracked over time. Rarely, elevation has other causes your doctor will consider.",
  },

  // ── Male hormones ──
  testosterone_total: {
    low:    "Your total testosterone is low. In men this can cause low energy, reduced libido, and mood changes; it should be confirmed on a morning sample. In women, levels are naturally much lower.",
    normal: "Your total testosterone is within the expected range for your sex.",
    high:   "Your total testosterone is elevated. In women this can relate to PCOS or other hormone conditions; in men it's interpreted with the clinical picture.",
  },
  free_testosterone: {
    low:    "Your free testosterone (the active, unbound fraction) is low, which can contribute to low-testosterone symptoms even when total testosterone looks borderline.",
    normal: "Your free testosterone is within a typical range.",
    high:   "Your free testosterone is elevated and is interpreted alongside total testosterone and your symptoms.",
  },
  dhea_s: {
    low:    "Your DHEA-S is low, which can occur with adrenal under-activity. It's interpreted with your other hormones.",
    normal: "Your DHEA-S is in a typical range.",
    high:   "Your DHEA-S is elevated. This adrenal androgen can be raised in PCOS or, less commonly, adrenal conditions.",
  },

  // ── Adrenal ──
  cortisol_morning: {
    low:    "Your morning cortisol is low. Cortisol is your stress hormone and should be highest in the morning; a low value can suggest adrenal under-activity and may need further testing.",
    normal: "Your morning cortisol is in the expected range for a morning sample.",
    high:   "Your morning cortisol is elevated. This can result from stress, illness, or steroid medication; persistent elevation is occasionally due to an adrenal or pituitary condition.",
  },

  // ── Bone & minerals ──
  pth: {
    low:    "Your PTH is low. PTH controls calcium; a low level is interpreted together with your calcium result.",
    normal: "Your PTH is in a healthy range, suggesting balanced calcium regulation.",
    high:   "Your PTH is elevated. This often accompanies low vitamin D or kidney issues (the body's attempt to keep calcium up), or less commonly a parathyroid gland problem. It's read together with calcium and vitamin D.",
  },
  phosphorus: {
    low:    "Your phosphorus is low, which can result from poor intake, vitamin D deficiency, or certain hormonal conditions.",
    normal: "Your phosphorus is in a healthy range — important for bones and energy.",
    high:   "Your phosphorus is elevated. This is most commonly related to reduced kidney function and is interpreted with your calcium and kidney results.",
    'critical-high': "Your phosphorus is very high, which is most often linked to significant kidney impairment and should be reviewed promptly.",
  },

  // ── Vitamins ──
  folate: {
    'critical-low': "Your folate is critically low, which can cause megaloblastic anemia. Supplementation is usually needed, and B12 should be checked too.",
    low:            "Your folate (vitamin B9) is low. Deficiency causes fatigue and a type of anemia, and is important to correct — especially in pregnancy, where folate protects the baby's development.",
    normal:         "Your folate is in a healthy range.",
    high:           "Elevated folate is generally harmless and usually reflects supplementation.",
  },

  // ── Diabetes (extended) ──
  insulin_fasting: {
    low:    "Your fasting insulin is low. In a non-diabetic this is usually not a concern; in diabetes it can reflect reduced insulin production.",
    normal: "Your fasting insulin is in a healthy range.",
    high:   "Your fasting insulin is elevated, which often signals insulin resistance — the body producing extra insulin to keep glucose normal. This is common before type 2 diabetes and is interpreted alongside glucose (and HOMA-IR).",
  },

  // ── Kidney (extended) ──
  cystatin_c: {
    normal: "Your Cystatin C is normal, suggesting good kidney filtration.",
    high:   "Your Cystatin C is elevated, which suggests reduced kidney filtration. It's a sensitive kidney marker, sometimes used alongside creatinine and eGFR.",
  },
  microalbumin: {
    normal: "Your urine microalbumin is normal — no sign of early kidney leak of protein.",
    high:   "Your urine microalbumin is elevated (microalbuminuria). This can be the earliest sign of kidney stress, especially in diabetes or high blood pressure, and is important because it's often reversible when caught early.",
  },

  // ── Inflammation (extended) ──
  procalcitonin: {
    normal: "Your procalcitonin is normal, which makes a serious bacterial infection less likely.",
    high:   "Your procalcitonin is elevated. This marker rises particularly with bacterial infections and sepsis, and helps doctors decide on antibiotics.",
    'critical-high': "Your procalcitonin is very high, which can indicate severe bacterial infection or sepsis — please seek urgent medical care.",
  },

  // ── Lipid (extended) ──
  lipoprotein_a: {
    normal: "Your Lipoprotein(a) is in the desirable range.",
    high:   "Your Lipoprotein(a) is elevated. This is a largely genetic, independent risk factor for heart disease. While it's hard to change with lifestyle, knowing it helps your doctor manage your overall cardiovascular risk more aggressively.",
  },
}
