export interface PatientData {
  name: string; id: string; age: number; sex: string; occupation: string;
  location: string; smoking: string; diagnosis: string; montreal: string;
  severity: string; duration: string; ageAtDx: number; priorSurgeries?: string;
  bowelFreq: string; bloodInStool: string; abdPain: string; weightLoss: string;
  hb: string; tlc: string; platelets: string; crp: string; albumin: string;
  mayoScore: string; endoscopyFindings: string; imagingFindings: string;
  dexa: string; currentMeds: string; treatmentResponse: string; tdm: string;
  priorFailed: string; tbStatus: string; hbsAg: string; antiHBs: string;
  antiHBc: string; antiHCV: string; antiHIV: string;
  comorbidities?: string[]; eim?: string; specialNotes?: string[];
  patientLanguage?: string;
  vaccines?: { influenza?:string; covid19?:string; pneumococcal?:string;
    hepatitisA?:string; hepatitisB?:string; zoster?:string; mmr?:string; tdap?:string; };
}

export function buildKP3PPrompt(patient: PatientData): string {
  const lang = patient.patientLanguage || 'Telugu';
  const today = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  return `You are a medical documentation assistant. Fill the template below using patient data.
RULES: Output ONLY the filled template. Keep all ##SECTION:NAME## markers exactly. Fill every [PLACEHOLDER] and every ROW. Write ${lang} section in ${lang} script. No extra text.

---BEGIN TEMPLATE---

##SECTION:HEADER##
PATIENT: ${patient.name} | ID: ${patient.id} | DATE: ${today} | PROTOCOL: KP-3P v1.0
DIAGNOSIS: ${patient.diagnosis} | MONTREAL: ${patient.montreal} | SEVERITY: ${patient.severity}
DOCTOR: Dr. Kiran Peddi | Yashoda Hospital, Somajiguda

##SECTION:RISK##
RISK_LEVEL: [LOW or MODERATE or HIGH]
TRAJECTORY: [one sentence predicted disease course]
APPROACH: [Step-up or Top-down or Accelerated]
EVIDENCE: [guideline name and year]
IMPLICATION: [one sentence clinical implication]

RISK_FACTORS:
- [risk factor 1 from patient data]
- [risk factor 2]
- [risk factor 3]
- [risk factor 4]
- [risk factor 5]
- [risk factor 6]

##SECTION:STRIDE##
ROW|Clinical (Short-term)|[measurable target e.g. HBI <5, stool freq ≤3/day]|Wk 12-16|⏳ Pending
ROW|Biochemical|[target e.g. CRP <5 mg/L, FC <150 μg/g, Albumin >3.5 g/dL]|Wk 12-24|⏳ Pending
ROW|Endoscopic|[target: SES-CD <3 for CD, Mayo 0-1 for UC]|Mo 6-12|⏳ Pending
ROW|Quality of Life|[target e.g. IBDQ >170]|Mo 3,6,12|⏳ Pending
ROW|Transmural Healing|[target e.g. MRE bowel wall normalization]|Mo 12-24|⏳ Pending
ESCALATION: [escalation plan if targets not met]

##SECTION:SCREENING##
ROW|TB Screening (IGRA + CXR)|${patient.tbStatus}|[if NOT TESTED: ORDER URGENTLY; if Negative: Cleared safe to proceed]
ROW|HBsAg|${patient.hbsAg}|[action]
ROW|Anti-HBs (Immunity)|${patient.antiHBs}|[if Positive: Immune no vaccine needed; if Negative: vaccinate]
ROW|Anti-HBc|${patient.antiHBc}|[action]
ROW|Anti-HCV|${patient.antiHCV}|[action]
ROW|Anti-HIV|${patient.antiHIV}|[action]
ALERT_DANGER: [most critical pre-treatment safety warning]

##SECTION:VACCINES##
ROW|Influenza (Inactivated)|${patient.vaccines?.influenza||'Unknown'}|[action]
ROW|COVID-19|${patient.vaccines?.covid19||'Unknown'}|[action]
ROW|Pneumococcal|${patient.vaccines?.pneumococcal||'Never'}|[if Never: URGENT PCV20 before biologic]
ROW|Hepatitis A|${patient.vaccines?.hepatitisA||'Never'}|[action]
ROW|Hepatitis B|${patient.vaccines?.hepatitisB||'Unknown'}|[check Anti-HBs status]
ROW|Zoster - Shingrix|${patient.vaccines?.zoster||'Unknown'}|[2 doses recommended before therapy]
ROW|MMR / Varicella (LIVE)|${patient.vaccines?.mmr||'Unknown'}|[LIVE VACCINE: give ≥4 weeks BEFORE immunosuppression. CONTRAINDICATED after starting biologic.]
ROW|Tdap / Tetanus|${patient.vaccines?.tdap||'Unknown'}|[action]
ROW|HPV|${patient.age<=26?'Eligible age '+patient.age:'Not applicable age '+patient.age}|[action]

##SECTION:TREATMENT##
MEDICATION: [recommended drug for this patient's diagnosis severity and treatment history]
DOSE: [exact dose and route]
SCHEDULE: [exact schedule]
MECHANISM: [one sentence plain language]
ONSET: [realistic timeline]
RATIONALE: [2 sentences specific to this patient]
EVIDENCE: [trial or guideline]
ALTERNATIVE: [alternative drug and when to prefer it]
STEROID_BRIDGE: [Yes with details OR No]

##SECTION:MONITORING##
ROW|Baseline (NOW)|[comprehensive baseline tests]|[reason]
ROW|Wk 2-4|[early safety labs]|[reason]
ROW|Wk 14 (post-induction)|[response labs + TDM]|[STRIDE-II first checkpoint]
ROW|Month 6|[labs + colonoscopy or MRE]|[endoscopic treat-to-target]
ROW|Every 6 months|[maintenance labs]|[long-term safety]
ROW|Annual|[annual surveillance]|[reason]
TDM: [TDM timing, target trough, what to do if sub-therapeutic]

##SECTION:COMORBIDITIES##
ROW|${patient.comorbidities?.[0]||'N/A'}|[management points]
ROW|${patient.comorbidities?.[1]||'N/A'}|[management points]
ROW|${patient.eim?'EIM: '+patient.eim:'Extraintestinal Manifestations'}|[biologic preference, referral]
ROW|Nutritional Status Albumin ${patient.albumin}|[dietitian referral, protein sources, IV iron, recheck]
ROW|${patient.specialNotes?.[0]||'Special Considerations'}|[management]

##SECTION:ALERTS##
ALERT_DANGER: [most urgent clinical danger — specific not generic]
ALERT_DANGER: [second danger]
ALERT_WARNING: [warning 1]
ALERT_WARNING: [warning 2]
ALERT_WARNING: [warning 3]

##SECTION:EVIDENCE##
- [guideline 1 with year]
- [guideline 2 with year]
- [guideline 3 with year]
- [trial 4 with year specific to recommended drug]
- [trial 5 with year]
- [consensus 6 with year]

##SECTION:PATIENT_TELUGU##
GREETING: [warm greeting in ${lang} using patient name]
CONDITION_EXPLAIN: [2-3 sentences in ${lang} explaining diagnosis simply]
CAUSE_EXPLAIN: [2 sentences in ${lang}: not patient's fault, not contagious, treatable]
MEDICATION_NAME: [drug name]
MEDICATION_EXPLAIN: [2 sentences in ${lang} — use tech analogy if software engineer]
MEDICATION_SCHEDULE: [schedule in ${lang}]
URGENCY_MESSAGE: [1 sentence in ${lang}: keep taking even when feeling better]

TESTS_NEEDED:
- [test 1 in ${lang}]
- [test 2 in ${lang}]
- [test 3 in ${lang}]

GOALS_TABLE:
ROW|[Month 1 in ${lang}]|[goal in ${lang}]|[measurement in ${lang}]
ROW|[Month 3-4 in ${lang}]|[goal in ${lang}]|[measurement in ${lang}]
ROW|[Month 6-12 in ${lang}]|[goal in ${lang}]|[measurement in ${lang}]
ROW|[Long-term in ${lang}]|[goal in ${lang}]|[measurement in ${lang}]

DIET_HELP: [foods that help in ${lang}]
DIET_AVOID: [foods to avoid in ${lang}]
LIFESTYLE: [lifestyle tips in ${lang} including occupation and smoking]
EMERGENCY_SIGNS: [emergency signs in ${lang} as bullet list]
CLOSING_MESSAGE: [warm closing in ${lang} mentioning patient name and normal life]

##SECTION:CONTACT##
DOCTOR: Dr. Kiran Peddi
TITLE: Gastroenterologist & IBD Specialist
CLINIC: Center for IBD, Yashoda Hospital, Somajiguda & Gastro Care Clinics, Gachibowli
PHONE_OFFICE: 9390150150
PHONE_EMERGENCY: 9581000505
WEBSITE: www.drkiranpeddi.com
HOURS: Mon-Fri 9AM-5PM | Sat 9AM-4PM

---END TEMPLATE---

PATIENT DATA:
Name: ${patient.name} | ID: ${patient.id} | Age: ${patient.age}y | Sex: ${patient.sex}
Occupation: ${patient.occupation} | Location: ${patient.location} | Smoking: ${patient.smoking}
Diagnosis: ${patient.diagnosis} | Montreal: ${patient.montreal} | Duration: ${patient.duration}
Age at Dx: ${patient.ageAtDx}y | Prior Surgeries: ${patient.priorSurgeries||'None'}
Severity: ${patient.severity} | Bowel Freq: ${patient.bowelFreq} | Blood: ${patient.bloodInStool}
Pain: ${patient.abdPain} | Weight Loss: ${patient.weightLoss}
Hb: ${patient.hb} | TLC: ${patient.tlc} | Platelets: ${patient.platelets} | CRP: ${patient.crp} | Albumin: ${patient.albumin}
Endoscopy: Mayo ${patient.mayoScore} | ${patient.endoscopyFindings}
Imaging: ${patient.imagingFindings} | DEXA: ${patient.dexa}
Current Meds: ${patient.currentMeds} | Response: ${patient.treatmentResponse} | TDM: ${patient.tdm}
Prior Failed: ${patient.priorFailed}
TB: ${patient.tbStatus} | HBsAg: ${patient.hbsAg} | Anti-HBs: ${patient.antiHBs} | Anti-HBc: ${patient.antiHBc}
Anti-HCV: ${patient.antiHCV} | Anti-HIV: ${patient.antiHIV}
Comorbidities: ${patient.comorbidities?.join(', ')||'None'} | EIM: ${patient.eim||'None'}
Special: ${patient.specialNotes?.join('; ')||'None'} | Language: ${lang}`;
}
