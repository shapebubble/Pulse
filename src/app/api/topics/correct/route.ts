import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { topic } = await req.json()
  if (!topic?.trim()) {
    return NextResponse.json({ corrected: null }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ corrected: null })
  }

  const client = new Anthropic({ apiKey })

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Correct the spelling of this LinkedIn topic category: "${topic}"

Rules:
- Only fix spelling errors, do not change meaning or reword
- Return ONLY the corrected topic name, nothing else
- If there are no spelling errors, return the exact input unchanged
- Capitalise properly (e.g. "Artficial inteligence" → "Artificial Intelligence")
- Do not add quotes in your response

Input: ${topic}`,
      }],
    })

    const corrected = msg.content[0].type === 'text' ? msg.content[0].text.trim() : null
    return NextResponse.json({ corrected })
  } catch {
    return NextResponse.json({ corrected: null })
  }
}
