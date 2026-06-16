import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  await supabase
    .from('profiles')
    .update({
      linkedin_access_token:     null,
      linkedin_token_expires_at: null,
      linkedin_author_urn:       null,
    })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
