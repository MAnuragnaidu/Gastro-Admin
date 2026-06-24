import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthForm from './AuthForm';

export const metadata = {
  title: 'MyGastro.Ai - Patient Intake',
  description: 'Patient Intake Web App for MyGastro.Ai',
};

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId');
  const userRole = cookieStore.get('userRole');

  if (userId) {
    if (userRole?.value === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/form');
    }
  }

  return (
    <main className="container flex flex-col items-center justify-center min-h-[100vh]">
      <div className="glass-panel w-full" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-bold tracking-tight mb-1"
            style={{
              background: 'none',
              WebkitTextFillColor: 'initial',
              WebkitBackgroundClip: 'unset',
              color: '#1f2937',
            }}
          >
            <span style={{ color: '#1f2937' }}>myGastro</span>
            <span style={{ color: '#0891b2' }}>.AI</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            AI-Powered Gastroenterology Platform
          </p>
        </div>
        <AuthForm />
      </div>
      <footer className="mt-8 text-center text-xs" style={{ color: '#475569' }}>
        © 2026 myGastro.AI. Secure & ABHA Compliant.
      </footer>
    </main>
  );
}
