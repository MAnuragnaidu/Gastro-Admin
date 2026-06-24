import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MultiStepForm from './MultiStepForm';
import LogoutButton from '../admin/LogoutButton';

export default async function FormPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId');

  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full flex justify-between items-center px-6 py-4 border-b" style={{ background: 'rgba(5,13,26,0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="font-bold text-xl tracking-tight" style={{ color: '#f8fafc' }}>
            myGastro<span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.AI</span>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ background: 'var(--primary-color)', color: '#fff' }}>
            Patient Portal
          </span>
        </div>
        <LogoutButton />
      </header>
      
      <main className="flex-1 container flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-3xl">
          <MultiStepForm />
        </div>
      </main>
    </div>
  );
}
