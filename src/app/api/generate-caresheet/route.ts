import { NextRequest, NextResponse } from 'next/server';
import { buildKP3PPrompt, PatientData } from '@/lib/kp3p-prompt';
import { parseModelOutput } from '@/lib/kp3p-parser';
import { generateKP3PPdf } from '@/lib/kp3p-pdf';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const patient: PatientData = await req.json();
    const prompt = buildKP3PPrompt(patient);

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'KP-3P IBD Care Sheet',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-flash-1.5',
        max_tokens: 4096,
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'You are a medical documentation assistant. Fill templates exactly as instructed. Output ONLY the filled template — no preamble, no markdown fences.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      return NextResponse.json({ error: 'AI error: ' + err }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const modelOutput: string = aiData.choices?.[0]?.message?.content ?? '';
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
