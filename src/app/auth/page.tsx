'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PostyonMark, PostyonWordmark } from '@/components/Nav'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [forgotStep, setForgotStep] = useState<'none' | 'input' | 'sent'>('none')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) {
      const messages: Record<string, string> = {
        sso_failed: 'Sign in failed — try again or use email',
        invalid_provider: 'Unknown sign-in method',
      }
      setError(messages[err] ?? 'Something went wrong — try again')
      window.history.replaceState({}, '', '/auth')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    try {
      const res  = await fetch(`/api/auth/${mode}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        if (mode === 'signup') {
          setConfirmationEmail(email)
        } else {
          window.location.href = '/'
        }
      }
    } catch {
      setError('Network error — please try again')
    }
    setLoading(false)
  }

  const handleSSO = (provider: 'google' | 'github') => {
    window.location.href = `/api/auth/sso/${provider}`
  }

  const handleForgotPassword = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotLoading(true)
    await fetch('/api/auth/forgot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail }),
    })
    setForgotStep('sent')
    setForgotLoading(false)
  }

  const hasError = !!error

  if (confirmationEmail) {
    return (
      <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
            <PostyonMark size={46} />
            <PostyonWordmark size={42} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 28, color: 'var(--color-ink)', margin: '0 0 12px' }}>
            Check your email
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-ink-45)', lineHeight: 1.6, margin: '0 0 8px' }}>
            We've sent a confirmation link to
          </p>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 28px' }}>
            {confirmationEmail}
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-ink-45)', margin: '0 0 20px' }}>
            Click the link in the email to activate your account.
          </p>
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: confirmationEmail }) })
            }}
            style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-oxblood)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}
          >
            Resend confirmation email
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100dvh', background: 'var(--color-paper)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative',
    }}>
      {/* Top label */}
      <div style={{
        position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.24em',
        textTransform: 'uppercase', color: 'var(--color-disabled-text)',
      }}>
        Postyon · {mode === 'login' ? 'Post your own narrative' : 'Create your account'}
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <PostyonMark size={46} />
          <PostyonWordmark size={42} />
        </div>
        <p style={{
          textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontWeight: 300, fontSize: 19, color: 'var(--color-ink-45)', margin: '0 0 40px',
        }}>
          One question a week. In your own voice.
        </p>

        {/* SSO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={() => handleSSO('google')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-ink)',
              background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)', height: 50,
            }}
          >
            <span style={{
              width: 18, height: 18, background: 'var(--color-ink)', color: 'var(--color-paper)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>
              G
            </span>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleSSO('github')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-ink)',
              background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)', height: 50,
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%', background: 'var(--color-ink)', color: 'var(--color-paper)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>
              GH
            </span>
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--color-hairline)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-light)' }}>
            or
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--color-hairline)' }} />
        </div>

        {/* Email + password form */}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email" style={{
            display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--color-ink-45)', marginBottom: 9,
          }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              display: 'block', width: '100%',
              background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)',
              padding: '14px 16px', fontSize: 15, color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
            }}
          />

          <label htmlFor="password" style={{
            display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: hasError ? 'var(--color-oxblood)' : 'var(--color-ink-45)',
            marginTop: 20, marginBottom: 9,
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              style={{
                display: 'block', width: '100%',
                background: 'var(--color-surface)',
                border: hasError ? '1.5px solid var(--color-oxblood)' : '1px solid var(--color-hairline-2)',
                padding: '14px 48px 14px 16px', fontSize: 15, color: 'var(--color-ink)',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', fontFamily: 'var(--font-mono)',
                fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--color-ink-45)', padding: 4,
              }}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          {mode === 'login' && forgotStep === 'none' && (
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => { setForgotStep('input'); setForgotEmail(email); setError('') }}
                style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-45)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {forgotStep === 'input' && (
            <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid var(--color-hairline)' }}>
              <p style={{ fontSize: 14, color: 'var(--color-ink-45)', margin: '0 0 14px' }}>
                Enter your email and we'll send a reset link.
              </p>
              <input
                type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                placeholder="your@email.com" autoComplete="email"
                style={{ display: 'block', width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)', padding: '12px 16px', fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" disabled={forgotLoading} onClick={handleForgotPassword} style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-paper)', background: 'var(--color-oxblood)', border: '1px solid var(--color-oxblood)', padding: '0 22px', height: 46, opacity: forgotLoading ? 0.6 : 1 }}>
                  {forgotLoading ? 'Sending…' : 'Send reset link'}
                </button>
                <button type="button" onClick={() => setForgotStep('none')} style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--color-ink-45)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          {forgotStep === 'sent' && (
            <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid var(--color-hairline)' }}>
              <p style={{ fontSize: 15, color: 'var(--color-ink)', margin: '0 0 8px' }}>Check your email for a reset link.</p>
              <p style={{ fontSize: 13, color: 'var(--color-ink-45)', margin: 0 }}>Sent to {forgotEmail}.</p>
              <button type="button" onClick={() => setForgotStep('none')} style={{ marginTop: 14, background: 'none', border: 'none', fontSize: 13, color: 'var(--color-ink-45)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>Back to sign in</button>
            </div>
          )}
          {error && forgotStep === 'none' && (
            <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--color-oxblood)', marginTop: 10 }}>
              <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block', width: '100%', marginTop: 24,
              fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500,
              color: 'var(--color-paper)', background: 'var(--color-oxblood)',
              border: '1px solid var(--color-oxblood)', height: 52,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in →' : 'Create account →')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-ink-45)', marginTop: 24 }}>
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{
              background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit',
              color: 'var(--color-oxblood)', textDecoration: 'underline', textUnderlineOffset: 3,
              cursor: 'pointer',
            }}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}
