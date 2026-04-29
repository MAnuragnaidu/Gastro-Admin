'use client';

import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';

export default function PatientDetails({ patient }: { patient: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(patient);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update patient');

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving data');
    } finally {
      setIsSaving(false);
    }
  };

  const generateDocx = async () => {
    // English protocol for the physician
    const docContent = `Generate complete KP-3P protocol for:

═══════════════════════════════════════
PATIENT INFORMATION
═══════════════════════════════════════
PATIENT: ${formData.name || ''}
PATIENT ID: ${formData.id || ''}
EMAIL: ${formData.user?.email || 'N/A'}
DATE OF BIRTH: ${formData.dateOfBirth || ''}
CURRENT AGE: ${formData.currentAge || ''} years
AGE AT DIAGNOSIS: ${formData.ageAtDiagnosis || ''} years
SEX: ${formData.sex || ''}

SMOKING STATUS: ${formData.smokingStatus || ''}
Smoking Details: 

CONTACT: ${formData.contactPhone || ''}
PLACE OF LIVING: ${formData.placeOfLiving || ''}
REFERRED BY: ${formData.referredBy || ''}

═══════════════════════════════════════
DISEASE CHARACTERISTICS
═══════════════════════════════════════
PRIMARY DIAGNOSIS: ${formData.primaryDiagnosis || ''}
MONTREAL CLASSIFICATION: ${formData.montrealClass || ''}
DISEASE DURATION: ${formData.diseaseDuration || ''}

PREVIOUS SURGERIES: ${formData.previousSurgeries || 'None'}
PERIANAL DISEASE (if CD): 

═══════════════════════════════════════
CURRENT DISEASE ACTIVITY
═══════════════════════════════════════
ACTIVITY LEVEL: ${formData.currentDiseaseActivity || ''}
ACTIVITY SCORE: 

Current Symptoms:
- Bowel frequency: ${formData.stoolFrequency || ''}
- Blood in stool: ${formData.bloodInStool || ''}
- Abdominal pain: ${formData.abdominalPain || ''}
- Quality of life impact: ${formData.impactOnQoL || ''}
- Weight loss: ${formData.weightLoss || ''}

═══════════════════════════════════════
LABORATORY & INVESTIGATIONS
═══════════════════════════════════════
LABS (Date: ${formData.dateMostRecentLabs || ''}):
${formData.recentLabValues || ''}

ENDOSCOPY (Date: ${formData.dateMostRecentColono || ''}):
${formData.colonoscopyFindings || ''}

RECENT IMAGING:
${formData.recentImaging || 'None'}

DEXA SCAN: ${formData.mostRecentDexa || 'None'}

═══════════════════════════════════════
CURRENT TREATMENT
═══════════════════════════════════════
CURRENT MEDICATIONS (with duration):
${formData.currentIbdMedications || 'None'}

RESPONSE TO CURRENT TREATMENT: ${formData.responseToTreatment || ''}

THERAPEUTIC DRUG MONITORING:
${formData.tdmResults || ''}

STEROID USE: ${formData.steroidUse || ''}

VITAMIN D/CALCIUM: 
${formData.currentSupplements || ''}

═══════════════════════════════════════
TREATMENT HISTORY
═══════════════════════════════════════
PREVIOUS TREATMENTS TRIED:
${formData.previousTreatmentsTried || 'None'}

DETAILS OF FAILED TREATMENTS:
${formData.failedTreatments || ''}

═══════════════════════════════════════
INFECTION SCREENING STATUS
═══════════════════════════════════════
TB SCREENING: ${formData.tbScreening || ''}

HEPATITIS B STATUS:
- HBsAg: ${formData.hepBSurfaceAg || ''}
- Anti-HBs: ${formData.hepBSurfaceAb || ''}
- Anti-HBc: ${formData.hepBCoreAb || ''}

HEPATITIS C (Anti-HCV): ${formData.antiHcv || ''}
HIV (Anti-HIV): ${formData.antiHiv || ''}

═══════════════════════════════════════
VACCINATION HISTORY (DETAILED)
═══════════════════════════════════════
Influenza: ${formData.influenza || ''}
COVID-19: ${formData.covid19 || ''}
Pneumococcal: ${formData.pneumococcal || ''}
Hepatitis B: ${formData.hepatitisB || ''}
Hepatitis A: ${formData.hepatitisA || ''}
Hepatitis E: ${formData.hepatitisE || ''}
Zoster (Shingrix): ${formData.zoster || ''}
MMR/Varicella: ${formData.mmrVaricella || ''}
Tetanus/Tdap: ${formData.tetanusTdap || ''}

═══════════════════════════════════════
OTHER MEDICAL INFORMATION
═══════════════════════════════════════
COMORBIDITIES: ${formData.comorbidities || 'None'}
EXTRAINTESTINAL MANIFESTATIONS: ${formData.extraintestinalManif || 'None'}

PREGNANCY/FAMILY PLANNING: ${formData.pregnancyPlanning || ''}
OCCUPATION: ${formData.occupation || ''}

SPECIAL CONSIDERATIONS:
${formData.specialConsiderations || ''}

═══════════════════════════════════════

Use 3-page CONCISE patient care plan format.

IMPORTANT LANGUAGE INSTRUCTION:
- Generate the CLINICAL PROTOCOL (Part 1) in ENGLISH (for the physician)
- Generate the PATIENT CARE PLAN (Part 2) in: ${formData.preferredLanguage === 'Telugu' ? 'Telugu' : 'English'}
- Maintain the same structure, warmth, and professionalism in the patient's language
- Use culturally appropriate medical terminology in ${formData.preferredLanguage === 'Telugu' ? 'Telugu' : 'English'}
- If patient language is English, generate everything in English`;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docContent.split('\\n').map(line => new Paragraph({
            children: [new TextRun(line)]
          })),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `KP-3P_Protocol_${formData.name?.replace(/\\s+/g, '_')}_${formData.id}.docx`);
  };

  const renderField = (label: string, field: string, type = 'text') => {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</label>
        {isEditing ? (
          <input
            type={type}
            value={formData[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', background: '#0f172a',
              border: '1px solid #334155', borderRadius: 6, color: '#f8fafc',
              fontSize: 14
            }}
          />
        ) : (
          <div style={{ fontSize: 14, color: '#e2e8f0', minHeight: 20 }}>{formData[field] || '—'}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 8 }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            {formData.name} <span style={{ color: '#64748b', fontSize: 16 }}>#{formData.id}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={generateDocx}
            style={{
              background: '#0ea5e9', color: '#fff', border: 'none', padding: '8px 16px',
              borderRadius: 6, fontWeight: 500, cursor: 'pointer'
            }}
          >
            Export DOCX
          </button>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', padding: '8px 16px',
                  borderRadius: 6, fontWeight: 500, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px',
                  borderRadius: 6, fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px',
                borderRadius: 6, fontWeight: 500, cursor: 'pointer'
              }}
            >
              Edit Details
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Patient Information</h3>
          {renderField('Full Name', 'name')}
          {renderField('MRN', 'mrn')}
          {renderField('Contact Phone', 'contactPhone')}
          {renderField('Place of Living', 'placeOfLiving')}
          {renderField('Referred By', 'referredBy')}
          {renderField('Date of Birth', 'dateOfBirth')}
          {renderField('Current Age', 'currentAge', 'number')}
          {renderField('Age at Diagnosis', 'ageAtDiagnosis', 'number')}
          {renderField('Sex', 'sex')}
          {renderField('Preferred Language', 'preferredLanguage')}
        </div>

        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Disease Characteristics</h3>
          {renderField('Primary Diagnosis', 'primaryDiagnosis')}
          {renderField('Montreal Classification', 'montrealClass')}
          {renderField('Disease Duration', 'diseaseDuration')}
          {renderField('Previous Surgeries', 'previousSurgeries')}
          {renderField('Current Disease Activity', 'currentDiseaseActivity')}
        </div>

        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Symptoms</h3>
          {renderField('Stool Frequency', 'stoolFrequency')}
          {renderField('Blood in Stool', 'bloodInStool')}
          {renderField('Abdominal Pain', 'abdominalPain')}
          {renderField('Impact on QoL', 'impactOnQoL')}
          {renderField('Weight Loss', 'weightLoss')}
        </div>

        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Labs & Imaging</h3>
          {renderField('Recent Labs Date', 'dateMostRecentLabs')}
          {renderField('Recent Lab Values', 'recentLabValues')}
          {renderField('Colonoscopy Date', 'dateMostRecentColono')}
          {renderField('Colonoscopy Findings', 'colonoscopyFindings')}
          {renderField('Recent Imaging', 'recentImaging')}
          {renderField('DEXA Scan', 'mostRecentDexa')}
        </div>

        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Treatment</h3>
          {renderField('Current IBD Meds', 'currentIbdMedications')}
          {renderField('Response to Treatment', 'responseToTreatment')}
          {renderField('TDM Results', 'tdmResults')}
          {renderField('Steroid Use', 'steroidUse')}
          {renderField('Current Supplements', 'currentSupplements')}
          {renderField('Previous Treatments Tried', 'previousTreatmentsTried')}
          {renderField('Failed Treatments', 'failedTreatments')}
        </div>

        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Infection Screening</h3>
          {renderField('TB Screening', 'tbScreening')}
          {renderField('Hep B Surface Ag', 'hepBSurfaceAg')}
          {renderField('Hep B Surface Ab', 'hepBSurfaceAb')}
          {renderField('Hep B Core Ab', 'hepBCoreAb')}
          {renderField('Anti-HCV', 'antiHcv')}
          {renderField('Anti-HIV', 'antiHiv')}
        </div>

        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12 }}>
          <h3 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 16 }}>Vaccines</h3>
          {renderField('Influenza', 'influenza')}
          {renderField('COVID-19', 'covid19')}
          {renderField('Pneumococcal', 'pneumococcal')}
          {renderField('Hepatitis B', 'hepatitisB')}
          {renderField('Hepatitis A', 'hepatitisA')}
          {renderField('Hepatitis E', 'hepatitisE')}
          {renderField('Zoster', 'zoster')}
          {renderField('MMR/Varicella', 'mmrVaricella')}
          {renderField('Tetanus/Tdap', 'tetanusTdap')}
        </div>
      </div>
    </div>
  );
}
