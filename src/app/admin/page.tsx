'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { createClient } from '@/lib/supabase-browser'

const ALL_TOPICS = ['AI × Design', 'UX Craft', 'Process', 'Product thinking', 'Career'] as const

interface Profile {
  full_name: string | null
  topics: string[]
  linkedin_access_token: string | null
  linkedin_token_expires_at: string | null
}

export default function AdminPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [profile, setProfile]                   = useState<Profile | null>(null)
  const [userEmail, setUserEmail]               = useState('')
  const [activeTopics, setActiveTopics]         = useState<Set<string>>(new Set(ALL_TOPICS))
  const [savingTopics, setSavingTopics]         = useState(false)
  const [disconnecting, setDisconnecting]       = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [signingOut, setSigningOut]             = useState(false)
  const [loading, setLoading]                   = useState(true)
  const [linkedInError, setLinkedInError]       = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? '')

      const { data } = await supabase
        .from('profiles')
        .select('full_name, topics, linkedin_access_token, linkedin_token_expires_at')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setActiveTopics(new Set(data.topics ?? ALL_TOPICS))
      }

      // Handle LinkedIn callback params
      const params = new URLSearchParams(window.location.search)
      if (params.get('li_connected')) {
        window.history.replaceState({}, '', '/admin')
        // Reload profile to show connected state
        const { data: refreshed } = await supabase
          .from('profiles')
          .select('full_name, topics, linkedin_access_token, linkedin_token_expires_at')
          .eq('id', user.id)
          .single()
        if (refreshed) setProfile(refreshed)
      }
      if (params.get('li_error')) {
        setLinkedInError(`LinkedIn connection failed: ${params.get('li_error')?.replace(/_/g, ' ')}`)
        window.history.replaceState({}, '', '/admin')
      }

      setLoading(false)
    }
    load()
  }, [])

  const toggleTopic = async (topic: string) => {
    const next = new Set(activeTopics)
    if (next.has(topic) && next.size === 1) return
    next.has(topic) ? next.delete(topic) : next.add(topic)
    setActiveTopics(next)

    setSavingTopics(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ topics: Array.from(next) }).eq('id', user.id)
    }
    setSavingTopics(false)
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    await fetch('/api/linkedin/disconnect', { method: 'POST' })
    setProfile(prev => prev ? { ...prev, linkedin_access_token: null, linkedin_token_expires_at: null } : null)
    setShowDisconnectConfirm(false)
    setDisconnecting(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/auth')
  }

  const linkedInConnected = !!profile?.linkedin_access_token &&
    (!profile.linkedin_token_expires_at || new Date(profile.linkedin_token_expires_at) > new Date())

  const tokenDaysLeft = profile?.linkedin_token_expires_at
    ? Math.ceil((new Date(profile.linkedin_token_expires_at).getTime() - Date.now()) / 86400000)
    : null

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--color-oxblood)',
  }

  const sectionDivider: React.CSSProperties = {
    borderTop: '1px solid var(--color-hairline)', paddingTop: 40, marginTop: 48,
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
        <Nav active="account" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', color: 'var(--color-ink-45)' }}>LOADING</span>
        </div>
      </main>
    )
  }

  const displayName = profile?.full_name || userEmail.split('@')[0]
  const initial = (displayName[0] ?? 'A').toUpperCase()

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
      <Nav active="account" />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px 72px' }}>
        <div style={{ width: '100%', maxWidth: 'var(--max-width-account)', padding: '64px 0' }}>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34,
            borderBottom: '1px solid var(--color-ink)', paddingBottom: 18, marginBottom: 0,
          }}>
            Account
          </h1>

          {/* Profile */}
          <div style={{ marginTop: 44 }}>
            <div style={sectionLabel}>Profile</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 20 }}>
              <div style={{
                width: 64, height: 64, background: 'var(--color-oxblood)', color: 'var(--color-paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-serif)', fontSize: 30,
              }} aria-hidden="true">
                {initial}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-ink)' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-45)', marginTop: 3 }}>
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Connected accounts */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Connected accounts</div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
              padding: '22px 24px', marginTop: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40, height: 40, background: 'var(--color-linkedin)', color: '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontFamily: 'var(--font-sans)', fontSize: 18,
                }}>
                  in
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink)' }}>LinkedIn</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{
                      width: 7, height: 7,
                      background: linkedInConnected ? 'var(--color-green)' : 'var(--color-ink-light)',
                      display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 12, color: 'var(--color-ink-45)' }}>
                      {linkedInConnected
                        ? `Connected${tokenDaysLeft !== null ? ` · token expires in ${tokenDaysLeft} days` : ''}`
                        : profile?.linkedin_access_token ? 'Token expired — reconnect' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>

              {linkedInConnected ? (
                <div>
                  {!showDisconnectConfirm ? (
                    <button
                      type="button" onClick={() => setShowDisconnectConfirm(true)}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                        color: 'var(--color-ink)', background: 'none',
                        border: '1px solid var(--color-ink)', padding: '0 18px', height: 44, cursor: 'pointer',
                      }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: 'var(--color-ink-45)' }}>This will remove Pulse's access to your LinkedIn account. Are you sure?</span>
                      <button
                        type="button" onClick={handleDisconnect} disabled={disconnecting}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                          color: 'var(--color-paper)', background: 'var(--color-oxblood)',
                          border: '1px solid var(--color-oxblood)', padding: '0 16px', height: 40, cursor: 'pointer',
                        }}
                      >
                        {disconnecting ? 'Removing…' : 'Yes, remove'}
                      </button>
                      <button
                        type="button" onClick={() => setShowDisconnectConfirm(false)}
                        style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--color-ink-45)', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button" onClick={() => { window.location.href = '/api/linkedin/auth' }}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                    color: '#FFFFFF', background: 'var(--color-linkedin)',
                    border: 'none', padding: '0 18px', height: 44, cursor: 'pointer',
                  }}
                >
                  {profile?.linkedin_access_token ? 'Reconnect' : 'Connect'}
                </button>
              )}
            </div>
            {linkedInError && (
              <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-oxblood)', marginTop: 12 }}>
                <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                {linkedInError}
              </p>
            )}
          </div>

          {/* Topic areas */}
          <div style={sectionDivider}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={sectionLabel}>Topic areas</div>
              {savingTopics && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--color-ink-45)' }}>
                  SAVING…
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-ink-45)', margin: '14px 0 18px', maxWidth: '54ch' }}>
              Edit your topic areas below. Questions are generated from news in these areas — changes take effect from the next set of questions.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ALL_TOPICS.map(topic => {
                const isActive = activeTopics.has(topic)
                const isLast   = isActive && activeTopics.size === 1
                return (
                  <button
                    key={topic} type="button"
                    onClick={() => toggleTopic(topic)}
                    disabled={isLast}
                    aria-pressed={isActive}
                    title={isLast ? 'At least one topic must be selected' : undefined}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '9px 15px',
                      background: isActive ? 'var(--color-ox-wash)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--color-ox-border)' : 'var(--color-hairline-3)'}`,
                      color: isActive ? 'var(--color-oxblood)' : 'var(--color-ink-45)',
                      cursor: isLast ? 'not-allowed' : 'pointer',
                      opacity: isLast ? 0.6 : 1,
                    }}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>
            {activeTopics.size === 1 && (
              <p style={{ fontSize: 13, color: 'var(--color-ink-45)', marginTop: 12, fontStyle: 'italic' }}>
                You need at least one topic.
              </p>
            )}
          </div>

          {/* Sign out */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 32, marginTop: 48 }}>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                color: 'var(--color-oxblood)', background: 'none',
                border: '1px solid var(--color-oxblood)', padding: '0 22px', height: 48,
                cursor: 'pointer', opacity: signingOut ? 0.6 : 1,
              }}
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
