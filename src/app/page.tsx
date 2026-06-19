'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Nav } from '@/components/Nav'
import { createClient } from '@/lib/supabase-browser'

interface Question {
  id: string
  text: string
  topic: string
  week_start: string
}

interface Post {
  id?: string
  question_id: string
  answer: string
  generated_post: string
  format: string
  status: 'new' | 'draft' | 'done' | 'published' | 'skipped'
  linkedin_post_id?: string
}

type Format = 'question-led' | 'free-speaking'

function statusDot(status: Post['status'], isActive: boolean) {
  const base = { width: 11, height: 11, display: 'inline-block' as const }
  if (isActive)                return { ...base, background: 'var(--color-oxblood)' }
  if (status === 'draft')      return { ...base, background: 'var(--color-amber)' }
  if (status === 'done')       return { ...base, background: 'var(--color-green)' }
  if (status === 'published')  return { ...base, background: 'var(--color-green)' }
  return { ...base, border: '1px solid var(--color-hairline-3)' }
}

export default function Home() {
  const supabase = createClient()

  const [questions, setQuestions] = useState<Question[]>([])
  const [posts, setPosts]         = useState<Map<string, Post>>(new Map())
  const [index, setIndex]         = useState(0)
  const [answer, setAnswer]       = useState('')
  const [generatedPost, setGeneratedPost] = useState('')
  const [format, setFormat]       = useState<Format>('question-led')
  const [polishing, setPolishing]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting]       = useState(false)
  const [step, setStep]           = useState<'answer' | 'preview' | 'published'>('answer')
  const [postError, setPostError] = useState('')
  const [polishError, setPolishError] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [publishedReady, setPublishedReady] = useState(false)
  const [regenPending, setRegenPending] = useState(false)

  // Keep a ref to the latest answer so nav handlers can flush before index change
  const answerRef = useRef(answer)
  answerRef.current = answer

  const q    = questions[index]
  const post = q ? (posts.get(q.id) ?? { question_id: q.id, answer: '', generated_post: '', format: 'question-led', status: 'new' as const }) : null

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const [{ data: qs }, { data: ps }, { data: profile }] = await Promise.all([
        supabase.from('questions').select('*').order('created_at', { ascending: false }),
        supabase.from('posts').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('linkedin_access_token, linkedin_token_expires_at, topics').eq('id', user.id).single(),
      ])

      // Build posts map first (needed for initial index calculation)
      const map = new Map<string, Post>()
      if (ps) ps.forEach(p => map.set(p.question_id, p))
      setPosts(map)

      // Filter questions by user's selected topics
      const selectedTopics: string[] = profile?.topics ?? []
      const allQs = qs ?? []
      const filtered = selectedTopics.length > 0
        ? allQs.filter(q => selectedTopics.includes(q.topic))
        : allQs
      const questionsToShow = filtered.length > 0 ? filtered : allQs
      setQuestions(questionsToShow)

      // Set initial index: URL param → first unanswered → newest (index 0)
      const urlParams = new URLSearchParams(window.location.search)
      const questionId = urlParams.get('question')
      let initialIndex = 0

      if (questionId) {
        const paramIdx = questionsToShow.findIndex(q => q.id === questionId)
        if (paramIdx >= 0) {
          initialIndex = paramIdx
          window.history.replaceState({}, '', '/')
        }
      } else {
        const firstUnanswered = questionsToShow.findIndex(q => {
          const p = map.get(q.id)
          return !p || p.status === 'new' || p.status === 'skipped'
        })
        // If all answered, snap to newest (index 0, since sorted descending)
        initialIndex = firstUnanswered >= 0 ? firstUnanswered : 0
      }
      setIndex(initialIndex)

      if (profile?.linkedin_access_token) {
        const expired = profile.linkedin_token_expires_at && new Date(profile.linkedin_token_expires_at) < new Date()
        setLinkedInConnected(!expired)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Restore answer + step when index changes
  useEffect(() => {
    if (!post) return
    setAnswer(post.answer || '')
    setGeneratedPost(post.generated_post || '')
    setStep(post.status === 'done' && post.generated_post ? 'preview' : 'answer')
    setPostError('')
    setGenerateError('')
    setPolishError('')
    setRegenPending(false)
  }, [index, questions])

  const savePost = useCallback(async (fields: Partial<Post> & { question_id: string }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !fields.question_id) return

    const { data } = await supabase
      .from('posts')
      .upsert({ user_id: user.id, ...fields }, { onConflict: 'user_id,question_id' })
      .select()
      .single()

    if (data) {
      setPosts(prev => new Map(prev).set(data.question_id, data))
    }
  }, [])

  // Autosave 800ms after typing stops (silent — no indicator)
  useEffect(() => {
    if (!answer || !q) return
    const newStatus = post?.status === 'new' || !post?.status ? 'draft' : post.status
    const t = setTimeout(() => {
      savePost({ question_id: q.id, answer, status: newStatus as Post['status'] })
    }, 800)
    return () => clearTimeout(t)
  }, [answer])

  const prev = useCallback(() => {
    // Flush any pending save before navigating away
    if (answerRef.current.trim() && q) {
      const s = post?.status === 'new' || !post?.status ? 'draft' : post.status
      savePost({ question_id: q.id, answer: answerRef.current, status: s as Post['status'] })
    }
    setIndex(i => Math.max(0, i - 1))
  }, [q, post, savePost])

  const next = useCallback(() => {
    if (!q) return
    // Flush any pending save before navigating away
    if (answerRef.current.trim()) {
      const s = post?.status === 'new' || !post?.status ? 'draft' : post.status
      savePost({ question_id: q.id, answer: answerRef.current, status: s as Post['status'] })
    } else if (!answerRef.current && post?.status === 'new') {
      savePost({ question_id: q.id, answer: '', status: 'skipped' })
    }
    if (index < questions.length - 1) setIndex(i => i + 1)
  }, [index, questions, post, q, savePost])

  // Jump to a specific question by index, flushing pending save first
  const jumpToQuestion = useCallback((i: number) => {
    if (answerRef.current.trim() && q) {
      const s = post?.status === 'new' || !post?.status ? 'draft' : post.status
      savePost({ question_id: q.id, answer: answerRef.current, status: s as Post['status'] })
    }
    setIndex(i)
  }, [q, post, savePost])

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
    if (!answer.trim() || !q) return
    setPolishing(true)
    setPolishError('')
    try {
      const res  = await fetch('/api/polish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question: q.text }),
      })
      const data = await res.json()
      if (data.polished) {
        setAnswer(data.polished)
        // Save immediately so polish isn't lost on fast navigation
        const s = post?.status === 'new' || !post?.status ? 'draft' : (post?.status ?? 'draft')
        await savePost({ question_id: q.id, answer: data.polished, status: s as Post['status'] })
      } else {
        setPolishError('Polish failed — try again')
      }
    } catch {
      setPolishError('Something went wrong — try again')
    }
    setPolishing(false)
  }

  const previewPost = () => {
    if (!answer.trim() || !q) return
    const draft = `${q.text}\n\n${answer}`
    setGeneratedPost(draft)
    savePost({ question_id: q.id, answer, generated_post: draft, format, status: 'done' })
    setStep('preview')
  }

  const elaboratePost = async () => {
    if (!answer.trim() || !q) return
    setGenerating(true)
    setGenerateError('')
    try {
      const res  = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question: q.text, topic: q.topic, format }),
      })
      const data = await res.json()
      if (data.post) {
        setGeneratedPost(data.post)
        await savePost({ question_id: q.id, answer, generated_post: data.post, format, status: 'done' })
        setStep('preview')
      } else {
        setGenerateError('Elaboration failed — try again')
      }
    } catch {
      setGenerateError('Something went wrong — try again')
    }
    setGenerating(false)
  }

  const postToLinkedIn = async () => {
    if (!generatedPost || !q) return
    setPosting(true)
    setPostError('')
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedPost }),
      })
      const data = await res.json()
      if (res.ok) {
        await savePost({ question_id: q.id, status: 'published', linkedin_post_id: data.postId })
        setStep('published')
        setPublishedReady(false)
        setTimeout(() => setPublishedReady(true), 3000)
      } else if (res.status === 403 && data.error?.includes('expired')) {
        setPostError('LinkedIn connection expired — reconnect in Account')
      } else {
        setPostError('Failed to post — try again')
      }
    } catch {
      setPostError('Something went wrong — try again')
    }
    setPosting(false)
  }

  const charCount = generatedPost.length

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', color: 'var(--color-ink-45)' }}>
            LOADING
          </span>
        </div>
      </main>
    )
  }

  if (!q) {
    return (
      <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--color-ink-45)', textAlign: 'center', maxWidth: '40ch' }}>
            No questions for this week yet — check back soon.
          </p>
        </div>
      </main>
    )
  }

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
                    type="button" onClick={prev} disabled={index === 0} aria-label="Previous question"
                    style={{
                      width: 44, height: 44, border: '1px solid var(--color-hairline-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-ink-light)', background: 'none', fontSize: 15,
                      cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.4 : 1,
                    }}
                  >‹</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.12em', color: 'var(--color-ink)' }}>
                    {String(index + 1).padStart(2, '0')}{' '}
                    <span style={{ color: 'var(--color-disabled-text)' }}>/ {String(questions.length).padStart(2, '0')}</span>
                  </span>
                  <button
                    type="button" onClick={next} disabled={index === questions.length - 1} aria-label="Next question"
                    style={{
                      width: 44, height: 44, border: '1px solid var(--color-ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-ink)', background: 'none', fontSize: 15,
                      cursor: index === questions.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === questions.length - 1 ? 0.4 : 1,
                    }}
                  >›</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {questions.map((item, i) => {
                    const p = posts.get(item.id)
                    const s = p?.status ?? 'new'
                    return (
                      <button
                        key={item.id} type="button"
                        aria-label={`Question ${i + 1}: ${s}`}
                        aria-pressed={i === index}
                        onClick={() => jumpToQuestion(i)}
                        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
                      >
                        <span style={statusDot(s as Post['status'], i === index)} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Answer textarea — readOnly during AI polish */}
              <label htmlFor="answer" className="sr-only">Your answer</label>
              <textarea
                id="answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                readOnly={polishing}
                placeholder="Start with a gut reaction. One honest sentence is enough."
                style={{
                  display: 'block', width: '100%', marginTop: 32,
                  background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)',
                  padding: 26, minHeight: 200,
                  fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.6,
                  color: answer ? 'var(--color-ink)' : 'var(--color-ink-light)',
                  opacity: polishing ? 0.7 : 1,
                }}
              />

              {/* Format selector + action buttons */}
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
                  <span style={{ color: 'var(--color-ink-45)', marginRight: 10 }}>Format</span>
                  {(['question-led', 'free-speaking'] as Format[]).map(f => (
                    <button
                      key={f} type="button" onClick={() => setFormat(f)}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                        textTransform: 'uppercase', padding: '5px 10px', border: '1px solid',
                        borderColor: format === f ? 'var(--color-oxblood)' : 'var(--color-hairline-3)',
                        background:  format === f ? 'var(--color-ox-wash)' : 'none',
                        color:       format === f ? 'var(--color-oxblood)' : 'var(--color-ink-45)',
                      }}
                    >
                      {f === 'question-led' ? 'Question-led' : 'Free-speaking'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button" onClick={polishAnswer}
                    disabled={!answer.trim() || polishing || generating}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-ink)', background: 'none',
                      border: '1px solid var(--color-ink)', padding: '0 22px', height: 48,
                      opacity: (!answer.trim() || polishing || generating) ? 0.35 : 1,
                    }}
                  >
                    {polishing ? 'Polishing…' : 'Polish with AI ✦'}
                  </button>
                  <button
                    type="button" onClick={elaboratePost}
                    disabled={!answer.trim() || generating || polishing}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-ink)', background: 'none',
                      border: '1px solid var(--color-ink)', padding: '0 22px', height: 48,
                      opacity: (!answer.trim() || generating || polishing) ? 0.35 : 1,
                    }}
                  >
                    {generating ? 'Elaborating…' : 'Elaborate with AI ✦'}
                  </button>
                  <button
                    type="button" onClick={previewPost}
                    disabled={!answer.trim() || polishing || generating}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-paper)', background: 'var(--color-oxblood)',
                      border: '1px solid var(--color-oxblood)', padding: '0 26px', height: 48,
                      opacity: (!answer.trim() || polishing || generating) ? 0.45 : 1,
                    }}
                  >
                    Preview →
                  </button>
                </div>
              </div>

              {polishError && (
                <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--color-oxblood)', marginTop: 10 }}>
                  <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                  {polishError}
                </p>
              )}
            </>
          )}

          {step === 'preview' && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: 20, borderBottom: '1px solid var(--color-hairline)',
                maxWidth: 'var(--max-width-preview)', margin: '0 auto',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedPost('')
                    setStep('answer')
                    setRegenPending(false)
                    if (q) savePost({ question_id: q.id, answer, generated_post: '', format, status: 'draft' })
                  }}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Back
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-oxblood)' }}>
                  Post preview
                </span>
              </div>

              <div style={{ maxWidth: 'var(--max-width-preview)', margin: '34px auto 0' }}>
                <label htmlFor="post" className="sr-only">Your post — edit before posting</label>
                <textarea
                  id="post"
                  value={generatedPost}
                  onChange={e => setGeneratedPost(e.target.value)}
                  readOnly={generating}
                  style={{
                    display: 'block', width: '100%',
                    background: 'var(--color-surface)', border: '1px solid var(--color-hairline-2)',
                    padding: 34, minHeight: 320,
                    fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.66,
                    color: 'var(--color-post-text)',
                    opacity: generating ? 0.7 : 1,
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--color-ink-light)' }}>
                    {charCount} characters · edit freely before posting
                  </span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {linkedInConnected ? (
                      <button
                        type="button" onClick={postToLinkedIn} disabled={posting}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                          color: '#FFFFFF', background: 'var(--color-linkedin)',
                          border: '1px solid var(--color-linkedin)', padding: '0 26px', height: 48,
                          opacity: posting ? 0.6 : 1,
                        }}
                      >
                        {posting ? 'Posting…' : 'Post to LinkedIn →'}
                      </button>
                    ) : (
                      <a
                        href="/admin"
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                          color: 'var(--color-ink-45)', border: '1px solid var(--color-hairline-3)',
                          padding: '0 20px', height: 48, display: 'flex', alignItems: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        Connect LinkedIn in Account settings →
                      </a>
                    )}
                  </div>
                </div>

                {(postError || generateError) && (
                  <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-oxblood)', marginTop: 12 }}>
                    <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                    {postError || generateError}
                    {postError.includes('expired') && (
                      <a href="/admin" style={{ color: 'var(--color-oxblood)', marginLeft: 4 }}>→ Account</a>
                    )}
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
              {publishedReady && (
                <button
                  type="button"
                  onClick={() => { setStep('answer'); setIndex(i => Math.min(i + 1, questions.length - 1)) }}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                    color: 'var(--color-ink)', background: 'none',
                    border: '1px solid var(--color-ink)', padding: '0 26px', height: 48, cursor: 'pointer',
                  }}
                >
                  Back to questions
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
