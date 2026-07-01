import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params
  const provider = providerParam as 'google' | 'linkedin_oidc'
  if (provider !== 'google' && provider !== 'linkedin_oidc') {
    return NextResponse.redirect(new URL('/auth?error=invalid_provider', req.url).toString())
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
