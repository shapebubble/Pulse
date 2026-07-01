'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Nav } from '@/components/Nav'
import { LandingPage } from '@/components/LandingPage'
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
  status: 'new' | 'draft' | 'done' | 'published' | 'skipped' | 'failed'
  linkedin_post_id?: string
}

type Format = 'question-led' | 'free-speaking'

function toBold(text: string): string {
  return [...text].map(char => {
    const code = char.codePointAt(0)!
    if (code >= 65 && code <= 90)  return String.fromCodePoint(code - 65 + 0x1D5D4) // A-Z
    if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D5EE) // a-z
    if (code >= 48 && code <= 57)  return String.fromCodePoint(code - 48 + 0x1D7EC) // 0-9
    return char
  }).join('')
}

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
  const [loading, setLoading]         = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [publishedReady, setPublishedReady] = useState(false)
  const [regenPending, setRegenPending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState('')
  const [showCustomQ, setShowCustomQ] = useState(false)
  const [customQText, setCustomQText] = useState('')
  const [customQuestion, setCustomQuestion] = useState<Question | null>(null)

  // Image builder state
  const [addImage, setAddImage]         = useState(false)
  const [imgFont, setImgFont]           = useState<'serif' | 'sans' | 'mono'>('serif')
  const [imgColor1, setImgColor1]       = useState('#1F28A8')
  const [imgColor2, setImgColor2]       = useState('#E8404A')
  const [imgAngle, setImgAngle]         = useState(135)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Keep a ref to the latest answer so nav handlers can flush before index change
  const answerRef = useRef(answer)
  answerRef.current = answer

  const q    = questions[index]
  const post = q ? (posts.get(q.id) ?? { question_id: q.id, answer: '', generated_post: '', format: 'question-led', status: 'new' as const }) : null
  const activeQuestion = customQuestion ?? q

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setAuthenticated(true)

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

      // Set initial index: URL param â†’ first unanswered â†’ newest (index 0)
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

  // Autosave 800ms after typing stops (silent â€" no indicator)
  useEffect(() => {
    if (!answer || !q || customQuestion) return
    const newStatus = post?.status === 'new' || !post?.status ? 'draft' : post.status
    const t = setTimeout(() => {
      savePost({ question_id: q.id, answer, status: newStatus as Post['status'] })
    }, 800)
    return () => clearTimeout(t)
  }, [answer, customQuestion])

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

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !activeQuestion) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 1200, H = 628
    canvas.width = W; canvas.height = H

    // Gradient background
    const angle = (imgAngle * Math.PI) / 180
    const grd = ctx.createLinearGradient(
      W / 2 - Math.cos(angle) * W / 2, H / 2 - Math.sin(angle) * H / 2,
      W / 2 + Math.cos(angle) * W / 2, H / 2 + Math.sin(angle) * H / 2,
    )
    grd.addColorStop(0, imgColor1)
    grd.addColorStop(1, imgColor2)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)

    // Question text
    const fontMap = { serif: 'Georgia', sans: 'Arial', mono: 'Courier New' }
    const fontFace = fontMap[imgFont]
    const padding = 80
    const maxWidth = W - padding * 2
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'

    // Word wrap
    const words = (activeQuestion ?? q)!.text.split(' ')
    let fontSize = 72
    let lines: string[] = []

    const wrap = (fs: number) => {
      ctx.font = `300 ${fs}px ${fontFace}`
      lines = []
      let line = ''
      for (const word of words) {
        const test = line ? line + ' ' + word : word
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line); line = word
        } else { line = test }
      }
      if (line) lines.push(line)
    }

    wrap(fontSize)
    while (lines.length > 4 && fontSize > 32) { fontSize -= 4; wrap(fontSize) }

    const lineH = fontSize * 1.3
    const totalH = lines.length * lineH
    let y = (H - totalH) / 2 + fontSize

    ctx.font = `300 ${fontSize}px ${fontFace}`
    for (const line of lines) {
      ctx.fillText(line, padding, y)
      y += lineH
    }

    // Postyon logo text bottom-right
    ctx.font = `500 20px Arial`
    ctx.textAlign = 'right'
    ctx.globalAlpha = 0.5
    ctx.fillText('POSTYON', W - padding, H - padding + 20)
    ctx.globalAlpha = 1

    setImageDataUrl(canvas.toDataURL('image/jpeg', 0.92))
  }, [imgFont, imgColor1, imgColor2, imgAngle, activeQuestion, q])

  // Regenerate whenever image options change and addImage is true
  useEffect(() => {
    if (addImage) generateImage()
  }, [addImage, generateImage])

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
      const aq = activeQuestion ?? q
      const res  = await fetch('/api/polish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question: aq.text }),
      })
      const data = await res.json()
      if (data.polished) {
        setAnswer(data.polished)
        // Save immediately so polish isn't lost on fast navigation
        if (aq.id !== 'custom') {
          const s = post?.status === 'new' || !post?.status ? 'draft' : (post?.status ?? 'draft')
          await savePost({ question_id: q.id, answer: data.polished, status: s as Post['status'] })
        }
      } else {
        setPolishError('Polish failed â€" try again')
      }
    } catch {
      setPolishError('Something went wrong â€" try again')
    }
    setPolishing(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshError('')
    try {
      const res = await fetch('/api/questions/refresh', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        setRefreshError('Could not generate new questions â€" try again later')
      }
    } catch {
      setRefreshError('Something went wrong â€" try again')
    }
    setRefreshing(false)
  }

  const previewPost = () => {
    if (!answer.trim() || !q) return
    const aq = activeQuestion ?? q
    const draft = `${toBold(aq.text)}\n\n${answer}`
    setGeneratedPost(draft)
    if (aq.id !== 'custom') {
      savePost({ question_id: q.id, answer, generated_post: draft, format, status: 'done' })
    }
    setStep('preview')
  }

  const elaboratePost = async () => {
    if (!answer.trim() || !q) return
    setGenerating(true)
    setGenerateError('')
    try {
      const aq = activeQuestion ?? q
      const res  = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question: aq.text, topic: aq.topic, format }),
      })
      const data = await res.json()
      if (data.post) {
        setGeneratedPost(data.post)
        if (aq.id !== 'custom') {
          await savePost({ question_id: q.id, answer, generated_post: data.post, format, status: 'done' })
        }
        setStep('preview')
      } else {
        setGenerateError('Elaboration failed â€" try again')
      }
    } catch {
      setGenerateError('Something went wrong â€" try again')
    }
    setGenerating(false)
  }

  const postToLinkedIn = async () => {
    if (!generatedPost || !q) return
    setPosting(true)
    setPostError('')
    try {
      let mediaUrn: string | undefined

      // If image is attached, upload it first
      if (addImage && imageDataUrl) {
        const uploadRes = await fetch('/api/linkedin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUrl }),
        })
        const uploadData = await uploadRes.json()
        if (uploadRes.ok && uploadData.mediaUrn) {
          mediaUrn = uploadData.mediaUrn
        } else {
          setPostError('Image upload failed â€" post without image or try again')
          setPosting(false)
          return
        }
      }

      const res = await fetch('/api/linkedin/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedPost, mediaUrn }),
      })
      const data = await res.json()
      if (res.ok) {
        await savePost({ question_id: q.id, status: 'published', linkedin_post_id: data.postId })
        setStep('published')
        setPublishedReady(false)
        setTimeout(() => setPublishedReady(true), 3000)
      } else if (res.status === 403 && data.error?.includes('expired')) {
        setPostError('LinkedIn connection expired â€" reconnect in Account')
      } else {
        setPostError('Failed to post â€" try again')
        await savePost({ question_id: q.id, answer, generated_post: generatedPost, format, status: 'failed' })
      }
    } catch {
      setPostError('Something went wrong â€" try again')
      await savePost({ question_id: q.id, answer, generated_post: generatedPost, format, status: 'failed' })
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

  if (!authenticated) {
    return <LandingPage />
  }

  if (!q) {
    return (
      <main style={{ minHeight: '100dvh', background: 'var(--color-paper)', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--color-ink-45)', textAlign: 'center', maxWidth: '40ch' }}>
            No questions for this week yet â€" check back soon.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-paper)' }}>
      <Nav />

      <div className="home-outer" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 64px' }}>
        <div className="home-inner" style={{ width: '100%', maxWidth: 'var(--max-width-home)', padding: '84px 0 72px' }}>

          {step === 'answer' && (
            <>
              {/* Topic kicker */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.24em',
                textTransform: 'uppercase', color: 'var(--color-oxblood)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 6, height: 6, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                {(activeQuestion ?? q)!.topic}
              </div>

              {/* Question */}
              <h1 className="home-q-h1" style={{
                fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 56,
                lineHeight: 1.12, letterSpacing: '-0.012em', margin: '24px 0 0',
                color: 'var(--color-ink)', textWrap: 'balance',
              }}>
                {(activeQuestion ?? q)!.text}
              </h1>

              {/* Navigation row */}
              <div className="home-q-nav-row" style={{
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
                  >â€¹</button>
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
                  >â€º</button>
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

              {/* F-001: New questions + F-016: Custom question controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <button
                  type="button" onClick={handleRefresh} disabled={refreshing}
                  style={{
                    background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 11,
                    letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-45)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0,
                  }}
                >
                  {refreshing ? 'Refreshingâ€¦' : 'â†»  New questions'}
                </button>
                {!customQuestion && (
                  <button
                    type="button" onClick={() => setShowCustomQ(v => !v)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: 'var(--color-ink-45)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                    }}
                  >
                    Enter your own question
                  </button>
                )}
                {customQuestion && (
                  <button
                    type="button" onClick={() => setCustomQuestion(null)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: 'var(--color-ink)',
                      background: 'none', border: '1px solid var(--color-ink)', cursor: 'pointer',
                      padding: '3px 10px',
                    }}
                  >
                    Ã— Using custom question
                  </button>
                )}
              </div>

              {refreshError && (
                <p role="alert" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#E8404A', marginTop: 6, letterSpacing: '0.08em' }}>
                  {refreshError}
                </p>
              )}

              {showCustomQ && !customQuestion && (
                <div style={{ marginTop: 18 }}>
                  <label htmlFor="custom-question" className="sr-only">Your question</label>
                  <textarea
                    id="custom-question"
                    value={customQText}
                    onChange={e => setCustomQText(e.target.value)}
                    placeholder="What's your question?"
                    rows={2}
                    style={{
                      width: '100%', fontFamily: 'var(--font-serif)', fontSize: 22,
                      border: 'none', borderBottom: '2px solid var(--color-ink)',
                      background: 'transparent', padding: '0 0 12px', outline: 'none', resize: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      disabled={customQText.trim().length <= 10}
                      onClick={() => {
                        setCustomQuestion({ id: 'custom', text: customQText.trim(), topic: 'Custom', week_start: new Date().toISOString() })
                        setShowCustomQ(false)
                        setCustomQText('')
                      }}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                        textTransform: 'uppercase', padding: '6px 14px',
                        border: '1px solid var(--color-ink)', background: 'none', cursor: 'pointer',
                        opacity: customQText.trim().length <= 10 ? 0.35 : 1,
                      }}
                    >
                      Use this question
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCustomQ(false); setCustomQText('') }}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                        textTransform: 'uppercase', padding: '6px 14px',
                        border: '1px solid var(--color-hairline-3)', background: 'none', cursor: 'pointer',
                        color: 'var(--color-ink-45)',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Answer textarea â€" readOnly during AI polish */}
              <label htmlFor="answer" className="sr-only">Your answer</label>
              <textarea
                id="answer"
                className="home-answer-ta"
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
              <div className="home-format-row" style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

                <div className="home-action-btns" style={{ display: 'flex', gap: 12 }}>
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
                    {polishing ? 'Polishingâ€¦' : 'Polish with AI âœ¦'}
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
                    {generating ? 'Elaboratingâ€¦' : 'Elaborate with AI âœ¦'}
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
                    Preview â†’
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
                    setAddImage(false)
                    setImageDataUrl(null)
                    if (q) savePost({ question_id: q.id, answer, generated_post: '', format, status: 'draft' })
                  }}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  â† Back
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-oxblood)' }}>
                  Post preview
                </span>
              </div>

              <div style={{ maxWidth: 'var(--max-width-preview)', margin: '34px auto 0' }}>
                <label htmlFor="post" className="sr-only">Your post â€" edit before posting</label>
                <textarea
                  id="post"
                  className="home-preview-ta"
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

                {/* Image builder */}
                <div style={{ marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => { setAddImage(v => !v); if (!addImage) generateImage() }}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: addImage ? 'var(--color-oxblood)' : 'var(--color-ink-45)',
                      background: 'none', border: `1px solid ${addImage ? 'var(--color-oxblood)' : 'var(--color-hairline-3)'}`,
                      padding: '6px 14px', cursor: 'pointer',
                    }}
                  >
                    {addImage ? '✕ Remove image' : '+ Add image'}
                  </button>

                  {addImage && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Controls row */}
                      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Font */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--color-ink-45)' }}>
                          FONT
                          <select
                            value={imgFont}
                            onChange={e => setImgFont(e.target.value as 'serif' | 'sans' | 'mono')}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, border: '1px solid var(--color-hairline-3)', background: 'var(--color-surface)', padding: '4px 8px' }}
                          >
                            <option value="serif">Serif</option>
                            <option value="sans">Sans</option>
                            <option value="mono">Mono</option>
                          </select>
                        </label>
                        {/* Color 1 */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--color-ink-45)' }}>
                          FROM
                          <input type="color" value={imgColor1} onChange={e => setImgColor1(e.target.value)} style={{ width: 32, height: 28, border: 'none', cursor: 'pointer' }} />
                        </label>
                        {/* Color 2 */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--color-ink-45)' }}>
                          TO
                          <input type="color" value={imgColor2} onChange={e => setImgColor2(e.target.value)} style={{ width: 32, height: 28, border: 'none', cursor: 'pointer' }} />
                        </label>
                        {/* Angle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--color-ink-45)' }}>
                          ANGLE
                          <input type="range" min={0} max={360} value={imgAngle} onChange={e => setImgAngle(Number(e.target.value))} style={{ width: 80 }} />
                          <span>{imgAngle}°</span>
                        </label>
                        {/* Re-generate */}
                        <button
                          type="button" onClick={generateImage}
                          style={{
                            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                            textTransform: 'uppercase', padding: '5px 12px',
                            border: '1px solid var(--color-ink)', background: 'none', cursor: 'pointer',
                          }}
                        >
                          ↻ Regenerate
                        </button>
                      </div>

                      {/* Hidden canvas + image preview */}
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      {imageDataUrl && (
                        <div>
                          <img
                            src={imageDataUrl}
                            alt="Post image preview"
                            style={{ width: '100%', maxWidth: 480, height: 'auto', display: 'block', border: '1px solid var(--color-hairline)' }}
                          />
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--color-ink-45)', marginTop: 6 }}>
                            1200×628px · will be uploaded with your post
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="home-char-count-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
                  {charCount > 3000 ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: '#E8404A' }}>
                      âš  {charCount}/3000 â€" over LinkedIn limit
                    </span>
                  ) : charCount > 2700 ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--color-amber)' }}>
                      {charCount}/3000 characters
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--color-ink-45)' }}>
                      {charCount} characters Â· edit freely before posting
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {linkedInConnected ? (
                      <button
                        type="button" onClick={postToLinkedIn} disabled={posting || charCount > 3000}
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                          color: '#FFFFFF', background: 'var(--color-linkedin)',
                          border: '1px solid var(--color-linkedin)', padding: '0 26px', height: 48,
                          opacity: (posting || charCount > 3000) ? 0.6 : 1,
                        }}
                      >
                        {posting ? 'Postingâ€¦' : 'Post to LinkedIn â†’'}
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
                        Connect LinkedIn in Account settings â†’
                      </a>
                    )}
                  </div>
                </div>

                {(postError || generateError) && (
                  <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-oxblood)', marginTop: 12 }}>
                    <span style={{ width: 5, height: 5, background: 'var(--color-oxblood)', display: 'inline-block' }} />
                    {postError || generateError}
                    {postError.includes('expired') && (
                      <a href="/admin" style={{ color: 'var(--color-oxblood)', marginLeft: 4 }}>â†’ Account</a>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 'published' && (
            <div style={{ maxWidth: 'var(--max-width-preview)', margin: '0 auto', padding: '72px 0' }}>
              {/* H-001: Dominant success signal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
                <span style={{
                  width: 48, height: 48, background: 'var(--color-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 22, flexShrink: 0,
                }}>✓</span>
                <h2 style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 42,
                  color: 'var(--color-ink)', margin: 0, lineHeight: 1.1,
                }}>
                  Published to LinkedIn
                </h2>
              </div>

              {/* H-003: Summary of what was sent */}
              {generatedPost && (
                <div style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
                  padding: '22px 26px', marginBottom: 36,
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-ink-45)', marginBottom: 12 }}>
                    What was posted
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65,
                    color: 'var(--color-ink)', margin: 0, whiteSpace: 'pre-wrap',
                    maxHeight: 200, overflow: 'hidden',
                  }}>
                    {generatedPost.length > 400 ? generatedPost.slice(0, 400) + '…' : generatedPost}
                  </p>
                </div>
              )}

              {publishedReady && (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => { setStep('answer'); setGeneratedPost(''); setIndex(i => Math.min(i + 1, questions.length - 1)) }}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-paper)', background: 'var(--color-oxblood)',
                      border: '1px solid var(--color-oxblood)', padding: '0 26px', height: 48, cursor: 'pointer',
                    }}
                  >
                    Next question →
                  </button>
                  <a
                    href="/history"
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-ink)', background: 'none',
                      border: '1px solid var(--color-hairline-2)', padding: '0 22px', height: 48,
                      display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                    }}
                  >
                    View history
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
