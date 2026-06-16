import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = req.cookies.get('li_state')?.value

  if (!code || state !== storedState) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_error=state_mismatch`)
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`

  // Exchange code for token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_error=token_exchange_failed`)
  }

  const { access_token, expires_in } = await tokenRes.json()

  // Get LinkedIn profile to extract author URN
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const profile = await profileRes.json()
  const authorUrn = profile.sub ? `urn:li:person:${profile.sub}` : null

  // Store token in user's profile
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth`)
  }

  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

  await supabase
    .from('profiles')
    .update({
      linkedin_access_token:      access_token,
      linkedin_token_expires_at:  expiresAt,
      linkedin_author_urn:        authorUrn,
    })
    .eq('id', user.id)

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_connected=1`)
  response.cookies.delete('li_state')
  return response
}
