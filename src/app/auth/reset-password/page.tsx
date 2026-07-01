'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { PostyonMark } from '@/components/Nav'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [linkError, setLinkError] = useState('')

  useEffect(() => {
    const hash = window.location.hash

    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const errorCode = params.get('error_code')
      const errorDesc = params.get('error_description')
      if (errorCode === 'otp_expired' || errorDesc?.includes('expired')) {
        setLinkError('This reset link has expired. Request a new one.')
      } else if (errorCode === 'otp_already_used') {
        setLinkError('This reset link has already been used.')
      } else {
        setLinkError('This reset link is invalid. Request a new one.')
      }
      return
    }

    // @supabase/ssr's createBrowserClient doesn't auto-process hash tokens —
    // manually extract and set the session when a recovery token lands in the hash
    if (hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data, error }) => {
            if (error || !data.session) {
              setLinkError('This reset link is invalid or expired. Request a new one.')
            } else {
              setSessionReady(true)
            }
          })
        return
      }
    }

    // Fallback for standard PKCE/cookie flow (page reload after session already set)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password || password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/'), 2500)
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px',
    border: '1px solid var(--color-hairline-2)',
    background: 'var(--color-surface)', fontSize: 15,
    fontFamily: 'var(--font-sans)', outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--color-ink-45)', marginBottom: 7,
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 420, maxWidth: '100%' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36 }}>
          <PostyonMark size={26} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.04em', color: 'var(--color-ink)' }}>
            Postyon
          </span>
        </Link>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', padding: '36px 32px' }}>
          {linkError ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 12px' }}>Link expired</h1>
              <p style={{ fontSize: 14, color: 'var(--color-ink-45)', lineHeight: 1.6, margin: '0 0 24px' }}>{linkError}</p>
              <Link href="/auth" style={{
                display: 'inline-block', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                color: 'var(--color-paper)', background: 'var(--color-oxblood)',
                padding: '0 22px', lineHeight: '46px', textDecoration: 'none',
              }}>
                Back to sign in
              </Link>
            </>
          ) : success ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 12px', color: 'var(--color-green)' }}>Password updated</h1>
              <p style={{ fontSize: 14, color: 'var(--color-ink-45)', margin: 0 }}>Taking you to the app…</p>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 8px' }}>Set a new password</h1>
              <p style={{ fontSize: 14, color: 'var(--color-ink-45)', margin: '0 0 28px', lineHeight: 1.55 }}>
                {sessionReady ? 'Choose a new password for your account.' : 'Verifying your reset link…'}
              </p>

              {sessionReady && (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>New password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters" style={inputStyle} required />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Confirm new password</label>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Type it again" style={inputStyle} required />
                  </div>
                  {error && (
                    <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-oxblood)', margin: '0 0 16px' }}>
                      <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '14px', background: 'var(--color-oxblood)',
                    color: 'var(--color-paper)', border: 'none', fontSize: 15, fontWeight: 600,
                    fontFamily: 'var(--font-sans)', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    {loading ? 'Updating…' : 'Set new password'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-ink-45)', marginTop: 20 }}>
          Remember it? <Link href="/auth" style={{ color: 'var(--color-oxblood)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
