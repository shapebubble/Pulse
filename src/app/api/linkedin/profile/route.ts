import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.linkedin_access_token) {
    return NextResponse.json({ name: null })
  }

  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${profile.linkedin_access_token}` },
  })

  if (!res.ok) return NextResponse.json({ name: null })

  const data = await res.json()
  const name = data.name ?? (data.given_name ? `${data.given_name} ${data.family_name ?? ''}`.trim() : null)
  return NextResponse.json({ name })
}
