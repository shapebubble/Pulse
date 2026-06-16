'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

interface Question {
  id: string
  text: string
  topic: string
  status: 'new' | 'draft' | 'done' | 'published' | 'skipped'
  answer?: string
  post?: string
  createdAt: string
}

type Format = 'question-led' | 'free-speaking'

const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'AI tools can now generate a finished UI in an afternoon. Does that make UX designers more valuable, or less?',
    topic: 'AI × Design',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    text: 'Most design systems are built for consistency. But consistency at scale can kill the moments of delight that make a product memorable. How do you balance the two?',
    topic: 'UX Craft',
    status: 'draft',
    answer: 'I think the answer is deliberate exception zones...',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    text: 'If you had to remove one phase from a typical UX process to ship faster, which would you cut — and what would you do to mitigate the risk?',
    topic: 'Process',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
]

function statusDot(status: Question['status'], isActive: boolean) {
  if (isActive) {
    return { width: 11, height: 11, background: 'var(--color-oxblood)', display: 'inline-block' as const }
  }
  if (status === 'draft')     return { width: 11, height: 11, background: 'var(--color-amber)', display: 'inline-block' as const }
  if (status === 'done')      return { width: 11, height: 11, background: 'var(--color-green)', display: 'inline-block' as const }
  if (status === 'published') return { width: 11, height: 11, background: 'var(--color-green)', display: 'inline-block' as const }
  return { width: 11, height: 11, border: '1px solid var(--color-hairline-3)', display: 'inline-block' as const }
}

export default function Home() {
  const [questions, setQuestions]   = useState<Question[]>(DEMO_QUESTIONS)
  const [index, setIndex]           = useState(0)
  const [answer, setAnswer]         = useState('')
  const [post, setPost]             = useState('')
  const [format, setFormat]         = useState<Format>('question-led')
  const [polishing, setPolishing]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting]       = useState(false)
  const [step, setStep]             = useState<'answer' | 'preview' | 'published'>('answer')
  const [saveLabel, setSaveLabel]   = useState('')
  const [postError, setPostError]   = useState('')

  const q = questions[index]

  useEffect(() => {
    setAnswer(q?.answer || '')
    setPost(q?.post || '')
    setStep('answer')
    setPostError('')
  }, [index])

  useEffect(() => {
    if (!answer) return
    const t = setTimeout(() => {
      setQuestions(prev => prev.map((item, i) =>
        i === index
          ? { ...item, answer, status: item.status === 'new' ? 'draft' : item.status }
          : item
      ))
      setSaveLabel('Saved · just now')
    }, 800)
    return () => clearTimeout(t)
  }, [answer, index])

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next  = useCallback(() => {
    if (index < questions.length - 1) {
      if (!answer && questions[index].status === 'new') {
        setQuestions(p => p.map((item, i) => i === index ? { ...item, status: 'skipped' } : item))
      }
      setIndex(i => i + 1)
    }
  }, [index, questions, answer])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  const polishAnswer = async () => {
    if (!answer.trim()) return
    setPolishing(true)
    try {
      const res  = await fetch('/api/polish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question: q.text }),
      })
      const data = await res.json()
      if (data.polished) setAnswer(data.polished)
    } catch { /* silently */ }
    setPolishing(false)
  }

  const generatePost = async () => {
    if (!answer.trim()) return
    setGenerating(true)
    try {
      const res  = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question: q.text, topic: q.topic, format }),
      })
      const data = await res.json()
      if (data.post) {
        setPost(data.post)
        setQuestions(prev => prev.map((item, i) =>
          i === index ? { ...item, post: data.post, status: 'done' } : item
        ))
        setStep('preview')
      }
    } catch { /* silently */ }
    setGenerating(false)
  }

  const postToLinkedIn = async () => {
    if (!post) return
    setPosting(true)
    setPostError('')
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post }),
      })
      if (res.ok) {
        setQuestions(prev => prev.map((item, i) =>
          i === index ? { ...item, status: 'published' } : item
        ))
        setStep('published')
      } else {
        setPostError('Failed to post — try again')
      }
    } catch {
      setPostError('Something went wrong — try again')
    }
    setPosting(false)
  }

  const charCount = post.length

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-paper)' }}>
      <Nav />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 64px' }}>
        <div style={{ width: '100%', maxWidth: 'var(--max-width-home)', padding: '84px 0 72px' }}>

          {step === 'answer' && (
            <>
              {/* Topic kicker */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.24em',
                textTransform: 'uppercase', color: 'var(--color-oxblood)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 6, height: 6, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                {q.topic}
              </div>

              {/* Question */}
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 56,
                lineHeight: 1.12, letterSpacing: '-0.012em', margin: '24px 0 0',
                color: 'var(--color-ink)', textWrap: 'balance',
              }}>
                {q.text}
              </h1>

              {/* Navigation row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                margin: '46px 0 0', paddingBottom: 18, borderBottom: '1px solid var(--color-hairline)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <button
                    type="button"
                    onClick={prev}
                    disabled={index === 0}
                    aria-label="Previous question"
                    style={{
                      width: 44, height: 44, border: '1px solid var(--color-hairline-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-ink-light)', background: 'none',
                      fontSize: 15, cursor: index === 0 ? 'not-allowed' : 'pointer',
                      opacity: index === 0 ? 0.4 : 1,
                    }}
                  >
                    ‹
                  </button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.12em', color: 'var(--color-ink)' }}>
                    {String(index + 1).padStart(2, '0')}{' '}
                    <span style={{ color: 'var(--color-disabled-text)' }}>/ {String(questions.length).padStart(2, '0')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={next}
                    disabled={index === questions.length - 1}
                    aria-label="Next question"
                    style={{
                      width: 44, height: 44, border: '1px solid var(--color-ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-ink)', background: 'none',
                      fontSize: 15, cursor: index === questions.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === questions.length - 1 ? 0.4 : 1,
                    }}
                  >
                    ›
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {questions.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`Question ${i + 1}: ${item.status}`}
                      aria-pressed={i === index}
                      onClick={() => setIndex(i)}
                      style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
                    >
                      <span style={statusDot(item.status, i === index)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer textarea */}
              <label htmlFor="answer" className="sr-only">Your answer</label>
              <textarea
                id="answer"
                value={answer}
                onChange={e => { setAnswer(e.target.value); setSaveLabel('') }}
                placeholder="Start with a gut reaction. One honest sentence is enough."
                style={{
                  display: 'block', width: '100%', marginTop: 32,
                  background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)',
                  padding: 26, minHeight: 200,
                  fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.6,
                  color: answer ? 'var(--color-ink)' : 'var(--color-ink-light)',
                }}
              />

              {/* Format selector + buttons */}
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
                  {saveLabel && <span style={{ color: 'var(--color-ink-light)', marginRight: 16 }}>{saveLabel}</span>}
                  <span style={{ color: 'var(--color-ink-45)', marginRight: 10 }}>Format</span>
                  <button
                    type="button"
                    onClick={() => setFormat('question-led')}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                      textTransform: 'uppercase', padding: '5px 10px',
                      border: '1px solid',
                      borderColor: format === 'question-led' ? 'var(--color-oxblood)' : 'var(--color-hairline-3)',
                      background: format === 'question-led' ? 'var(--color-ox-wash)' : 'none',
                      color: format === 'question-led' ? 'var(--color-oxblood)' : 'var(--color-ink-45)',
                    }}
                  >
                    Question-led
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('free-speaking')}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                      textTransform: 'uppercase', padding: '5px 10px',
                      border: '1px solid',
                      borderColor: format === 'free-speaking' ? 'var(--color-oxblood)' : 'var(--color-hairline-3)',
                      background: format === 'free-speaking' ? 'var(--color-ox-wash)' : 'none',
                      color: format === 'free-speaking' ? 'var(--color-oxblood)' : 'var(--color-ink-45)',
                    }}
                  >
                    Free-speaking
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={polishAnswer}
                    disabled={!answer.trim() || polishing}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-ink)', background: 'none',
                      border: '1px solid var(--color-ink)', padding: '0 22px', height: 48,
                      opacity: (!answer.trim() || polishing) ? 0.35 : 1,
                    }}
                  >
                    {polishing ? 'Polishing…' : 'Polish with AI ✦'}
                  </button>
                  <button
                    type="button"
                    onClick={generatePost}
                    disabled={!answer.trim() || generating}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-paper)', background: 'var(--color-oxblood)',
                      border: '1px solid var(--color-oxblood)', padding: '0 26px', height: 48,
                      opacity: (!answer.trim() || generating) ? 0.45 : 1,
                    }}
                  >
                    {generating ? 'Generating…' : 'Generate post →'}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'preview' && (
            <>
              {/* Preview header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: 20, borderBottom: '1px solid var(--color-hairline)',
                maxWidth: 'var(--max-width-preview)', margin: '0 auto',
              }}>
                <button
                  type="button"
                  onClick={() => { setStep('answer'); setQuestions(p => p.map((item, i) => i === index ? { ...item, status: 'draft' } : item)) }}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink)', background: 'none', border: 'none' }}
                >
                  ← Back
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-oxblood)' }}>
                  Post preview
                </span>
              </div>

              {/* Post textarea */}
              <div style={{ maxWidth: 'var(--max-width-preview)', margin: '34px auto 0' }}>
                <label htmlFor="post" className="sr-only">Generated post — edit before posting</label>
                <textarea
                  id="post"
                  value={post}
                  onChange={e => setPost(e.target.value)}
                  style={{
                    display: 'block', width: '100%',
                    background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)',
                    padding: 34, minHeight: 320,
                    fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.66,
                    color: 'var(--color-post-text)',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--color-ink-light)' }}>
                    {charCount} characters · edit freely before posting
                  </span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={generatePost}
                      disabled={generating}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                        color: 'var(--color-ink)', background: 'none',
                        border: '1px solid var(--color-ink)', padding: '0 22px', height: 48,
                        opacity: generating ? 0.4 : 1,
                      }}
                    >
                      {generating ? 'Regenerating…' : '↺ Regenerate'}
                    </button>
                    <button
                      type="button"
                      onClick={postToLinkedIn}
                      disabled={posting}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                        color: '#FFFFFF', background: 'var(--color-linkedin)',
                        border: '1px solid var(--color-linkedin)', padding: '0 26px', height: 48,
                        opacity: posting ? 0.6 : 1,
                      }}
                    >
                      {posting ? 'Posting…' : 'Post to LinkedIn →'}
                    </button>
                  </div>
                </div>

                {postError && (
                  <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-oxblood)', marginTop: 12 }}>
                    <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                    {postError}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 'published' && (
            <div style={{ maxWidth: 'var(--max-width-preview)', margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 24 }}>
                ✓ Posted to LinkedIn
              </div>
              <button
                type="button"
                onClick={() => { setStep('answer'); setIndex(i => Math.min(i + 1, questions.length - 1)) }}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                  color: 'var(--color-ink)', background: 'none',
                  border: '1px solid var(--color-ink)', padding: '0 26px', height: 48,
                }}
              >
                Back to questions
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
