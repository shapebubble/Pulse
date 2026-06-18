import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  // Always return ok — never reveal whether email exists
  return NextResponse.json({ ok: true })
}
