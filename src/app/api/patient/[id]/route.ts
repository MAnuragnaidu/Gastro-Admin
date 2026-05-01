import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('userRole');

    if (userRole?.value !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const patientId = parseInt(resolvedParams.id, 10);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
    }

    const data = await request.json();

    // Prepare arrays as JSON strings
    const payload = {
      ...data,
      previousSurgeries: Array.isArray(data.previousSurgeries) ? JSON.stringify(data.previousSurgeries) : data.previousSurgeries,
      previousTreatmentsTried: Array.isArray(data.previousTreatmentsTried) ? JSON.stringify(data.previousTreatmentsTried) : data.previousTreatmentsTried,
      comorbidities: Array.isArray(data.comorbidities) ? JSON.stringify(data.comorbidities) : data.comorbidities,
      documents: Array.isArray(data.documents) ? JSON.stringify(data.documents) : data.documents,
      currentAge: Number(data.currentAge) || null,
      ageAtDiagnosis: Number(data.ageAtDiagnosis) || null,
    };

    // Remove relations if they slipped in
    delete payload.id;
    delete payload.userId;
    delete payload.user;
    delete payload.createdAt;
    delete payload.updatedAt;

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: payload,
    });

    return NextResponse.json(updatedPatient);
  } catch (error: any) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
