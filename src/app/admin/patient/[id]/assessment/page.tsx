import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AssessmentWizard from './AssessmentWizard';
import LogoutButton from '../../../LogoutButton';

export default async function AdminAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('userRole');

  if (userRole?.value !== 'ADMIN') {
    redirect('/');
  }

  const resolvedParams = await params;

  const patient = await prisma.patient.findUnique({
    where: { id: parseInt(resolvedParams.id) },
    include: { user: true },
  });

  if (!patient) {
    return <div className="text-center mt-20 text-white">Patient not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
      <nav className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="font-extrabold text-xl text-slate-900 tracking-tight">
          myGastro<span className="text-[#0d9488]">.Ai</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
            Admin
          </span>
          <LogoutButton />
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-20">
        <AssessmentWizard patient={patient} />
      </div>
    </div>
  );
}
