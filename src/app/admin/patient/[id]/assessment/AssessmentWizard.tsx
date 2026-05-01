'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminStep1, AdminStep2, AdminStep3, AdminStep4, AdminStep5,
  AdminStep6, AdminStep7, AdminStep8, AdminStep9
} from './AdminAssessmentSteps';

const stepLabels = [
  "Basic Info", "Location", "Medical Info", "Gender",
  "History", "Symptoms", "Examination", "Investigation", "Summary"
];

const stepHeadings = [
  "Patient Characteristics",
  "Medical Profile (Health Info & Vaccines)",
  "Health Records & Documents",
  "Disease Characteristics",
  "Disease Activity & Symptoms",
  "Laboratory & Investigations",
  "Current Treatment",
  "Treatment History",
  "Infection Screening & Comorbidities"
];

export default function AssessmentWizard({ patient }: { patient: any }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(() => {
    const parsed = { ...patient };
    try { if (typeof parsed.previousSurgeries === 'string') parsed.previousSurgeries = JSON.parse(parsed.previousSurgeries); } catch (e) { }
    try { if (typeof parsed.previousTreatmentsTried === 'string') parsed.previousTreatmentsTried = JSON.parse(parsed.previousTreatmentsTried); } catch (e) { }
    try { if (typeof parsed.comorbidities === 'string') parsed.comorbidities = JSON.parse(parsed.comorbidities); } catch (e) { }
    try { if (typeof parsed.documents === 'string') parsed.documents = JSON.parse(parsed.documents); } catch (e) { }
    return parsed;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 9;

  const updateData = (fields: any) => {
    setFormData((prev: any) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/patient/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save assessment');
      router.push(`/admin/patient/${patient.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      border: '0.5px solid #e2e8f0',
      borderRadius: 20,
      display: 'flex',
      flexDirection: 'row',
      minHeight: 700,
      width: '100%',
      maxWidth: 1100,
      margin: '32px auto',
      overflow: 'hidden',
    }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: 250,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #0891b2 0%, #a5f3fc 100%)',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative bg circle */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path>
          </svg>
          <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px' }}>
            Clinical Assessment
          </span>
        </div>

        {/* Subtitle */}
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11.5, lineHeight: 1.6, marginBottom: 20, position: 'relative', zIndex: 1 }}>
          9 Steps to complete the patient assessment
        </p>

        {/* Patient chip */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 10, padding: '8px 12px', marginBottom: 22,
          position: 'relative', zIndex: 1,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Patient</p>
          <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 700 }}>{patient.name}</p>
        </div>

        {/* Step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, position: 'relative', zIndex: 1 }}>
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isPast = stepNum < currentStep;
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 8px', borderRadius: 8,
                background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: isActive ? '#ffffff' : isPast ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                  color: isActive ? '#0891b2' : '#ffffff',
                }}>
                  {isPast ? '✓' : stepNum}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12, marginTop: 12, position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
            Step <span style={{ color: '#ffffff', fontWeight: 700 }}>{currentStep}</span> of {totalSteps}
          </p>
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL ── */}
      <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column', background: '#fafafa', minWidth: 0 }}>

        {/* Horizontal step indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 24, borderBottom: '0.5px solid #e2e8f0', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 15, left: 30, right: 30, height: 2, background: '#e2e8f0', zIndex: 0 }} />
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isPast = stepNum < currentStep;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, minWidth: 56 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: isActive ? '#2563eb' : isPast ? '#0d9488' : '#ffffff',
                  border: isActive || isPast ? 'none' : '2px solid #e2e8f0',
                  color: isActive || isPast ? '#ffffff' : '#94a3b8',
                  boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {isPast
                    ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    : stepNum}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, textAlign: 'center',
                  textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3,
                  color: isActive ? '#2563eb' : '#94a3b8',
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step heading */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Step {currentStep} of {totalSteps}
          </p>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{stepHeadings[currentStep - 1]}</h3>
        </div>

        {/* Form content */}
        <div style={{ flex: 1, background: '#ffffff', padding: '24px', borderRadius: 12, border: '0.5px solid #e2e8f0', marginBottom: 20 }}>
          {currentStep === 1 && <AdminStep1 data={formData} updateData={updateData} />}
          {currentStep === 2 && <AdminStep2 data={formData} updateData={updateData} />}
          {currentStep === 3 && <AdminStep3 data={formData} updateData={updateData} />}
          {currentStep === 4 && <AdminStep4 data={formData} updateData={updateData} />}
          {currentStep === 5 && <AdminStep5 data={formData} updateData={updateData} />}
          {currentStep === 6 && <AdminStep6 data={formData} updateData={updateData} />}
          {currentStep === 7 && <AdminStep7 data={formData} updateData={updateData} />}
          {currentStep === 8 && <AdminStep8 data={formData} updateData={updateData} />}
          {currentStep === 9 && <AdminStep9 data={formData} updateData={updateData} />}
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        {/* Bottom navigation */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, paddingTop: 20, borderTop: '0.5px solid #e2e8f0' }}>
          {currentStep > 1 && (
            <button onClick={handleBack} disabled={isSubmitting} style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              Back
            </button>
          )}
          <button onClick={handleSave} disabled={isSubmitting} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569',
            cursor: isSubmitting ? 'not-allowed' : 'pointer', marginLeft: 'auto', transition: 'all 0.2s',
          }}>
            {isSubmitting ? 'Saving...' : 'Save & Exit'}
          </button>
          {currentStep < totalSteps ? (
            <button onClick={handleNext} style={{
              padding: '8px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: '#2563eb', border: 'none', color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all 0.2s',
            }}>
              Next <span>→</span>
            </button>
          ) : (
            <button onClick={handleSave} disabled={isSubmitting} style={{
              padding: '8px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: '#2563eb', border: 'none', color: '#ffffff',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all 0.2s',
            }}>
              {isSubmitting ? 'Saving...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
