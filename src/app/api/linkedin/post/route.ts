import { NextRequest, NextResponse } from 'next/server'

// LinkedIn UGC Posts API
// Requires: access token stored in session/cookie after OAuth
export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'No post text' }, { status: 400 })
  }

  // TODO: retrieve LinkedIn access token from session
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN // placeholder — will come from OAuth session
  const authorUrn   = process.env.LINKEDIN_AUTHOR_URN   // e.g. "urn:li:person:XXXX"

  if (!accessToken || !authorUrn) {
    return NextResponse.json(
      { error: 'LinkedIn not connected — visit /admin to connect your account' },
      { status: 401 }
    )
  }

  const body = {
    author:     authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method:  'POST',
    headers: {
      'Authorization':  `Bearer ${accessToken}`,
      'Content-Type':   'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('LinkedIn post error:', err)
    return NextResponse.json({ error: 'LinkedIn API error', detail: err }, { status: res.status })
  }

  return NextResponse.json({ ok: true })
}
