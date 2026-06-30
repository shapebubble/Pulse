'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export function PostyonMark({ size = 30 }: { size?: number }) {
  const half = size / 2
  return (
    <span style={{ display: 'flex', width: size, height: size, flexShrink: 0 }} aria-hidden="true">
      <span style={{ width: half, height: size, background: '#1F28A8' }} />
      <span style={{ display: 'flex', flexDirection: 'column', width: half }}>
        <span style={{ width: half, height: half, background: '#F5C000' }} />
        <span style={{ width: half, height: half, background: '#E8404A' }} />
      </span>
    </span>
  )
}

export function PostyonWordmark({ size = 26 }: { size?: number }) {
  const markSize = Math.round(size * 0.92)
  const half = markSize / 2
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: size, letterSpacing: '-0.04em', color: 'var(--color-ink)',
      lineHeight: 1,
    }}>
      <span style={{ display: 'flex', width: markSize, height: markSize, flexShrink: 0 }} aria-hidden="true">
        <span style={{ width: half, height: markSize, background: '#1F28A8' }} />
        <span style={{ display: 'flex', flexDirection: 'column', width: half }}>
          <span style={{ width: half, height: half, background: '#F5C000' }} />
          <span style={{ width: half, height: half, background: '#E8404A' }} />
        </span>
      </span>
      Postyon
    </span>
  )
}

export function Nav({ active }: { active?: 'history' | 'account' }) {
  const supabase = createClient()
  const router   = useRouter()

  const [open, setOpen]       = useState(false)
  const [email, setEmail]     = useState('')
  const [initial, setInitial] = useState('A')
  const [signingOut, setSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? '')
        setInitial((user.email?.[0] ?? 'A').toUpperCase())
      }
    })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/auth')
  }

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color:          isActive ? 'var(--color-ink)' : 'var(--color-ink-45)',
    textDecoration: 'none',
    borderBottom:   isActive ? '2px solid var(--color-oxblood)' : 'none',
    paddingBottom:  isActive ? 3 : 0,
  })

  return (
    <header className="app-nav" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '26px 64px',
      borderBottom: '1px solid var(--color-hairline)',
      backgroundColor: 'var(--color-paper)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <PostyonMark size={30} />
        <span className="app-nav-wordmark" style={{ display: 'contents' }}>
          <PostyonWordmark size={26} />
        </span>
      </Link>

      <div className="app-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
        <nav className="app-nav-links" style={{
          display: 'flex', gap: 34,
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          <Link href="/history" style={linkStyle(active === 'history')}>History</Link>
          <Link href="/admin"   style={linkStyle(active === 'account')}>Account</Link>
        </nav>

        {/* Avatar dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label="User menu"
            aria-expanded={open}
            style={{
              width: 36, height: 36,
              background: 'var(--color-oxblood)', color: 'var(--color-paper)',
              fontFamily: 'var(--font-serif)', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            {initial}
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 220, background: 'var(--color-surface)',
              border: '1px solid var(--color-hairline)',
              zIndex: 100,
            }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-hairline)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                  {initial}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-45)', marginTop: 2 }}>
                  {email}
                </div>
              </div>
              <div style={{ padding: '8px 0' }}>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block', padding: '10px 18px',
                    fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink)',
                    textDecoration: 'none',
                  }}
                >
                  Account settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 18px',
                    fontFamily: 'var(--font-sans)', fontSize: 14,
                    color: 'var(--color-oxblood)', background: 'none', border: 'none',
                    cursor: 'pointer', opacity: signingOut ? 0.6 : 1,
                  }}
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
