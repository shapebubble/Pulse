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

type NotificationItem = {
  type: 'failed_post' | 'linkedin_expiry'
  message: string
  link: string
  count?: number
}

interface NotificationsData {
  total: number
  items: NotificationItem[]
}

export function Nav({ active }: { active?: 'history' | 'account' }) {
  const supabase = createClient()
  const router   = useRouter()

  const [open, setOpen]               = useState(false)
  const [email, setEmail]             = useState('')
  const [initial, setInitial]         = useState('A')
  const [displayName, setDisplayName] = useState('')
  const [signingOut, setSigningOut]   = useState(false)
  const [authed, setAuthed]           = useState<boolean | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Notification bell state
  const [bellOpen, setBellOpen]           = useState(false)
  const [notifications, setNotifications] = useState<NotificationsData>({ total: 0, items: [] })
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? '')
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'A'
        setDisplayName(name)
        setInitial((name[0] ?? 'A').toUpperCase())
        setAuthed(true)
      } else {
        setAuthed(false)
      }
    })
  }, [])

  // Fetch notifications once authenticated, then every 30s
  useEffect(() => {
    if (!authed) return
    const fetchNotifications = () => {
      fetch('/api/notifications')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setNotifications(data) })
        .catch(() => {})
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [authed])

  // Close both dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
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
        {/* E-008/E-009: Unauthenticated nav — show Log in + Sign up */}
        {authed === false && (
          <nav style={{
            display: 'flex', gap: 20,
            fontFamily: 'var(--font-mono)', fontSize: 12,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            <Link href="/auth" style={{ color: 'var(--color-ink-45)', textDecoration: 'none' }}>Log in</Link>
            <Link href="/auth" style={{
              color: 'var(--color-paper)', background: 'var(--color-oxblood)',
              padding: '6px 14px', textDecoration: 'none',
            }}>Sign up</Link>
          </nav>
        )}

        {/* Authenticated nav */}
        {authed && (
          <>
            <nav className="app-nav-links" style={{
              display: 'flex', gap: 34,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              <Link href="/history" style={linkStyle(active === 'history')}>History</Link>
              <Link href="/admin"   style={linkStyle(active === 'account')}>Account</Link>
            </nav>

            {/* Notification bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setBellOpen(o => !o)}
                aria-label={notifications.total > 0 ? `Notifications (${notifications.total})` : 'Notifications'}
                aria-expanded={bellOpen}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 6, position: 'relative',
                  color: notifications.total > 0 ? '#16150F' : 'var(--color-ink-45)',
                }}
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  width={20} height={20} style={{ display: 'block' }}
                  aria-hidden="true"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifications.total > 0 && (
                  <span style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 7, height: 7, background: '#E8404A',
                    borderRadius: '50%', display: 'block',
                  }} aria-hidden="true" />
                )}
              </button>

              {bellOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 290, background: 'var(--color-surface)',
                  border: '1px solid var(--color-hairline)',
                  zIndex: 100,
                }}>
                  <div style={{
                    padding: '10px 18px',
                    borderBottom: '1px solid var(--color-hairline)',
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'var(--color-ink-45)',
                  }}>
                    Notifications
                  </div>
                  {notifications.items.length === 0 ? (
                    <div style={{
                      padding: '14px 18px',
                      fontFamily: 'var(--font-sans)', fontSize: 13,
                      color: 'var(--color-ink-45)',
                    }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.items.map((item, i) => (
                      <Link
                        key={i}
                        href={item.link}
                        onClick={() => setBellOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '12px 18px',
                          borderBottom: i < notifications.items.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                          fontFamily: 'var(--font-sans)', fontSize: 13,
                          color: 'var(--color-ink)', textDecoration: 'none',
                        }}
                      >
                        <span style={{
                          width: 6, height: 6, background: '#E8404A',
                          borderRadius: '50%', flexShrink: 0, marginTop: 5,
                          display: 'block',
                        }} aria-hidden="true" />
                        {item.message}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

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
                  {displayName}
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
          </>
        )}
      </div>
    </header>
  )
}
