'use client';
import { useState } from 'react';
import { PatientData } from '@/lib/kp3p-prompt';

export function CaresheetButton({ patient, className, label }: { patient: PatientData; className?: string; label?: string }) {
  const [status, setStatus] = useState<'idle'|'loading'|'error'>('idle');
  const [err, setErr] = useState('');

  const handleClick = async () => {
    setStatus('loading'); setErr('');
    try {
      const res = await fetch('/api/generate-caresheet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || `HTTP ${res.status}`); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `KP3P_${patient.name}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setStatus('idle');
    } catch (e: any) { setErr(e.message); setStatus('error'); }
  };

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        style={{
          fontSize: 12, padding: '6px 14px', borderRadius: 7,
          border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
          color: '#fff', cursor: status === 'loading' ? 'wait' : 'pointer', fontWeight: 700,
          fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: 5,
          boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
          opacity: status === 'loading' ? 0.88 : 1,
        }}
      >
        {status === 'loading' ? '⏳ Generating PDF...' : (label || '📋 Download KP-3P Care Sheet')}
      </button>
      {status === 'error' && (
        <span style={{ fontSize: 12, color: '#e11d48', fontWeight: 600 }}>✗ {err}</span>
      )}
    </div>
  );
}
