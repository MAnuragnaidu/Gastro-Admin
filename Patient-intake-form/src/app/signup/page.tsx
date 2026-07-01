'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setPatientAuth, getPatientAuth } from '@/lib/intakeSession';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getPatientAuth()) {
      router.replace('/form');
    }
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/patient-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setPatientAuth(data.user);
      router.push('/form');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root home-landing" style={{ justifyContent: 'center' }}>
      <style>{`
        .home-landing.page-root {
          background: linear-gradient(180deg, #ffffff 0%, #f4f8fa 32%, #eef3f6 100%);
        }
        .home-landing .page-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 0 rgba(15,23,42,0.04);
        }
        .home-landing .header-tag {
          color: #0e7490;
          background: rgba(8,145,178,0.1);
          border: 1px solid rgba(8,145,178,0.22);
        }
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
          color: var(--text-muted); font-size: 13px;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
        .auth-link-row {
          text-align: center; font-size: 14px; color: var(--text-muted); margin-top: 4px;
        }
        .auth-link-row a {
          color: var(--primary); font-weight: 500; text-decoration: none; cursor: pointer;
        }
        .auth-link-row a:hover { text-decoration: underline; }
        .pw-wrap { position: relative; }
        .pw-wrap .fi { padding-right: 44px; }
        .pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 13px; padding: 4px;
        }
        .pw-toggle:hover { color: var(--text); }
        .pw-hint { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
      `}</style>

      <header className="page-header" style={{ position: 'absolute', width: '100%', top: 0 }}>
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/mygastro-logo.png"
            alt="myGastro.AI"
            style={{ height: 28, width: 'auto', display: 'block' }}
          />
        </div>
        <div className="header-tag">Patient Portal</div>
      </header>

      <main className="page-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>
        <div className="step-card" style={{ maxWidth: 440, width: '100%' }}>
          <div className="step-card-head" style={{ textAlign: 'center', padding: '20px 24px 6px' }}>
            <h1 className="step-title" style={{ margin: 0 }}>Create Account</h1>
            <p className="step-subtitle" style={{ marginTop: 6 }}>Sign up to begin your patient intake</p>
          </div>

          <div className="step-body" style={{ padding: '16px 28px 28px' }}>
            {error && (
              <div className="ferr" style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--error-bg)', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="fg" style={{ gap: 16 }}>
              <div className="fg">
                <label htmlFor="name">Full Name<span className="req">*</span></label>
                <input
                  id="name"
                  type="text"
                  className="fi"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="fg">
                <label htmlFor="email">Email Address<span className="req">*</span></label>
                <input
                  id="email"
                  type="email"
                  className="fi"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="fg">
                <label htmlFor="password">Password<span className="req">*</span></label>
                <div className="pw-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="fi"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="pw-hint">Must be at least 8 characters</p>
              </div>

              <div className="fg">
                <label htmlFor="confirmPassword">Confirm Password<span className="req">*</span></label>
                <div className="pw-wrap">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="fi"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px 24px' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <div className="auth-link-row">
              Already have an account?{' '}
              <a onClick={() => router.push('/')}>Sign in</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
