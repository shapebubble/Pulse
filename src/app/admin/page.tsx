'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { createClient } from '@/lib/supabase-browser'

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
  const [allTopics, setAllTopics]               = useState<string[]>([])
  const [activeTopics, setActiveTopics]         = useState<Set<string>>(new Set())
  const [savingTopics, setSavingTopics]         = useState(false)
  const [disconnecting, setDisconnecting]       = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [signingOut, setSigningOut]             = useState(false)
  const [loading, setLoading]                   = useState(true)
  const [linkedInError, setLinkedInError]       = useState('')

  // Name editing (J-010/J-011)
  const [editingName, setEditingName]   = useState(false)
  const [nameInput, setNameInput]       = useState('')
  const [savingName, setSavingName]     = useState(false)
  const [nameError, setNameError]       = useState('')
  const [nameSaved, setNameSaved]       = useState(false)

  // Change password (J-023)
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [pwError, setPwError]       = useState('')
  const [pwSuccess, setPwSuccess]   = useState(false)

  // Change email (J-024)
  const [newEmail, setNewEmail]       = useState('')
  const [changingEmail, setChangingEmail] = useState(false)
  const [emailError, setEmailError]   = useState('')
  const [emailSuccess, setEmailSuccess] = useState(false)

  // Add new topic (J-004/J-007)
  const [newTopicInput, setNewTopicInput] = useState('')
  const [topicInputError, setTopicInputError] = useState('')

  // Export data (J-025)
  const [exporting, setExporting] = useState(false)

  // Delete account (J-022)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting]                   = useState(false)
  const [deleteError, setDeleteError]             = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? '')

      const [{ data }, { data: qRows }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, topics, linkedin_access_token, linkedin_token_expires_at')
          .eq('id', user.id)
          .single(),
        supabase.from('questions').select('topic'),
      ])

      // Build available topics from questions table, sorted alphabetically
      const topicsFromDb = Array.from(new Set((qRows ?? []).map((r: { topic: string }) => r.topic))).sort() as string[]
      setAllTopics(topicsFromDb)

      if (data) {
        setProfile(data)
        const saved: string[] = data.topics ?? []
        // Filter to only topics that exist in the questions table so size checks work correctly
        const validSaved = saved.filter(t => topicsFromDb.includes(t))
        setActiveTopics(new Set(validSaved.length > 0 ? validSaved : topicsFromDb))
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

  const addTopic = async () => {
    const topic = newTopicInput.trim()
    if (!topic) return
    if (allTopics.includes(topic) || activeTopics.has(topic)) {
      setTopicInputError('Topic already exists')
      return
    }
    setTopicInputError('')
    setNewTopicInput('')
    const next = new Set(activeTopics)
    next.add(topic)
    setActiveTopics(next)
    setAllTopics(prev => [...prev, topic].sort())
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

  const handleSaveName = async () => {
    if (!nameInput.trim()) { setNameError('Name cannot be empty'); return }
    setSavingName(true); setNameError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').update({ full_name: nameInput.trim() }).eq('id', user.id)
      if (!error) {
        setProfile(prev => prev ? { ...prev, full_name: nameInput.trim() } : prev)
        setEditingName(false)
        setNameSaved(true)
        setTimeout(() => setNameSaved(false), 3000)
      } else {
        setNameError('Failed to save — try again')
      }
    }
    setSavingName(false)
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (!newPw || newPw.length < 8) { setPwError('New password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    setChangingPw(true)
    const res = await fetch('/api/auth/update-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    if (res.ok) {
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 4000)
    } else {
      setPwError(data.error ?? 'Failed to change password')
    }
    setChangingPw(false)
  }

  const handleChangeEmail = async () => {
    setEmailError('')
    if (!newEmail || !newEmail.includes('@')) { setEmailError('Enter a valid email address'); return }
    setChangingEmail(true)
    const res = await fetch('/api/auth/update-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail }),
    })
    const data = await res.json()
    if (res.ok) {
      setNewEmail('')
      setEmailSuccess(true)
      setTimeout(() => setEmailSuccess(false), 6000)
    } else {
      setEmailError(data.error ?? 'Failed to change email')
    }
    setChangingEmail(false)
  }

  const handleExport = async () => {
    setExporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setExporting(false); return }
    const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id)
    const exportData = {
      exported_at: new Date().toISOString(),
      profile: { email: userEmail, full_name: profile?.full_name, topics: profile?.topics },
      posts: posts ?? [],
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `postyon-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
    setExporting(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { setDeleteError('Type DELETE to confirm'); return }
    setDeleting(true)
    const res = await fetch('/api/auth/delete-account', { method: 'POST' })
    if (res.ok) {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/')
    } else {
      setDeleteError('Failed to delete account — contact support')
      setDeleting(false)
    }
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1px solid var(--color-hairline-2)',
    background: 'var(--color-surface)',
    fontSize: 14, fontFamily: 'var(--font-sans)',
    outline: 'none', maxWidth: 360,
    boxSizing: 'border-box',
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
        <div className="account-inner" style={{ width: '100%', maxWidth: 'var(--max-width-account)', padding: '64px 0' }}>

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
                {editingName ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        style={{ ...inputStyle, maxWidth: 240, fontSize: 16 }}
                        autoFocus
                      />
                      <button
                        type="button" onClick={handleSaveName} disabled={savingName}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                          color: 'var(--color-paper)', background: 'var(--color-ink)',
                          border: '1px solid var(--color-ink)', padding: '0 16px', height: 40,
                          cursor: 'pointer', opacity: savingName ? 0.6 : 1,
                        }}
                      >
                        {savingName ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button" onClick={() => { setEditingName(false); setNameError('') }}
                        style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--color-ink-45)', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                    {nameError && (
                      <p style={{ fontSize: 13, color: 'var(--color-oxblood)', marginTop: 6 }}>{nameError}</p>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-ink)' }}>
                      {displayName}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setNameInput(displayName); setEditingName(true); setNameError('') }}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
                        color: 'var(--color-ink-45)', background: 'none',
                        border: '1px solid var(--color-hairline-2)', padding: '0 10px', height: 28,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    {nameSaved && (
                      <span style={{ fontSize: 12, color: 'var(--color-green)' }}>Saved</span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 14, color: 'var(--color-ink-45)', marginTop: 3 }}>
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Connected accounts */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Connected accounts</div>

            <div className="account-li-row" style={{
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
                <div className="account-li-actions">
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
                    <div className="account-li-confirm-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              {allTopics.length === 0 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-45)', letterSpacing: '0.1em' }}>
                  No topics yet — questions will appear here once added.
                </p>
              )}
              {allTopics.map(topic => {
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

            {/* J-004: Add new topic input */}
            <div style={{ display: 'flex', gap: 8, marginTop: 18, maxWidth: 360 }}>
              <input
                type="text"
                value={newTopicInput}
                onChange={e => { setNewTopicInput(e.target.value); setTopicInputError('') }}
                onKeyDown={e => e.key === 'Enter' && addTopic()}
                placeholder="Add a topic…"
                maxLength={60}
                style={{
                  flex: 1, height: 40, padding: '0 12px',
                  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
                  border: '1px solid var(--color-hairline-3)', background: 'var(--color-paper)',
                  color: 'var(--color-ink)', outline: 'none',
                }}
              />
              <button
                type="button" onClick={addTopic} disabled={!newTopicInput.trim() || savingTopics}
                style={{
                  height: 40, padding: '0 16px',
                  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
                  textTransform: 'uppercase', background: 'var(--color-ink)', color: 'var(--color-paper)',
                  border: 'none', cursor: newTopicInput.trim() ? 'pointer' : 'not-allowed',
                  opacity: newTopicInput.trim() ? 1 : 0.4,
                }}
              >
                Add
              </button>
            </div>
            {topicInputError && (
              <p role="alert" style={{ fontSize: 13, color: 'var(--color-oxblood)', margin: '6px 0 0' }}>
                {topicInputError}
              </p>
            )}
          </div>

          {/* Change password (J-023) */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Change password</div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-ink-45)', marginBottom: 6 }}>
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-ink-45)', marginBottom: 6 }}>
                  New password
                </label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-ink-45)', marginBottom: 6 }}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              {pwError && (
                <p role="alert" style={{ fontSize: 13, color: 'var(--color-oxblood)', margin: 0 }}>{pwError}</p>
              )}
              {pwSuccess && (
                <p style={{ fontSize: 13, color: 'var(--color-green)', margin: 0 }}>Password updated.</p>
              )}
              <div>
                <button
                  type="button" onClick={handleChangePassword} disabled={changingPw}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                    color: 'var(--color-paper)', background: 'var(--color-ink)',
                    border: '1px solid var(--color-ink)', padding: '0 22px', height: 44,
                    cursor: 'pointer', opacity: changingPw ? 0.6 : 1,
                  }}
                >
                  {changingPw ? 'Updating…' : 'Change password'}
                </button>
              </div>
            </div>
          </div>

          {/* Change email (J-024) */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Change email</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-ink-45)', margin: '14px 0 18px', maxWidth: '54ch' }}>
              A confirmation link will be sent to your new email address. Your email changes after you click the link.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-ink-45)', marginBottom: 6 }}>
                  New email address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChangeEmail()}
                  style={inputStyle}
                  autoComplete="email"
                  placeholder={userEmail}
                />
              </div>
              {emailError && <p role="alert" style={{ fontSize: 13, color: 'var(--color-oxblood)', margin: 0 }}>{emailError}</p>}
              {emailSuccess && <p style={{ fontSize: 13, color: 'var(--color-green)', margin: 0 }}>Confirmation sent — check your new inbox.</p>}
              <div>
                <button
                  type="button" onClick={handleChangeEmail} disabled={changingEmail}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                    color: 'var(--color-paper)', background: 'var(--color-ink)',
                    border: '1px solid var(--color-ink)', padding: '0 22px', height: 44,
                    cursor: 'pointer', opacity: changingEmail ? 0.6 : 1,
                  }}
                >
                  {changingEmail ? 'Sending…' : 'Send confirmation'}
                </button>
              </div>
            </div>
          </div>

          {/* Export data (J-025) */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Export data</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-ink-45)', margin: '14px 0 18px', maxWidth: '54ch' }}>
              Download a copy of your Postyon data including your posts and profile.
            </p>
            <button
              type="button" onClick={handleExport} disabled={exporting}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                color: 'var(--color-ink)', background: 'transparent',
                border: '1px solid var(--color-ink)', padding: '0 22px', height: 44,
                cursor: 'pointer', opacity: exporting ? 0.6 : 1,
              }}
            >
              {exporting ? 'Preparing…' : 'Export my data'}
            </button>
          </div>

          {/* Delete account (J-022) */}
          <div style={sectionDivider}>
            <div style={sectionLabel}>Delete account</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-ink-45)', margin: '14px 0 18px', maxWidth: '54ch' }}>
              This permanently deletes your account and all your data. This cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button
                type="button" onClick={() => { setShowDeleteConfirm(true); setDeleteError(''); setDeleteConfirmText('') }}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                  color: '#E8404A', background: 'transparent',
                  border: '1px solid #E8404A', padding: '0 22px', height: 44,
                  cursor: 'pointer',
                }}
              >
                Delete account
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--color-ink-45)', marginBottom: 6 }}>
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    style={inputStyle}
                    placeholder="DELETE"
                  />
                </div>
                {deleteError && (
                  <p role="alert" style={{ fontSize: 13, color: '#E8404A', margin: 0 }}>{deleteError}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button" onClick={handleDeleteAccount} disabled={deleting}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                      color: '#FFFFFF', background: '#E8404A',
                      border: '1px solid #E8404A', padding: '0 22px', height: 44,
                      cursor: 'pointer', opacity: deleting ? 0.6 : 1,
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Permanently delete'}
                  </button>
                  <button
                    type="button" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError('') }}
                    style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--color-ink-45)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
