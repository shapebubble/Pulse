import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { answer, question, topic } = await req.json()

  if (!answer?.trim()) {
    return NextResponse.json({ error: 'No answer provided' }, { status: 400 })
  }

  const msg = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role:    'user',
      content: `You are writing a LinkedIn post for a senior UX designer with 15+ years of experience in digital and product design, now positioning himself as AI-fluent.

Topic area: ${topic}

The question that sparked this post:
"${question}"

Their answer (their authentic view — preserve this perspective):
"${answer}"

Write a LinkedIn post. Rules:
- Start with a short punchy opener (no "I'm excited to share" nonsense)
- Weave in the question as the hook
- Their answer is the substance — develop it, don't dilute it
- Direct, opinionated, human. Not corporate. Occasional wit is fine.
- 200-280 words
- End with a short question or reflection that invites comments
- Use line breaks for readability — no wall of text
- Banned phrases: "excited to share", "game-changer", "leverage", "synergy", "in today's fast-paced world", "thrilled", "passionate"

Return only the post text — no preamble, no "Here's your post:", nothing extra.`,
    }],
  })

  const post = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''

  return NextResponse.json({ post })
}
