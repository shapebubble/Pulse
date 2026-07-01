import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'

/** Returns the Monday of the current week as YYYY-MM-DD (UTC). */
function getMondayOfCurrentWeek(): string {
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0 = Sunday … 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + daysToMonday)
  return monday.toISOString().split('T')[0]
}

export async function POST() {
  // 1. Authenticate
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Read topics from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('topics')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.topics?.length) {
    return NextResponse.json({ error: 'No topics found for this user' }, { status: 400 })
  }

  const topics: string[] = profile.topics

  // 3. Fetch recent questions (last 30 days) to avoid duplicates
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - 30)

  const { data: recentQuestions } = await supabase
    .from('questions')
    .select('text')
    .gte('created_at', since.toISOString())

  const existingTexts = (recentQuestions ?? []).map((q: { text: string }) =>
    q.text.substring(0, 100)
  )

  // 4. Call Anthropic API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const client = new Anthropic({ apiKey })

  const topicsList = topics.join(', ')
  const existingList =
    existingTexts.length > 0
      ? existingTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')
      : 'None'

  const prompt =
    `Generate exactly 3 thought-provoking LinkedIn questions for a senior UX designer / product professional. ` +
    `The questions must be from these topic areas: ${topicsList}. ` +
    `They must be DIFFERENT from these existing questions:\n${existingList}\n\n` +
    `Each question should spark genuine reflection about professional experience and perspective — ` +
    `not "what do you think about AI?" style. ` +
    `Format: return ONLY a JSON array of 3 objects: [{"topic": "...", "text": "..."}]. ` +
    `Each \`topic\` must exactly match one of the topic areas listed.`

  let generated: Array<{ topic: string; text: string }>

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''

    // Strip markdown code fences if the model wraps its response
    const jsonStr = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    generated = JSON.parse(jsonStr)

    if (!Array.isArray(generated) || generated.length === 0) {
      throw new Error('Response was not a non-empty array')
    }
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[questions/refresh] Anthropic error:', detail)
    return NextResponse.json(
      { error: 'Failed to generate questions', detail },
      { status: 500 }
    )
  }

  // 5. Insert each question individually so partial success is possible
  const weekStart = getMondayOfCurrentWeek()

  const results = await Promise.allSettled(
    generated.map((q) =>
      supabase
        .from('questions')
        .insert({ text: q.text, topic: q.topic, week_start: weekStart })
        .select('id')
        .single()
    )
  )

  const count = results.filter((r) => r.status === 'fulfilled' && !r.value.error).length

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[questions/refresh] Insert ${i} rejected:`, r.reason)
    } else if (r.value.error) {
      console.error(`[questions/refresh] Insert ${i} error:`, r.value.error.message)
    }
  })

  // 6. Return result
  return NextResponse.json({ ok: true, count })
}
