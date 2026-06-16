import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPTS = {
  'question-led': (topic: string, question: string, answer: string) => `You are writing a LinkedIn post for a senior UX designer with 15+ years of experience in digital and product design, now positioning himself as AI-fluent.

Topic area: ${topic}

The question that sparked this post:
"${question}"

Their answer (their authentic view — preserve this perspective):
"${answer}"

Write a LinkedIn post in QUESTION-LED format. Rules:
- Open by framing the question as the hook — the reader sees what was asked
- Example opener pattern: "Someone asked me [question]. Here's what I actually think."
- Their answer is the substance — develop it, don't dilute it
- Direct, opinionated, human. Not corporate. Occasional wit is fine.
- 200-280 words
- End with a short question or reflection that invites comments
- Use line breaks for readability — no wall of text
- Banned phrases: "excited to share", "game-changer", "leverage", "synergy", "in today's fast-paced world", "thrilled", "passionate"

Return only the post text — no preamble, no "Here's your post:", nothing extra.`,

  'free-speaking': (topic: string, question: string, answer: string) => `You are writing a LinkedIn post for a senior UX designer with 15+ years of experience in digital and product design, now positioning himself as AI-fluent.

Topic area: ${topic}

The question that prompted their thinking (do NOT reference this directly — use it as context only):
"${question}"

Their view (their authentic perspective — preserve this completely):
"${answer}"

Write a LinkedIn post in FREE-SPEAKING format. Rules:
- Sound like natural conversation, mid-thought — "I've been thinking about X" or "Something I keep coming back to…"
- The question is NOT mentioned — the post sounds like unprompted observation
- Their view is the whole post — you're just shaping it
- Warm and personal, not corporate. Write as if speaking to a smart friend.
- 200-280 words
- End with a short question or reflection that invites comments
- Use line breaks for readability — no wall of text
- Banned phrases: "excited to share", "game-changer", "leverage", "synergy", "in today's fast-paced world", "thrilled", "passionate"

Return only the post text — no preamble, nothing extra.`,
}

export async function POST(req: NextRequest) {
  const { answer, question, topic, format = 'question-led' } = await req.json()

  if (!answer?.trim()) {
    return NextResponse.json({ error: 'No answer provided' }, { status: 400 })
  }

  const promptFn = SYSTEM_PROMPTS[format as keyof typeof SYSTEM_PROMPTS] ?? SYSTEM_PROMPTS['question-led']

  const msg = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role:    'user',
      content: promptFn(topic ?? '', question ?? '', answer),
    }],
  })

  const post = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''

  return NextResponse.json({ post })
}
