import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import path from 'path'
import fs from 'fs'

export async function POST(req: NextRequest) {
  try {
    // 1. Get patient data from request body (JSON)
    const { patientData } = await req.json()

    if (!patientData) {
      return NextResponse.json({ error: 'No patient data provided' }, { status: 400 })
    }

    // 2. Format patient data as readable text
    const patientText = Object.entries(patientData)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n')

    // 3. Read your 24-page prompt docx
    const promptPath = path.join(process.cwd(), 'public', 'prompts', 'care-sheet-prompt.docx')
    const promptBuffer = fs.readFileSync(promptPath)
    const promptResult = await mammoth.extractRawText({ buffer: promptBuffer })
    const promptText = promptResult.value

    // 4. Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'MyGastro AI',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL?.trim() || 'liquid/lfm-2.5-1.2b-instruct:free',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `${promptText}\n\n---\n\nPatient Data:\n${patientText}`
          }
        ]
      })
    })

    const data = await response.json()

    // 5. Check for API errors
    if (data.error) {
      console.error('OpenRouter error:', data.error)
      return NextResponse.json({ error: data.error.message || 'LLM error' }, { status: 500 })
    }

    const careSheet = data.choices?.[0]?.message?.content

    if (!careSheet) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    return NextResponse.json({ careSheet })

  } catch (error: any) {
    console.error('Error generating care sheet:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate care sheet' }, { status: 500 })
  }
}