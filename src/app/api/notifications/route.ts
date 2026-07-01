import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

type NotificationItem = {
  type: 'failed_post' | 'linkedin_expiry'
  message: string
  link: string
  count?: number
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const items: NotificationItem[] = []

  // 1. Check for failed posts
  const { count: failedCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'failed')

  if (failedCount && failedCount > 0) {
    items.push({
      type: 'failed_post',
      message: failedCount === 1 ? 'A post failed to send' : `${failedCount} posts failed to send`,
      link: '/history',
      count: failedCount,
    })
  }

  // 2. Check LinkedIn token expiry (already expired or expiring within 7 days)
  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_access_token, linkedin_token_expires_at')
    .eq('id', user.id)
    .single()

  if (profile?.linkedin_access_token && profile.linkedin_token_expires_at) {
    const expiresAt = new Date(profile.linkedin_token_expires_at)
    const now = new Date()
    const msUntilExpiry = expiresAt.getTime() - now.getTime()
    const daysUntilExpiry = Math.floor(msUntilExpiry / (1000 * 60 * 60 * 24))

    if (expiresAt < now) {
      items.push({
        type: 'linkedin_expiry',
        message: 'LinkedIn connection has expired — reconnect in Account',
        link: '/admin',
      })
    } else if (daysUntilExpiry <= 7) {
      items.push({
        type: 'linkedin_expiry',
        message: `LinkedIn token expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
        link: '/admin',
      })
    }
  }

  return NextResponse.json({ total: items.length, items })
}
