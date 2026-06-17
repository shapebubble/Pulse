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
  const [items, setItems]       = useState<HistoryItem[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Join posts with questions
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

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
      <Nav active="history" />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px 72px' }}>
        <div style={{ width: '100%', maxWidth: 'var(--max-width-account)', padding: '64px 0' }}>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34,
            borderBottom: '1px solid var(--color-ink)', paddingBottom: 18, marginBottom: 0,
          }}>
            History
          </h1>

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

          <div style={{ marginTop: 32 }}>
            {items.map(item => {
              const isOpen = expanded === item.post_id
              return (
                <div key={item.post_id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.post_id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      width: '100%', padding: '24px 0', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', gap: 24,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
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
                    <div style={{
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
                      {item.generated_post ? (
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-ink-45)', marginBottom: 12 }}>
                            Generated post
                          </div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {item.generated_post}
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 28 }}>
                          <a href="/" style={{
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
