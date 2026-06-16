'use client'

import { useState } from 'react'
import { Nav } from '@/components/Nav'

const ALL_TOPICS = ['AI × Design', 'UX Craft', 'Process', 'Product thinking', 'Career'] as const

export default function AdminPage() {
  const [linkedInConnected, setLinkedInConnected]   = useState(true)
  const [disconnecting, setDisconnecting]           = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [activeTopics, setActiveTopics]             = useState<Set<string>>(new Set(ALL_TOPICS))

  const toggleTopic = (topic: string) => {
    setActiveTopics(prev => {
      if (prev.has(topic) && prev.size === 1) return prev // at least one required
      const next = new Set(prev)
      next.has(topic) ? next.delete(topic) : next.add(topic)
      return next
    })
  }

  const handleConnect = () => { window.location.href = '/api/linkedin/auth' }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch('/api/linkedin/disconnect', { method: 'POST' })
      setLinkedInConnected(false)
      setShowDisconnectConfirm(false)
    } catch { /* silently */ }
    setDisconnecting(false)
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--color-oxblood)',
  }

  const sectionDivider: React.CSSProperties = {
    borderTop: '1px solid var(--color-hairline)', paddingTop: 40, marginTop: 48,
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
      <Nav active="account" />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px 72px' }}>
        <div style={{ width: '100%', maxWidth: 'var(--max-width-account)', padding: '64px 0' }}>

          {/* Page header */}
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
              }}
              aria-hidden="true">
                A
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-ink)' }}>Adam Sørensen</div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-45)', marginTop: 3 }}>
                  {'adam'}{'@'}{'thatsadam.dk'}
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
                      {linkedInConnected ? 'Connected · token expires in 52 days' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>

              {linkedInConnected ? (
                <div>
                  {!showDisconnectConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDisconnectConfirm(true)}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                        color: 'var(--color-ink)', background: 'none',
                        border: '1px solid var(--color-ink)', padding: '0 18px', height: 44,
                      }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: 'var(--color-ink-45)' }}>Remove access?</span>
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                          color: 'var(--color-paper)', background: 'var(--color-oxblood)',
                          border: '1px solid var(--color-oxblood)', padding: '0 16px', height: 40,
                        }}
                      >
                        {disconnecting ? 'Removing…' : 'Yes, remove'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDisconnectConfirm(false)}
                        style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--color-ink-45)', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnect}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                    color: '#FFFFFF', background: 'var(--color-linkedin)',
                    border: 'none', padding: '0 18px', height: 44,
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Topic areas */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Topic areas</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-ink-45)', margin: '14px 0 18px', maxWidth: '54ch' }}>
              Questions are generated from news in these areas — changes take effect from the next set of questions.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ALL_TOPICS.map(topic => {
                const isActive = activeTopics.has(topic)
                const isLast   = isActive && activeTopics.size === 1
                return (
                  <button
                    key={topic}
                    type="button"
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
          </div>

          {/* Sign out */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 32, marginTop: 48 }}>
            <button
              type="button"
              style={{
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                color: 'var(--color-oxblood)', background: 'none',
                border: '1px solid var(--color-oxblood)', padding: '0 22px', height: 48,
                cursor: 'pointer',
              }}
              onClick={() => {/* sign out via Supabase */}}
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
