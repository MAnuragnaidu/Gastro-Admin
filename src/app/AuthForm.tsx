'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Force a hard refresh to re-evaluate server components (like layout/page)
      window.location.href = data.user.role === 'ADMIN' ? '/admin' : '/form';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div className="form-group mb-0">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              placeholder="John Doe"
            />
          </div>
        )}
        <div className="form-group mb-0">
          <label className="form-label">Email ID</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group mb-0 relative">
          <label className="form-label">Password</label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-8">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-full border-t" style={{ borderColor: 'var(--glass-border)' }}></div>
          <span className="relative px-3 text-xs" style={{ background: 'var(--surface-card)', color: 'var(--text-muted)' }}>OR</span>
        </div>
        <div className="text-center text-sm">
          <span className="text-muted mr-2">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            className="hover:underline bg-transparent border-none cursor-pointer font-medium"
            style={{ color: 'var(--primary-color)' }}
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
