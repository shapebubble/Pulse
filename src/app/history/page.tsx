'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

type Status = 'new' | 'draft' | 'done' | 'published' | 'skipped'

interface HistoryItem {
  id: string
  topic: string
  question: string
  answer?: string
  post?: string
  status: Status
  date: string
}

const DEMO: HistoryItem[] = [
  {
    id: '4',
    topic: 'Hiring',
    question: "What's the first thing you actually look for in a senior design portfolio?",
    status: 'new',
    date: '11 Jun',
  },
  {
    id: '3',
    topic: 'Career & Craft',
    question: 'Is a portfolio still the right way to prove design judgment in 2026?',
    answer: 'I think it depends entirely on what the portfolio contains...',
    status: 'draft',
    date: '11 Jun',
  },
  {
    id: '2',
    topic: 'Design Systems',
    question: 'Should every team maintain its own components, or inherit one shared system?',
    answer: 'Shared system is the answer in theory. In practice it depends on team maturity.',
    post: 'Everyone wants a shared design system. Few teams are actually ready for one...',
    status: 'done',
    date: '12 Jun',
  },
  {
    id: '1',
    topic: 'AI × Design',
    question: 'AI tools can now generate a finished UI in an afternoon. Does that make UX designers more valuable, or less?',
    answer: "Honestly? More valuable. Generating screens was never the hard part — deciding what deserves to exist is.",
    post: "Everyone keeps asking whether AI makes designers obsolete. Wrong question.\n\nI watched a tool generate a full UI in an afternoon last week. It was fine. Competent. Completely average.\n\nThe value was never in producing the screens. It was in knowing which screens not to build.\n\nWe're not less valuable. We're finally free to do the part that was always the job.",
    status: 'published',
    date: '14 Jun',
  },
]

function StatusBadge({ status }: { status: Status }) {
  if (status === 'new') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      border: '1px solid var(--color-oxblood)', color: 'var(--color-oxblood)',
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '6px 12px',
    }}>
      <span style={{ width: 7, height: 7, background: 'var(--color-oxblood)', display: 'inline-block' }} />
      New
    </span>
  )

  if (status === 'draft') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      border: '1px solid var(--color-amber)', color: '#9A6A14',
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '6px 12px',
    }}>
      <span style={{
        display: 'inline-block', width: 16, height: 7,
        background: 'linear-gradient(90deg, var(--color-amber) 50%, var(--color-amber-light) 50%)',
      }} />
      Draft
    </span>
  )

  if (status === 'done') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      border: '1px solid var(--color-green)', color: 'var(--color-green)',
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '6px 12px',
    }}>
      ✓ Ready
    </span>
  )

  if (status === 'published') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      background: 'var(--color-green)', color: '#FFFFFF',
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '7px 13px',
    }}>
      ✓ Posted
    </span>
  )

  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'var(--color-ink-light)',
    }}>
      Skipped
    </span>
  )
}

export default function HistoryPage() {
  const [expanded, setExpanded] = useState<string | null>('1')

  const total   = DEMO.length
  const posted  = DEMO.filter(d => d.status === 'published').length

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
      <Nav active="history" />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px 72px' }}>
        <div style={{ width: '100%', maxWidth: 'var(--max-width-history)', padding: '64px 0' }}>

          {/* Page header */}
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-ink)', paddingBottom: 18,
          }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34, color: 'var(--color-ink)' }}>
              History
            </h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em', color: 'var(--color-ink-45)' }}>
              {total} questions · {posted} posted
            </span>
          </div>

          {/* List */}
          {DEMO.map(item => {
            const isOpen = expanded === item.id
            return (
              <div key={item.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                <div style={{ padding: '28px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-oxblood)' }}>
                        {item.topic}
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 23, lineHeight: 1.3, marginTop: 8, color: 'var(--color-ink)' }}>
                        {item.question}
                      </div>
                      {item.status === 'new' && !isOpen && (
                        <Link href="/" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--color-oxblood)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                          Answer this question →
                        </Link>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-light)' }}>
                        {item.date}
                      </span>
                      <StatusBadge status={item.status} />
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`detail-${item.id}`}
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        style={{ background: 'none', border: 'none', color: isOpen ? 'var(--color-ink-45)' : 'var(--color-ink-light)', fontSize: 13, cursor: 'pointer', width: 24, textAlign: 'center' }}
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded drawer */}
                  {isOpen && (item.answer || item.post || item.status === 'new') && (
                    <div
                      id={`detail-${item.id}`}
                      style={{
                        display: 'flex', gap: 32, marginTop: 24,
                        background: 'var(--color-surface-2)', border: '1px solid #E8E2D6', padding: 26,
                      }}
                    >
                      {item.status === 'new' ? (
                        <Link href="/" style={{ fontSize: 13, color: 'var(--color-oxblood)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                          Answer this question →
                        </Link>
                      ) : (
                        <>
                          {item.answer && (
                            <div style={{ flex: 1, borderRight: item.post ? '1px solid #E8E2D6' : 'none', paddingRight: item.post ? 32 : 0 }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-ink-light)', marginBottom: 12 }}>
                                Your answer
                              </div>
                              <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-ink-45)' }}>
                                {item.answer}
                              </div>
                            </div>
                          )}
                          {item.post && (
                            <div style={{ flex: 1.1 }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-ink-light)', marginBottom: 12 }}>
                                {item.status === 'published' ? 'Posted to LinkedIn' : 'Generated post'}
                              </div>
                              <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-post-text)' }}>
                                {item.post.split('\n\n')[0]}…
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </main>
  )
}
