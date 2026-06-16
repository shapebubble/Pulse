import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as 'google' | 'github'
  if (provider !== 'google' && provider !== 'github') {
    return NextResponse.redirect('/auth?error=invalid_provider')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth?error=sso_failed`)
  }

  return NextResponse.redirect(data.url)
}
