import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { answer, question } = await req.json()

  if (!answer?.trim()) {
    return NextResponse.json({ error: 'No answer provided' }, { status: 400 })
  }

  try {
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role:    'user',
        content: `You are helping a senior UX designer polish their written answer before it becomes a LinkedIn post.

The question they were asked:
"${question}"

Their raw answer:
"${answer}"

Polish this answer. Keep their voice — direct, knowledgeable, occasionally opinionated. Fix grammar, tighten the language, remove filler words. Do NOT change the substance, reorder ideas, or add things they didn't say. Do NOT make it sound corporate or generic. Keep it natural and conversational.

Return only the polished answer text — no preamble, no explanation.`,
      }],
    })

    const polished = msg.content[0].type === 'text' ? msg.content[0].text.trim() : answer
    return NextResponse.json({ polished })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[polish] Anthropic error:', msg)
    return NextResponse.json({ error: 'Polish failed', detail: msg }, { status: 500 })
  }
}
