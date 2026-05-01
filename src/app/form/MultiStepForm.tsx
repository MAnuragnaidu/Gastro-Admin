'use client';

import { useState, useEffect } from 'react';
import { initialFormData, FormData } from './formData';
import { Step1, Step2, Step3 } from './StepComponents';

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 3;

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('mygastro_form_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...initialFormData, ...parsed });
      } catch (e) {
        console.error('Failed to parse draft');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mygastro_form_draft', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const updateData = (fields: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    // Convert arrays to JSON strings for Prisma schema compatibility
    const payload = {
      ...formData,
      previousSurgeries: JSON.stringify(formData.previousSurgeries),
      previousTreatmentsTried: JSON.stringify(formData.previousTreatmentsTried),
      comorbidities: JSON.stringify(formData.comorbidities),
      // Ensure numeric fields
      currentAge: Number(formData.currentAge) || 0,
      ageAtDiagnosis: Number(formData.ageAtDiagnosis) || 0,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit form');
      }

      localStorage.removeItem('mygastro_form_draft');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="text-center py-10">Loading...</div>;

  if (success) {
    return (
      <div className="glass-panel text-center animate-fade-in py-16">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <svg className="w-10 h-10" style={{ color: 'var(--success-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Submission Successful!</h2>
        <p className="text-lg text-gray-400 mb-8">Thank you for providing your information. Your clinical team will review it shortly.</p>
        <button onClick={() => window.location.href = '/'} className="btn btn-primary px-8">Return to Home</button>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="glass-panel text-center animate-fade-in py-12 px-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)' }}>
            👋
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-white">Welcome to myGastro.AI</h1>
        <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Please complete this comprehensive questionnaire to help us understand your medical history and current condition. Your data is secure and confidential.
        </p>
        <button onClick={() => setCurrentStep(1)} className="btn btn-primary w-full max-w-sm text-lg py-3">
          Begin Intake Form
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 animate-fade-in">
      <div className="mb-6 flex justify-end">
        <div className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ color: 'var(--primary-color)', background: 'rgba(13,148,136,0.1)' }}>
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="wizard-progress">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          let className = 'wizard-step';
          if (stepNum === currentStep) className += ' active';
          else if (stepNum < currentStep) className += ' completed';
          return <div key={idx} className={className}></div>;
        })}
      </div>

      <div className="min-h-[400px]">
        {currentStep === 1 && <Step1 data={formData} updateData={updateData} />}
        {currentStep === 2 && <Step2 data={formData} updateData={updateData} />}
        {currentStep === 3 && <Step3 data={formData} updateData={updateData} />}
      </div>

      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

      <div className="flex justify-between mt-8 border-t pt-6" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={handleBack}
          disabled={isSubmitting}
          className="btn btn-secondary"
        >
          Back
        </button>
        {currentStep < totalSteps ? (
          <button onClick={handleNext} className="btn btn-primary">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        )}
      </div>
    </div>
  );
}
