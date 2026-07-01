import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return NextResponse.json({ error: 'An account with this email already exists — sign in instead' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Supabase silently "succeeds" for existing emails (resends confirmation) but
  // returns an empty identities array — detect and surface a proper 409.
  if (data.user?.identities?.length === 0) {
    return NextResponse.json({ error: 'An account with this email already exists — sign in instead' }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
