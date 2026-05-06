import { NextRequest, NextResponse } from 'next/server';
import { buildKP3PPrompt, PatientData } from '@/lib/kp3p-prompt';
import { parseModelOutput } from '@/lib/kp3p-parser';
import { generateKP3PPdf } from '@/lib/kp3p-pdf';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const patient: PatientData = await req.json();
    const prompt = buildKP3PPrompt(patient);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: 'You are a medical documentation assistant. Fill templates exactly as instructed. Output ONLY the filled template — no preamble, no markdown fences.' }]
        },
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096
        }
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      return NextResponse.json({ error: 'Gemini API error: ' + err }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const modelOutput: string = aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    if (!modelOutput || modelOutput.length < 100)
      return NextResponse.json({ error: 'Empty model response' }, { status: 500 });

    const sections = parseModelOutput(modelOutput);
    const pdfBuffer = generateKP3PPdf(sections);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="KP3P_${patient.name}_${Date.now()}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
