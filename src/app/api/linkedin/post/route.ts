import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { text, mediaUrn } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'No post text provided' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_access_token, linkedin_token_expires_at, linkedin_author_urn')
    .eq('id', user.id)
    .single()

  if (!profile?.linkedin_access_token) {
    return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 403 })
  }

  if (profile.linkedin_token_expires_at && new Date(profile.linkedin_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'LinkedIn token expired — reconnect in Account' }, { status: 403 })
  }

  const body = mediaUrn ? {
    author: profile.linkedin_author_urn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'IMAGE',
        media: [{
          status: 'READY',
          description: { text: 'Post image' },
          media: mediaUrn,
          title: { text: '' },
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  } : {
    author: profile.linkedin_author_urn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${profile.linkedin_access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('LinkedIn post error:', err)
    return NextResponse.json({ error: 'Failed to post to LinkedIn' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ ok: true, postId: data.id })
}
