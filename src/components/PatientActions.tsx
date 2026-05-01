'use client';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import jsPDF from 'jspdf';

export default function PatientActions({ patient }: { patient: any }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const generateDocx = async () => {
    const parseArray = (str: any) => {
      try {
        const arr = JSON.parse(str || '[]');
        return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : 'None';
      } catch {
        return str || 'None';
      }
    };

    const docContent = `Generate complete KP-3P protocol for:

═══════════════════════════════════════
PATIENT INFORMATION
═══════════════════════════════════════
PATIENT: ${patient.name || ''}
PATIENT ID: ${patient.id || ''}
EMAIL: ${patient.user?.email || 'N/A'}
DATE OF BIRTH: ${patient.dateOfBirth || ''}
CURRENT AGE: ${patient.currentAge || ''} years
AGE AT DIAGNOSIS: ${patient.ageAtDiagnosis || ''} years
SEX: ${patient.sex || ''}

SMOKING STATUS: ${patient.smokingStatus || ''}
Smoking Details: 

CONTACT: ${patient.contactPhone || ''}
PLACE OF LIVING: ${patient.placeOfLiving || ''}
REFERRED BY: ${patient.referredBy || ''}

═══════════════════════════════════════
DISEASE CHARACTERISTICS
═══════════════════════════════════════
PRIMARY DIAGNOSIS: ${patient.primaryDiagnosis || ''}
MONTREAL CLASSIFICATION: ${patient.montrealClass || ''}
DISEASE DURATION: ${patient.diseaseDuration || ''}

PREVIOUS SURGERIES: ${parseArray(patient.previousSurgeries)}
PERIANAL DISEASE (if CD): 

═══════════════════════════════════════
CURRENT DISEASE ACTIVITY
═══════════════════════════════════════
ACTIVITY LEVEL: ${patient.currentDiseaseActivity || ''}
ACTIVITY SCORE: 

Current Symptoms:
- Bowel frequency: ${patient.stoolFrequency || ''}
- Blood in stool: ${patient.bloodInStool || ''}
- Abdominal pain: ${patient.abdominalPain || ''}
- Quality of life impact: ${patient.impactOnQoL || ''}
- Weight loss: ${patient.weightLoss || ''}

═══════════════════════════════════════
LABORATORY & INVESTIGATIONS
═══════════════════════════════════════
LABS (Date: ${patient.dateMostRecentLabs || ''}):
${patient.recentLabValues || ''}

ENDOSCOPY (Date: ${patient.dateMostRecentColono || ''}):
${patient.colonoscopyFindings || ''}

RECENT IMAGING:
${patient.recentImaging || 'None'}

DEXA SCAN: ${patient.mostRecentDexa || 'None'}

═══════════════════════════════════════
CURRENT TREATMENT
═══════════════════════════════════════
CURRENT MEDICATIONS (with duration):
${patient.currentIbdMedications || 'None'}

RESPONSE TO CURRENT TREATMENT: ${patient.responseToTreatment || ''}

THERAPEUTIC DRUG MONITORING:
${patient.tdmResults || ''}

STEROID USE: ${patient.steroidUse || ''}

VITAMIN D/CALCIUM: 
${patient.currentSupplements || ''}

═══════════════════════════════════════
TREATMENT HISTORY
═══════════════════════════════════════
PREVIOUS TREATMENTS TRIED:
${parseArray(patient.previousTreatmentsTried)}

DETAILS OF FAILED TREATMENTS:
${patient.failedTreatments || ''}

═══════════════════════════════════════
INFECTION SCREENING STATUS
═══════════════════════════════════════
TB SCREENING: ${patient.tbScreening || ''}

HEPATITIS B STATUS:
- HBsAg: ${patient.hepBSurfaceAg || ''}
- Anti-HBs: ${patient.hepBSurfaceAb || ''}
- Anti-HBc: ${patient.hepBCoreAb || ''}

HEPATITIS C (Anti-HCV): ${patient.antiHcv || ''}
HIV (Anti-HIV): ${patient.antiHiv || ''}

═══════════════════════════════════════
VACCINATION HISTORY (DETAILED)
═══════════════════════════════════════
Influenza: ${patient.influenza || ''}
COVID-19: ${patient.covid19 || ''}
Pneumococcal: ${patient.pneumococcal || ''}
Hepatitis B: ${patient.hepatitisB || ''}
Hepatitis A: ${patient.hepatitisA || ''}
Hepatitis E: ${patient.hepatitisE || ''}
Zoster (Shingrix): ${patient.zoster || ''}
MMR/Varicella: ${patient.mmrVaricella || ''}
Tetanus/Tdap: ${patient.tetanusTdap || ''}

═══════════════════════════════════════
OTHER MEDICAL INFORMATION
═══════════════════════════════════════
COMORBIDITIES: ${parseArray(patient.comorbidities)}
EXTRAINTESTINAL MANIFESTATIONS: ${patient.extraintestinalManif || 'None'}

PREGNANCY/FAMILY PLANNING: ${patient.pregnancyPlanning || ''}
OCCUPATION: ${patient.occupation || ''}

SPECIAL CONSIDERATIONS:
${patient.specialConsiderations || ''}

═══════════════════════════════════════

Use 3-page CONCISE patient care plan format.

IMPORTANT LANGUAGE INSTRUCTION:
- Generate the CLINICAL PROTOCOL (Part 1) in ENGLISH (for the physician)
- Generate the PATIENT CARE PLAN (Part 2) in: ${patient.preferredLanguage === 'Telugu' ? 'Telugu' : 'English'}
- Maintain the same structure, warmth, and professionalism in the patient's language
- Use culturally appropriate medical terminology in ${patient.preferredLanguage === 'Telugu' ? 'Telugu' : 'English'}
- If patient language is English, generate everything in English`;

    const doc = new Document({
      creator: "MyGastro.Ai",
      title: `KP-3P Protocol: ${patient.name || 'Patient'}`,
      description: "Automated Patient Clinical Protocol",
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            run: { font: "Calibri", size: 22, color: "1E293B" },
            paragraph: { spacing: { line: 276, after: 160 } },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: docContent.split('\n').map(line => {
            const txt = line.trimEnd();
            if (!txt) return new Paragraph({ children: [new TextRun("")] });
            if (txt.includes('═════')) {
              return new Paragraph({ children: [new TextRun({ text: txt, color: "94A3B8" })], spacing: { before: 100, after: 100 } });
            }
            if (txt === txt.toUpperCase() && !txt.includes(':') && txt.length > 3) {
              return new Paragraph({ children: [new TextRun({ text: txt, bold: true, size: 24, color: "0F172A" })], spacing: { before: 200, after: 80 } });
            }
            if (txt.startsWith('- ')) {
              const labelContent = txt.substring(2);
              if (labelContent.includes(':')) {
                const [label, ...rest] = labelContent.split(':');
                return new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: label + ':', bold: true }), new TextRun({ text: rest.join(':') })] });
              }
              return new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: labelContent })] });
            }
            if (txt.includes(':')) {
              const [label, ...rest] = txt.split(':');
              if (label.length < 50) {
                return new Paragraph({ children: [new TextRun({ text: label + ':', bold: true }), new TextRun({ text: rest.join(':') })] });
              }
            }
            return new Paragraph({ children: [new TextRun({ text: txt })] });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `KP-3P_Protocol_${patient.name?.replace(/\s+/g, '_') || 'Patient'}_${patient.id}.docx`);
  };

  const handleExportDrive = async () => {
    setUploading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Patient Structured Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Patient Name: ${patient.name || 'Unknown'}`, 14, 30);
      doc.text(`MRN: ${patient.mrn || 'N/A'}`, 14, 38);
      doc.text(`Date of Birth: ${patient.dateOfBirth || 'N/A'}`, 14, 46);
      doc.text(`Diagnosis: ${patient.primaryDiagnosis || 'N/A'}`, 14, 54);
      doc.text(`Disease Activity: ${patient.currentDiseaseActivity || 'N/A'}`, 14, 62);

      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], `${patient.name?.replace(/\s+/g, '_') || 'Patient'}_${patient.id}.pdf`, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('isExport', 'true');

      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload to Google Drive');

      if (data.webViewLink) {
        alert('Successfully exported to Google Drive!\nLink: ' + data.webViewLink);
        window.open(data.webViewLink, '_blank');
      } else {
        alert('Export successful, but no link was returned.');
      }
    } catch (err: any) {
      alert('Error exporting: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={handleExportDrive}
        disabled={uploading}
        style={{
          fontSize: 12, padding: '6px 14px', borderRadius: 7,
          border: '1px solid rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer',
          fontWeight: 500, fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s', opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? 'Exporting...' : 'Export PDF to Drive'}
      </button>
      <button
        onClick={generateDocx}
        style={{
          fontSize: 12, padding: '6px 14px', borderRadius: 7,
          border: '1px solid rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff', cursor: 'pointer',
          fontWeight: 500, fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s',
        }}
      >
        Export DOCX
      </button>
      <button
        onClick={() => router.push(`/admin/patient/${patient.id}/edit`)}
        style={{
          fontSize: 12, padding: '6px 14px', borderRadius: 7,
          border: 'none', background: '#fff', color: '#0f766e',
          cursor: 'pointer', fontWeight: 700,
          fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
        }}
      >
        Edit Details
      </button>
    </div>
  );
}
