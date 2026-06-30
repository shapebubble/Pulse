'use client'

import { useState, useEffect } from 'react'
import { Nav } from '@/components/Nav'
import { createClient } from '@/lib/supabase-browser'

type Status = 'new' | 'draft' | 'done' | 'published' | 'skipped'

interface HistoryItem {
  post_id: string
  question_id: string
  question_text: string
  topic: string
  week_start: string
  answer: string
  generated_post: string
  format: string
  status: Status
  created_at: string
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'published') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '4px 10px', background: 'var(--color-green)', color: '#fff',
    }}>
      <span style={{ fontSize: 10 }}>✓</span> Posted
    </span>
  )
  if (status === 'done') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '4px 10px', border: '1px solid var(--color-green)', color: 'var(--color-green)',
    }}>
      <span style={{ fontSize: 10 }}>✓</span> Ready
    </span>
  )
  if (status === 'draft') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '4px 10px', border: '1px solid var(--color-amber)', color: 'var(--color-amber)',
    }}>
      <span style={{ display: 'inline-block', width: 16, height: 7, background: 'linear-gradient(to right, var(--color-amber) 50%, transparent 50%)', border: '1px solid var(--color-amber)' }} />
      Draft
    </span>
  )
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '4px 10px', border: '1px solid var(--color-oxblood)', color: 'var(--color-oxblood)',
    }}>
      <span style={{ width: 7, height: 7, background: 'var(--color-oxblood)', display: 'inline-block' }} />
      New
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HistoryPage() {
  const supabase = createClient()
  const [items, setItems]             = useState<HistoryItem[]>([])
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [sortBy, setSortBy]           = useState<'date' | 'topic' | 'status'>('date')
  const [retrying, setRetrying]       = useState<string | null>(null)
  const [retryError, setRetryError]   = useState<Record<string, string>>({})
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id,
          question_id,
          answer,
          generated_post,
          format,
          status,
          created_at,
          questions (id, text, topic, week_start)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (posts) {
        const mapped: HistoryItem[] = posts.map((p: any) => ({
          post_id:        p.id,
          question_id:    p.question_id,
          question_text:  p.questions?.text ?? '',
          topic:          p.questions?.topic ?? '',
          week_start:     p.questions?.week_start ?? '',
          answer:         p.answer ?? '',
          generated_post: p.generated_post ?? '',
          format:         p.format ?? 'question-led',
          status:         p.status ?? 'new',
          created_at:     p.created_at,
        }))
        setItems(mapped)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleRetry = async (item: HistoryItem) => {
    setRetrying(item.post_id)
    setRetryError(prev => ({ ...prev, [item.post_id]: '' }))
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.generated_post }),
      })
      const data = await res.json()
      if (res.ok) {
        setItems(prev => prev.map(i =>
          i.post_id === item.post_id ? { ...i, status: 'published' } : i
        ))
      } else if (res.status === 403 && data.error?.includes('expired')) {
        setRetryError(prev => ({ ...prev, [item.post_id]: 'LinkedIn connection expired — reconnect in Account' }))
      } else {
        setRetryError(prev => ({ ...prev, [item.post_id]: 'Failed to post — try again' }))
      }
    } catch {
      setRetryError(prev => ({ ...prev, [item.post_id]: 'Something went wrong — try again' }))
    }
    setRetrying(null)
  }

  // Derived filtered + sorted list
  const displayed = items
    .filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return item.question_text.toLowerCase().includes(q) || item.topic.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'topic')  return a.topic.localeCompare(b.topic)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const isFiltering = displayed.length !== items.length

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
      <Nav active="history" />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px 72px' }}>
        <div className="history-inner" style={{ width: '100%', maxWidth: 'var(--max-width-account)', padding: '64px 0' }}>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34,
            borderBottom: '1px solid var(--color-ink)', paddingBottom: 18, marginBottom: 0,
          }}>
            History
          </h1>

          {/* Summary stats row (I-006) */}
          {!loading && items.length > 0 && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
              color: 'var(--color-ink-45)', textTransform: 'uppercase', marginTop: 20, marginBottom: 0,
            }}>
              {items.length} post{items.length !== 1 ? 's' : ''}&nbsp;&nbsp;·&nbsp;&nbsp;
              {items.filter(i => i.status === 'published').length} published&nbsp;&nbsp;·&nbsp;&nbsp;
              {items.filter(i => i.status === 'draft').length} draft{items.filter(i => i.status === 'draft').length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Toolbar: search + filter + sort (I-010, I-011, I-012) */}
          {!loading && items.length > 0 && (
            <div className="history-toolbar" style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search questions…"
                style={{
                  flex: 1, minWidth: 200,
                  padding: '11px 14px',
                  border: `1px solid ${searchFocused ? 'var(--color-oxblood)' : 'var(--color-hairline-2)'}`,
                  background: 'var(--color-surface)',
                  fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: 'var(--color-ink)',
                  outline: 'none',
                  borderRadius: 0,
                }}
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as Status | 'all')}
                style={{
                  width: 180,
                  padding: '11px 14px',
                  border: '1px solid var(--color-hairline-2)',
                  background: 'var(--color-surface)',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                }}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="done">Ready</option>
                <option value="draft">Draft</option>
                <option value="new">New</option>
                <option value="skipped">Skipped</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'topic' | 'status')}
                style={{
                  width: 180,
                  padding: '11px 14px',
                  border: '1px solid var(--color-hairline-2)',
                  background: 'var(--color-surface)',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                }}
              >
                <option value="date">Date (newest)</option>
                <option value="topic">Topic</option>
                <option value="status">Status</option>
              </select>
            </div>
          )}

          {/* Results count when filtering is active (I-009) */}
          {!loading && isFiltering && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
              color: 'var(--color-ink-45)', textTransform: 'uppercase', marginTop: 14, marginBottom: 0,
            }}>
              Showing {displayed.length} of {items.length}
            </p>
          )}

          {loading && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', color: 'var(--color-ink-45)', marginTop: 48 }}>
              LOADING
            </p>
          )}

          {!loading && items.length === 0 && (
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--color-ink-45)', marginTop: 48 }}>
              No posts yet — answer your first question on the home screen.
            </p>
          )}

          {/* Empty search/filter state */}
          {!loading && items.length > 0 && displayed.length === 0 && (
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--color-ink-45)', marginTop: 48 }}>
              No posts match your search.
            </p>
          )}

          <div style={{ marginTop: 32 }}>
            {displayed.map(item => {
              const isOpen = expanded === item.post_id
              const canRetry = item.status !== 'published' && item.status !== 'new' && item.status !== 'skipped' && !!item.generated_post
              return (
                <div key={item.post_id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.post_id)}
                    aria-expanded={isOpen}
                    style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      width: '100%', padding: '24px 0', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', gap: 24,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="history-item-meta" style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
                        textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 8,
                        display: 'flex', alignItems: 'center', gap: 16,
                      }}>
                        {item.topic}
                        <span style={{ color: 'var(--color-ink-45)' }}>{formatDate(item.created_at)}</span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--color-ink)',
                        lineHeight: 1.4, margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.question_text}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                      <StatusBadge status={item.status} />
                      <span style={{ color: 'var(--color-ink-45)', fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        ↓
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="history-expanded-grid" style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
                      background: 'var(--color-surface)',
                      marginBottom: 0, padding: '24px 28px 28px',
                    }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-ink-45)', marginBottom: 12 }}>
                          Your answer
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink)', margin: 0 }}>
                          {item.answer || <span style={{ color: 'var(--color-ink-45)', fontStyle: 'italic' }}>No answer recorded</span>}
                        </p>
                      </div>
                      {(item.status !== 'new' && item.status !== 'skipped') ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-ink-45)' }}>
                              Generated post
                            </div>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(item.generated_post)}
                              style={{ background: 'none', border: '1px solid var(--color-hairline-3)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-45)', padding: '3px 8px', cursor: 'pointer' }}
                            >
                              Copy
                            </button>
                          </div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {item.generated_post}
                          </p>

                          {/* Retry / Post to LinkedIn button (I-014) */}
                          {canRetry && (
                            <div style={{ marginTop: 20 }}>
                              <button
                                type="button"
                                disabled={retrying === item.post_id}
                                onClick={e => { e.stopPropagation(); handleRetry(item) }}
                                style={{
                                  height: 40, padding: '0 20px',
                                  background: retrying === item.post_id ? 'var(--color-ink-45)' : 'var(--color-oxblood)',
                                  color: '#fff',
                                  border: 'none',
                                  fontFamily: 'var(--font-sans)', fontSize: 14,
                                  cursor: retrying === item.post_id ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex', alignItems: 'center',
                                }}
                              >
                                {retrying === item.post_id ? 'Posting…' : 'Post to LinkedIn'}
                              </button>
                              {retryError[item.post_id] && (
                                <p style={{
                                  fontFamily: 'var(--font-sans)', fontSize: 13,
                                  color: 'var(--color-coral, #E8404A)',
                                  marginTop: 10, marginBottom: 0,
                                }}>
                                  {retryError[item.post_id]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 28 }}>
                          <a href={`/?question=${item.question_id}`} style={{
                            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-oxblood)',
                            border: '1px solid var(--color-oxblood)', padding: '0 18px', height: 40,
                            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                          }}>
                            Answer this question →
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </main>
  )
}
