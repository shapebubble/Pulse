import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const postUrn = req.nextUrl.searchParams.get('postId')
  if (!postUrn) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_access_token, linkedin_token_expires_at')
    .eq('id', user.id)
    .single()

  if (!profile?.linkedin_access_token) {
    return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 403 })
  }
  if (profile.linkedin_token_expires_at && new Date(profile.linkedin_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 403 })
  }

  // LinkedIn Social Actions API — gets likes count and comments count
  const encodedUrn = encodeURIComponent(postUrn)
  try {
    const [actionsRes, commentsRes] = await Promise.allSettled([
      fetch(`https://api.linkedin.com/v2/socialActions/${encodedUrn}`, {
        headers: {
          Authorization: `Bearer ${profile.linkedin_access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }),
      fetch(`https://api.linkedin.com/v2/socialActions/${encodedUrn}/comments?count=0`, {
        headers: {
          Authorization: `Bearer ${profile.linkedin_access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }),
    ])

    let likes = null
    let comments = null

    if (actionsRes.status === 'fulfilled' && actionsRes.value.ok) {
      const d = await actionsRes.value.json()
      likes = d.likesSummary?.totalLikes ?? null
    }
    if (commentsRes.status === 'fulfilled' && commentsRes.value.ok) {
      const d = await commentsRes.value.json()
      comments = d.paging?.total ?? null
    }

    return NextResponse.json({ likes, comments })
  } catch {
    return NextResponse.json({ likes: null, comments: null })
  }
}
