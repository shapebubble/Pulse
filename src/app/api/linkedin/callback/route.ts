import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = req.cookies.get('li_state')?.value

  const oauthError = searchParams.get('error')
  if (oauthError === 'user_cancelled_authorize' || oauthError === 'user_cancelled_login') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin`)
  }
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
    const body = await tokenRes.text()
    console.error('LinkedIn token exchange failed:', tokenRes.status, body)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_error=token_exchange_failed`)
  }

  const tokenJson = await tokenRes.json()
  const { access_token, expires_in } = tokenJson

  if (!access_token) {
    console.error('LinkedIn token exchange returned no access_token:', JSON.stringify(tokenJson))
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_error=no_access_token`)
  }

  // Get LinkedIn profile to extract author URN
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const liProfile = await profileRes.json()
  const authorUrn = liProfile.sub ? `urn:li:person:${liProfile.sub}` : null

  // Store token in user's profile
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    console.error('LinkedIn callback: no Supabase session, error:', userError?.message)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_error=session_expired`)
  }

  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      linkedin_access_token:      access_token,
      linkedin_token_expires_at:  expiresAt,
      linkedin_author_urn:        authorUrn,
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('LinkedIn callback: failed to save token:', updateError.message)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_error=save_failed`)
  }

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?li_connected=1`)
  response.cookies.delete('li_state')
  return response
}
