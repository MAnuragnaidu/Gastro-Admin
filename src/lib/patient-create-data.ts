/** Build Prisma Patient.create `data` from intake JSON (handles MultiStepForm pre-stringified arrays). */

function normalizeJsonArray(val: unknown): string {
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string' && val.trim() !== '') {
    try {
      const p = JSON.parse(val);
      return JSON.stringify(Array.isArray(p) ? p : []);
    } catch {
      return JSON.stringify([]);
    }
  }
  return JSON.stringify([]);
}

/** Scalar or checkbox-array → stable string for DB (matches legacy intake + assessment forms). */
function normalizeExtrinsicManifestations(val: unknown): string {
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string') {
    const t = val.trim();
    if (!t) return '';
    try {
      const p = JSON.parse(t);
      if (Array.isArray(p)) return JSON.stringify(p);
    } catch {
      /* plain label e.g. "Joints" */
    }
    return val.trim();
  }
  return '';
}

function normalizeJsonObject(val: unknown): string {
  if (val && typeof val === 'object' && !Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string' && val.trim() !== '') {
    try {
      const p = JSON.parse(val);
      return JSON.stringify(p && typeof p === 'object' && !Array.isArray(p) ? p : {});
    } catch {
      return JSON.stringify({});
    }
  }
  return JSON.stringify({});
}

/** Admin assessment uses checkbox multi-select; legacy intake uses a plain string. */
function normalizePreferredLanguage(val: unknown): string {
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string') return val;
  return '';
}

export function patientCreateDataFromBody(body: Record<string, unknown>) {
  const b = body as Record<string, any>;
  return {
    name: b.name || '',
    email: typeof b.email === 'string' ? b.email.trim() : '',
    mrn: b.mrn || '',
    contactPhone: b.contactPhone || '',
    placeOfLiving: b.placeOfLiving || '',
    referredBy: b.referredBy || '',
    dateOfBirth: b.dateOfBirth || '',
    currentAge: parseInt(String(b.currentAge), 10) || 0,
    ageAtDiagnosis: parseInt(String(b.ageAtDiagnosis), 10) || 0,
    sex: b.sex || '',
    smokingStatus: b.smokingStatus || '',
    smokingDetails: typeof b.smokingDetails === 'string' ? b.smokingDetails.trim() : '',
    primaryDiagnosis: b.primaryDiagnosis || '',
    diseaseDuration: b.diseaseDuration || '',
    montrealClass: b.montrealClass || '',
    previousSurgeries: normalizeJsonArray(b.previousSurgeries),
    currentDiseaseActivity: b.currentDiseaseActivity || '',
    stoolFrequency: b.stoolFrequency || '',
    bloodInStool: b.bloodInStool || '',
    abdominalPain: b.abdominalPain || '',
    impactOnQoL: b.impactOnQoL || '',
    weightLoss: b.weightLoss || '',
    dateMostRecentLabs: b.dateMostRecentLabs || '',
    dateMostRecentColono: b.dateMostRecentColono || '',
    recentLabValues: b.recentLabValues || '',
    colonoscopyFindings: b.colonoscopyFindings || '',
    recentImaging: b.recentImaging || '',
    mostRecentDexa: b.mostRecentDexa || '',
    currentIbdMedications: b.currentIbdMedications || '',
    failedTreatments: b.failedTreatments || '',
    tdmResults: b.tdmResults || '',
    currentSupplements: b.currentSupplements || '',
    responseToTreatment: b.responseToTreatment || '',
    steroidUse: b.steroidUse || '',
    previousTreatmentsTried: normalizeJsonArray(b.previousTreatmentsTried),
    tbScreening: b.tbScreening || '',
    hepBSurfaceAg: b.hepBSurfaceAg || '',
    hepBSurfaceAb: b.hepBSurfaceAb || '',
    hepBCoreAb: b.hepBCoreAb || '',
    antiHcv: b.antiHcv || '',
    antiHiv: b.antiHiv || '',
    influenza: normalizeJsonObject(b.influenza),
    covid19: normalizeJsonObject(b.covid19),
    pneumococcal: normalizeJsonObject(b.pneumococcal),
    hepatitisB: normalizeJsonObject(b.hepatitisB),
    hepatitisA: normalizeJsonObject(b.hepatitisA),
    hepatitisE: normalizeJsonObject(b.hepatitisE),
    zoster: normalizeJsonObject(b.zoster),
    mmrVaricella: normalizeJsonObject(b.mmrVaricella),
    tetanusTdap: normalizeJsonObject(b.tetanusTdap),
    comorbidities: normalizeJsonArray(b.comorbidities),
    extraintestinalManif: normalizeExtrinsicManifestations(b.extraintestinalManif),
    pregnancyPlanning: b.pregnancyPlanning || '',
    preferredLanguage: normalizePreferredLanguage(b.preferredLanguage),
    occupation: b.occupation || '',
    specialConsiderations: b.specialConsiderations || '',
    documents: normalizeJsonArray(b.documents),
  };
}
