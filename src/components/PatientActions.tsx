'use client';

import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { formatVaccineForDocExport } from '@/lib/formatVaccineExport';
import { carePlanPrimaryPatientLanguage } from '@/lib/preferredLanguagePrompt';

export default function PatientActions({ patient }: { patient: any }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── AI CARE SHEET STATES ──
  const [showCareSheet, setShowCareSheet] = useState(false);
  const [careSheetContent, setCareSheetContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [generateError, setGenerateError] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const patientEmailForExport = (p: any): string => {
    const fromUser = p?.user?.email?.trim?.();
    if (fromUser) return fromUser;
    const fromPatient = typeof p?.email === 'string' ? p.email.trim() : '';
    return fromPatient || 'N/A';
  };

  const escapeHtmlForWord = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const parseArray = (str: any) => {
    try {
      const arr = JSON.parse(str || '[]');
      return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : 'None';
    } catch { return str || 'None'; }
  };

  const docContent = `Generate KP-3P protocol.
[PATIENT]
Name:${patient.name||''} ID:${patient.id||''} DOB:${patient.dateOfBirth||''} Age:${patient.currentAge||''}y Sex:${patient.sex||''}
Email:${patientEmailForExport(patient)} Phone:${patient.contactPhone||''} Location:${patient.placeOfLiving||''} Occupation:${patient.occupation||''} ReferredBy:${patient.referredBy||''}
SmokingStatus:${patient.smokingStatus||''} SmokingDetails:${patient.smokingDetails||''}
[DISEASE]
Diagnosis:${patient.primaryDiagnosis||''} Montreal:${patient.montrealClass||''} Duration:${patient.diseaseDuration||''} AgeAtDx:${patient.ageAtDiagnosis||''}y PriorSurgeries:${parseArray(patient.previousSurgeries)}
[ACTIVITY]
Level:${patient.currentDiseaseActivity||''} BowelFreq:${patient.stoolFrequency||''} BloodInStool:${patient.bloodInStool||''} AbdPain:${patient.abdominalPain||''} QoL:${patient.impactOnQoL||''} WeightLoss:${patient.weightLoss||''}
[LABS]
Labs(${patient.dateMostRecentLabs||''}):${patient.recentLabValues||''} Endoscopy(${patient.dateMostRecentColono||''}):${patient.colonoscopyFindings||''} Imaging:${patient.recentImaging||'None'} DEXA:${patient.mostRecentDexa||'None'}
[TREATMENT]
CurrentMeds:${patient.currentIbdMedications||'None'} Response:${patient.responseToTreatment||''} TDM:${patient.tdmResults||''} Steroids:${patient.steroidUse||''} Supplements:${patient.currentSupplements||''}
PriorTx:${parseArray(patient.previousTreatmentsTried)} FailedTx:${patient.failedTreatments||''}
[SCREENING]
TB:${patient.tbScreening||''} HBsAg:${patient.hepBSurfaceAg||''} AntiHBs:${patient.hepBSurfaceAb||''} AntiHBc:${patient.hepBCoreAb||''} AntiHCV:${patient.antiHcv||''} AntiHIV:${patient.antiHiv||''}
[VACCINES]
Influenza:${formatVaccineForDocExport(patient.influenza)} COVID19:${formatVaccineForDocExport(patient.covid19)} Pneumococcal:${formatVaccineForDocExport(patient.pneumococcal)} HepB:${formatVaccineForDocExport(patient.hepatitisB)} HepA:${formatVaccineForDocExport(patient.hepatitisA)} HepE:${formatVaccineForDocExport(patient.hepatitisE)} Zoster:${formatVaccineForDocExport(patient.zoster)} MMR/Varicella:${formatVaccineForDocExport(patient.mmrVaricella)} Tdap:${formatVaccineForDocExport(patient.tetanusTdap)}
[OTHER]
Comorbidities:${parseArray(patient.comorbidities)} EIM:${patient.extraintestinalManif||'None'} Pregnancy:${patient.pregnancyPlanning||''} SpecialNotes:${patient.specialConsiderations||''}
Format: 3-page concise care plan. Part1(Clinical Protocol):English. Part2(Patient Care Plan):${carePlanPrimaryPatientLanguage(patient.preferredLanguage)}`;

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
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      const line = lines[i];
      if (line.includes('═════')) { doc.setTextColor(150, 150, 150); }
      else if (line === line.toUpperCase() && !line.includes(':') && line.length > 3) { doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0); y += 2; }
      else if (line.includes(':')) {
        const [label] = line.split(':');
        if (label === label.toUpperCase()) { doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0); }
        else { doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0); }
      } else { doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0); }
      doc.text(line, margin, y);
      y += 5;
    }
    doc.save(`KP-3P_Protocol_${patient.name?.replace(/\s+/g, '_') || 'Patient'}_${patient.id}.pdf`);
  };

  const generateDocx = () => {
    const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export DOC</title></head>
      <body style="font-family: Arial, sans-serif;">${escapeHtmlForWord(docContent).replace(/\n/g, '<br>')}</body></html>`;
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
      formData.append('patientName', String(patient.name || ''));
      formData.append('mrn', String(patient.mrn || ''));
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload to Google Drive');
      if (data.webViewLink) { alert('Successfully exported to Google Drive!\nLink: ' + data.webViewLink); window.open(data.webViewLink, '_blank'); }
      else { alert('Export successful, but no link was returned.'); }
    } catch (err: any) {
      alert('Error exporting: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── GENERATE CARE SHEET ──
  const handleGenerateCareSheet = async () => {
    setShowCareSheet(true);
    setIsGenerating(true);
    setGenerateError('');
    setCareSheetContent('');
    setIsApproved(false);
    try {
      const res = await fetch('/api/generate-care-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData: patient }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setCareSheetContent(data.careSheet);
    } catch (err: any) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── DOWNLOAD CARE SHEET AS PDF ──
  const handleDownloadPDF = async () => {
    const { default: jsPDFLib } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const element = document.getElementById('care-sheet-preview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDFLib({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 10;
    let remainingHeight = imgHeight;
    while (remainingHeight > 0) {
      pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
      remainingHeight -= (pageHeight - 20);
      if (remainingHeight > 0) { pdf.addPage(); y = 10 - (imgHeight - remainingHeight); }
    }
    pdf.save(`care-sheet-${patient.name ?? 'patient'}.pdf`);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

        {/* ── AI CARE SHEET BUTTON ── */}
        <button
          onClick={handleGenerateCareSheet}
          style={{
            fontSize: 12, padding: '6px 14px', borderRadius: 7,
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
            color: '#fff', cursor: 'pointer', fontWeight: 700,
            fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
          }}
        >
          ✨ AI Care Sheet
        </button>

        {/* ── EXPORT DROPDOWN ── */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: 12, padding: '6px 14px', borderRadius: 7,
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff', cursor: 'pointer',
              fontWeight: 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}
          >
            Export ▼
          </button>
          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '6px',
              background: '#ffffff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              overflow: 'hidden', zIndex: 50, minWidth: 160, display: 'flex', flexDirection: 'column'
            }}>
              <button onClick={() => { setShowDropdown(false); generatePdf(); }} style={{ padding: '10px 16px', fontSize: 13, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' }} onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')} onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>Export as PDF</button>
              <button onClick={() => { setShowDropdown(false); generateDocx(); }} style={{ padding: '10px 16px', fontSize: 13, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' }} onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')} onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>Export as DOCX</button>
              <button onClick={() => { setShowDropdown(false); handleExportDrive(); }} disabled={uploading} style={{ padding: '10px 16px', fontSize: 13, textAlign: 'left', background: 'none', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', color: '#334155', opacity: uploading ? 0.6 : 1 }} onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')} onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>{uploading ? 'Exporting to Drive...' : 'Export PDF to Drive'}</button>
            </div>
          )}
        </div>

        {/* ── EDIT DETAILS BUTTON ── */}
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

      {/* ── AI CARE SHEET MODAL ── */}
      {showCareSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Care Sheet</h2>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{patient.name ?? 'Patient'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isApproved && (
                  <button onClick={handleDownloadPDF} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#059669', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⬇ Download PDF
                  </button>
                )}
                {!isApproved && !isGenerating && careSheetContent && (
                  <button onClick={() => setIsApproved(true)} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#2563eb', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                    ✅ Approve
                  </button>
                )}
                <button onClick={() => setShowCareSheet(false)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}>
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

              {/* Loading */}
              {isGenerating && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#7c3aed', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 14, color: '#64748b' }}>Generating care sheet with AI...</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>This may take 15-30 seconds</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Error */}
              {generateError && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: 16, color: '#e11d48', fontSize: 13 }}>
                  ⚠️ {generateError}
                </div>
              )}

              {/* Care Sheet Content */}
              {!isGenerating && careSheetContent && (
                <>
                  {isApproved ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                      ✅ Approved — Ready to download as PDF
                    </div>
                  ) : (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
                      ✏️ You can edit the care sheet below before approving
                    </div>
                  )}
                  <div
                    id="care-sheet-preview"
                    contentEditable={!isApproved}
                    suppressContentEditableWarning
                    style={{
                      minHeight: 400, padding: 24, borderRadius: 10,
                      border: isApproved ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      background: isApproved ? '#f0fdf4' : '#ffffff',
                      fontSize: 14, lineHeight: 1.8, color: '#0f172a',
                      outline: 'none', whiteSpace: 'pre-wrap',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {careSheetContent}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}