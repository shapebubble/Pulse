import { NextResponse } from 'next/server'

export async function GET() {
  const clientId     = process.env.LINKEDIN_CLIENT_ID
  const redirectUri  = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`
  const scope        = 'openid profile w_member_social r_member_social'
  const state        = Math.random().toString(36).slice(2)

  if (!clientId) {
    return NextResponse.json({ error: 'LinkedIn not configured' }, { status: 503 })
  }

  const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scope)
  url.searchParams.set('state', state)

  const response = NextResponse.redirect(url.toString())
  response.cookies.set('li_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600 })
  return response
}
