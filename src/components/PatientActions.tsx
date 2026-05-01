'use client';

import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

export default function PatientActions({ patient }: { patient: any }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const generatePdf = () => {
    const doc = new jsPDF();
    const margin = 14;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(docContent, pageWidth - margin * 2);
    
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      const line = lines[i];
      if (line.includes('═════')) {
         doc.setTextColor(150, 150, 150);
      } else if (line === line.toUpperCase() && !line.includes(':') && line.length > 3) {
         doc.setFont('helvetica', 'bold');
         doc.setTextColor(0, 0, 0);
         y += 2;
      } else if (line.includes(':')) {
         const [label] = line.split(':');
         if (label === label.toUpperCase()) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
         } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
         }
      } else {
         doc.setFont('helvetica', 'normal');
         doc.setTextColor(0, 0, 0);
      }
      doc.text(line, margin, y);
      y += 5;
    }

    doc.save(`KP-3P_Protocol_${patient.name?.replace(/\s+/g, '_') || 'Patient'}_${patient.id}.pdf`);
  };

  const generateDocx = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export DOC</title></head>
      <body style="font-family: Arial, sans-serif;">
        ${docContent.replace(/\n/g, '<br>')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    saveAs(blob, `KP-3P_Protocol_${patient.name?.replace(/\s+/g, '_') || 'Patient'}_${patient.id}.doc`);
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
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: 12, padding: '6px 14px', borderRadius: 7,
            border: '1px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff', cursor: 'pointer',
            fontWeight: 500, fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          Export ▼
        </button>
        {showDropdown && (
          <div style={{
            position: 'absolute', right: 0, top: '100%', marginTop: '6px',
            background: '#ffffff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            overflow: 'hidden', zIndex: 50, minWidth: 160,
            display: 'flex', flexDirection: 'column'
          }}>
            <button
              onClick={() => { setShowDropdown(false); generatePdf(); }}
              style={{ padding: '10px 16px', fontSize: 13, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Export as PDF
            </button>
            <button
              onClick={() => { setShowDropdown(false); generateDocx(); }}
              style={{ padding: '10px 16px', fontSize: 13, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Export as DOCX
            </button>
            <button
              onClick={() => { setShowDropdown(false); handleExportDrive(); }}
              disabled={uploading}
              style={{ padding: '10px 16px', fontSize: 13, textAlign: 'left', background: 'none', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', color: '#334155', opacity: uploading ? 0.6 : 1 }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              {uploading ? 'Exporting to Drive...' : 'Export PDF to Drive'}
            </button>
          </div>
        )}
      </div>
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
