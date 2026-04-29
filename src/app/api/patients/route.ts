import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new NextResponse(null, { status: 200, headers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newPatient = await prisma.patient.create({
      data: {
        name: body.name || '',
        mrn: body.mrn || '',
        contactPhone: body.contactPhone || '',
        placeOfLiving: body.placeOfLiving || '',
        referredBy: body.referredBy || '',
        dateOfBirth: body.dateOfBirth || '',
        currentAge: parseInt(body.currentAge) || 0,
        ageAtDiagnosis: parseInt(body.ageAtDiagnosis) || 0,
        sex: body.sex || '',
        smokingStatus: body.smokingStatus || '',
        primaryDiagnosis: body.primaryDiagnosis || '',
        diseaseDuration: body.diseaseDuration || '',
        montrealClass: body.montrealClass || '',
        previousSurgeries: JSON.stringify(body.previousSurgeries || []),
        currentDiseaseActivity: body.currentDiseaseActivity || '',
        stoolFrequency: body.stoolFrequency || '',
        bloodInStool: body.bloodInStool || '',
        abdominalPain: body.abdominalPain || '',
        impactOnQoL: body.impactOnQoL || '',
        weightLoss: body.weightLoss || '',
        dateMostRecentLabs: body.dateMostRecentLabs || '',
        dateMostRecentColono: body.dateMostRecentColono || '',
        recentLabValues: body.recentLabValues || '',
        colonoscopyFindings: body.colonoscopyFindings || '',
        recentImaging: body.recentImaging || '',
        mostRecentDexa: body.mostRecentDexa || '',
        currentIbdMedications: body.currentIbdMedications || '',
        failedTreatments: body.failedTreatments || '',
        tdmResults: body.tdmResults || '',
        currentSupplements: body.currentSupplements || '',
        responseToTreatment: body.responseToTreatment || '',
        steroidUse: body.steroidUse || '',
        previousTreatmentsTried: JSON.stringify(body.previousTreatmentsTried || []),
        tbScreening: body.tbScreening || '',
        hepBSurfaceAg: body.hepBSurfaceAg || '',
        hepBSurfaceAb: body.hepBSurfaceAb || '',
        hepBCoreAb: body.hepBCoreAb || '',
        antiHcv: body.antiHcv || '',
        antiHiv: body.antiHiv || '',
        influenza: JSON.stringify(body.influenza || {}),
        covid19: JSON.stringify(body.covid19 || {}),
        pneumococcal: JSON.stringify(body.pneumococcal || {}),
        hepatitisB: JSON.stringify(body.hepatitisB || {}),
        hepatitisA: JSON.stringify(body.hepatitisA || {}),
        hepatitisE: JSON.stringify(body.hepatitisE || {}),
        zoster: JSON.stringify(body.zoster || {}),
        mmrVaricella: JSON.stringify(body.mmrVaricella || {}),
        tetanusTdap: JSON.stringify(body.tetanusTdap || {}),
        comorbidities: JSON.stringify(body.comorbidities || []),
        extraintestinalManif: JSON.stringify(body.extraintestinalManif || []),
        pregnancyPlanning: body.pregnancyPlanning || '',
        preferredLanguage: body.preferredLanguage || '',
        occupation: body.occupation || '',
        specialConsiderations: body.specialConsiderations || '',
      }
    });

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');

    return NextResponse.json({ success: true, patientId: newPatient.id }, { status: 200, headers });
  } catch (error: any) {
    console.error('Submission error:', error);
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json({ error: 'Failed to submit form: ' + error.message }, { status: 500, headers });
  }
}
