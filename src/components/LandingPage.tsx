'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'motion/react'

const EXPO = [0.16, 1, 0.3, 1] as const

function LogoMark({ size = 28 }: { size?: number }) {
  const half = size / 2
  return (
    <span style={{ display: 'flex', width: size, height: size, flexShrink: 0 }}>
      <span style={{ width: half, height: size, background: '#1F28A8' }} />
      <span style={{ display: 'flex', flexDirection: 'column', width: half }}>
        <span style={{ width: half, height: half, background: '#F5C000' }} />
        <span style={{ width: half, height: half, background: '#E8404A' }} />
      </span>
    </span>
  )
}

const steps = [
  {
    n: '01',
    title: 'Get a question',
    body: 'Each day, Postyon surfaces a question drawn from news in your chosen topic areas — AI, design, leadership, whatever you want to be known for.',
  },
  {
    n: '02',
    title: 'Write your answer',
    body: 'Just your honest take. As long or short as you like. Polish the phrasing with AI, or ask it to elaborate — but the thinking is always yours first.',
  },
  {
    n: '03',
    title: 'Post to LinkedIn',
    body: 'Preview exactly what will go out, edit freely, then publish with one click. No copy-pasting, no switching apps.',
  },
]

const benefits = [
  {
    label: "Your voice, not AI's",
    body: "You answer the question first. AI only touches the words if you ask it to. Your opinions, your experience, your post.",
  },
  {
    label: 'Five minutes, done',
    body: "A single focused question beats the blank page every time. Answer it and you're done for the day.",
  },
  {
    label: 'Builds the habit',
    body: 'Consistent posting is what grows a personal brand. Postyon makes showing up on LinkedIn the path of least resistance.',
  },
]

// ─── Demo animation ──────────────────────────────────────────────────────────
const DEMO_Q = 'Is the brief dead? What replaced it in your work?'
const DEMO_A = "Honestly? The brief is dying. Clients don't want 40 pages anymore."

function DemoCard() {
  const [qIdx, setQIdx] = useState(0)
  const [aIdx, setAIdx] = useState(0)
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    if (phase === 0) {
      if (qIdx < DEMO_Q.length) {
        const t = setTimeout(() => setQIdx(i => i + 1), 48)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase(1), 1800)
      return () => clearTimeout(t)
    }
    if (phase === 1) {
      if (aIdx < DEMO_A.length) {
        const t = setTimeout(() => setAIdx(i => i + 1), 42)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase(2), 1800)
      return () => clearTimeout(t)
    }
    // phase 2 — hold post, then loop
    const t = setTimeout(() => { setPhase(0); setQIdx(0); setAIdx(0) }, 3200)
    return () => clearTimeout(t)
  }, [phase, qIdx, aIdx])

  return (
    <div className="lp-demo-card" style={{
      background: '#F5F4EE',
      border: '1px solid var(--color-hairline)',
      maxWidth: 560,
      margin: '0 auto',
    }}>
      {/* Mock browser bar */}
      <div style={{
        padding: '9px 14px',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ width: 8, height: 8, background: 'rgba(22,21,15,0.14)', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, background: 'rgba(22,21,15,0.14)', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, background: 'rgba(22,21,15,0.14)', display: 'inline-block' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-45)',
          marginLeft: 8, letterSpacing: '0.02em',
        }}>
          postyon.app — live
        </span>
      </div>

      {/* Card content */}
      <div style={{ padding: '28px 24px', minHeight: 300 }}>
        {/* Question */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#1F28A8', marginBottom: 8,
          }}>
            Today's question
          </div>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.55,
            color: 'var(--color-ink)', margin: 0,
          }}>
            {DEMO_Q.slice(0, qIdx)}
            {phase === 0 && qIdx < DEMO_Q.length && <span className="lp-cursor" />}
          </p>
        </div>

        {/* Answer — phases 1 + 2 */}
        {phase >= 1 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--color-ink-45)', marginBottom: 8,
            }}>
              Your answer
            </div>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6,
              color: 'var(--color-ink)', margin: 0,
            }}>
              {DEMO_A.slice(0, aIdx)}
              {phase === 1 && aIdx < DEMO_A.length && <span className="lp-cursor" />}
            </p>
          </div>
        )}

        {/* Generated post — phase 2 */}
        {phase === 2 && (
          <div style={{
            border: '1px solid rgba(22,21,15,0.12)',
            background: '#ffffff',
            padding: '16px 18px',
            animation: 'lpFadeUp 0.45s ease forwards',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#1F28A8', marginBottom: 12,
            }}>
              Generated post
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#1F28A8', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: '#000', lineHeight: 1.3 }}>You</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#666', lineHeight: 1.3 }}>Design leader · just now</div>
              </div>
            </div>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.65,
              color: '#000', margin: 0,
            }}>
              The brief isn&apos;t dead — it just moved.<br /><br />
              Clients stopped asking for 40-page decks. Now they want you in the room earlier, already fluent in their constraints.<br /><br />
              The brief was always a proxy for trust. When the trust is there, you don&apos;t need the document.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return { ref, inView }
}

const mq = `
  @keyframes lpBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes lpFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .lp-cursor {
    display: inline-block;
    width: 2px;
    height: 0.9em;
    background: var(--color-ink);
    margin-left: 1px;
    vertical-align: text-bottom;
    animation: lpBlink 0.75s step-end infinite;
  }
  @media (max-width: 767px) {
    .lp-nav           { padding: 0 22px !important; }
    .lp-hero          { padding: 72px 22px 80px !important; }
    .lp-h1            { font-size: 44px !important; }
    .lp-kicker        { margin-bottom: 20px !important; }
    .lp-sub           { font-size: 17px !important; }
    .lp-section       { padding: 64px 22px !important; }
    .lp-steps         { grid-template-columns: 1fr !important; gap: 40px !important; }
    .lp-benefits-row  { grid-template-columns: 1fr !important; gap: 12px !important; padding: 28px 0 !important; }
    .lp-cta-h2        { font-size: 36px !important; }
    .lp-cta-sec       { padding: 80px 22px !important; }
    .lp-footer        { padding: 40px 22px !important; }
    .lp-demo-card     { margin: 0 !important; }
    .lp-who-grid      { grid-template-columns: 1fr !important; }
    .lp-compare-grid  { grid-template-columns: 1fr !important; }
    .lp-compare-right { border-left: none !important; border-top: 1.5px solid var(--color-ink) !important; }
    .lp-compare-h2    { font-size: 28px !important; }
    .lp-footer-cols   { grid-template-columns: 1fr !important; gap: 40px !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`

export function LandingPage() {
  const problem   = useReveal()
  const steps_    = useReveal()
  const demo_     = useReveal()
  const benefits_ = useReveal()
  const who_      = useReveal()
  const compare_  = useReveal()
  const pricing_  = useReveal()
  const cta       = useReveal()

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-paper)', minHeight: '100dvh' }}>
      <style>{mq}</style>

      {/* ─── Nav — frosted glass sticky ────────────────────────── */}
      <nav className="lp-nav" style={{
        position: 'sticky', top: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--nav-padding-x-desk)', height: 64,
        background: 'rgba(233,232,226,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(22,21,15,0.09)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <LogoMark size={28} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.04em', color: 'var(--color-ink)' }}>
            Postyon
          </span>
        </div>
        <Link href="/auth" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-45)', textDecoration: 'none' }}>
          Sign in
        </Link>
      </nav>

      {/* ─── Hero — page-load choreography ────────────────────── */}
      <section className="lp-hero" style={{
        background: 'var(--color-mark)',
        padding: '120px var(--nav-padding-x-desk) 128px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <motion.div
            className="lp-kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'rgba(245,244,238,0.5)', marginBottom: 32,
            }}
          >
            <span style={{ width: 7, height: 7, background: '#E8404A', display: 'inline-block', flexShrink: 0 }} />
            AI-assisted · never AI-authored
          </motion.div>

          <motion.h1
            className="lp-h1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EXPO, delay: 0.14 }}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 72,
              lineHeight: 1.06, letterSpacing: '-0.018em', color: '#F5F4EE',
              margin: '0 0 28px', maxWidth: '14ch', textWrap: 'balance',
            }}
          >
            Your thoughts on LinkedIn. Every week.
          </motion.h1>

          <motion.p
            className="lp-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.34 }}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: 19, lineHeight: 1.6,
              color: 'rgba(245,244,238,0.6)', maxWidth: '50ch', margin: '0 0 48px',
            }}
          >
            Postyon sends you a question based on your expertise. You answer honestly. Then post. Takes five minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EXPO, delay: 0.54 }}
          >
            <Link
              href="/auth"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                color: '#16150F', background: '#F5C000',
                border: '1px solid #F5C000',
                padding: '0 32px', lineHeight: '52px',
                textDecoration: 'none', letterSpacing: '0.01em',
              }}
            >
              Get started free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Problem — single scroll reveal ───────────────────── */}
      <section className="lp-section" style={{ padding: '96px var(--nav-padding-x-desk)', background: 'var(--color-paper)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }} ref={problem.ref}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 28,
          }}>
            The problem
          </div>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={problem.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: EXPO }}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 36,
              lineHeight: 1.35, color: 'var(--color-ink)', maxWidth: '36ch',
              margin: 0, textWrap: 'balance',
            }}
          >
            You know you should be posting on LinkedIn. You have the experience, the opinions, the stories. But the blank page wins every time.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={problem.inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.28 }}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.7,
              color: 'var(--color-ink-45)', maxWidth: '52ch', margin: '24px 0 0',
            }}
          >
            It&apos;s not a lack of things to say. It&apos;s the friction of starting. Postyon removes that friction with a question that already knows what you&apos;re interested in.
          </motion.p>
        </div>
      </section>

      {/* ─── How it works — staggered list ────────────────────── */}
      <section className="lp-section" style={{
        padding: '96px var(--nav-padding-x-desk)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-hairline)',
        borderBottom: '1px solid var(--color-hairline)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 56,
          }}>
            How it works
          </div>

          <div ref={steps_.ref} className="lp-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 36 }}
                animate={steps_.inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: EXPO, delay: i * 0.13 }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.12em',
                  color: 'var(--color-ink-45)', marginBottom: 16,
                }}>
                  {s.n}
                </div>

                {/* Coral bar wipes in from left via scaleX */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={steps_.inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.4, ease: EXPO, delay: i * 0.13 + 0.18 }}
                  style={{
                    width: 32, height: 2, background: '#E8404A',
                    marginBottom: 20, transformOrigin: 'left center',
                  }}
                />

                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22,
                  color: 'var(--color-ink)', margin: '0 0 12px', lineHeight: 1.2,
                }}>
                  {s.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7,
                  color: 'var(--color-ink-45)', margin: 0,
                }}>
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo — A-010 ─────────────────────────────────────── */}
      <section className="lp-section" style={{ padding: '96px var(--nav-padding-x-desk)', background: 'var(--color-paper)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }} ref={demo_.ref}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={demo_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 48,
            }}
          >
            See it in action
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={demo_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: EXPO, delay: 0.14 }}
          >
            <DemoCard />
          </motion.div>
        </div>
      </section>

      {/* ─── Why it works — slide from left, staggered ────────── */}
      <section className="lp-section" style={{ padding: '96px var(--nav-padding-x-desk)', background: 'var(--color-paper)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 56,
          }}>
            Why it works
          </div>

          <div ref={benefits_.ref} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {benefits.map((b, i) => (
              <motion.div
                key={b.label}
                className="lp-benefits-row"
                initial={{ opacity: 0, x: -20 }}
                animate={benefits_.inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.65, ease: EXPO, delay: i * 0.11 }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 2fr',
                  gap: 48, padding: '36px 0',
                  borderTop: i === 0 ? '1px solid var(--color-hairline)' : undefined,
                  borderBottom: '1px solid var(--color-hairline)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22,
                  color: 'var(--color-ink)', lineHeight: 1.3,
                }}>
                  {b.label}
                </div>
                <p style={{
                  fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.7,
                  color: 'var(--color-ink-45)', margin: 0,
                }}>
                  {b.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who it's for — A-008 ─────────────────────────────── */}
      <section className="lp-section" style={{
        padding: '96px var(--nav-padding-x-desk)',
        background: 'var(--color-paper)',
        borderTop: '1px solid var(--color-hairline)',
        borderBottom: '1px solid var(--color-hairline)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }} ref={who_.ref}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={who_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 48,
            }}
          >
            Who it&apos;s for
          </motion.div>

          <div className="lp-who-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {/* Card 1 — Senior ICs */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={who_.inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: EXPO, delay: 0 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-hairline)',
                padding: 28,
              }}
            >
              <div style={{
                width: 44, height: 44,
                background: '#1F28A8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: '#fff' }}>IC</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 20,
                color: 'var(--color-ink)', margin: '0 0 10px', lineHeight: 1.25,
              }}>
                Senior ICs
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65,
                color: 'var(--color-ink-45)', margin: 0,
              }}>
                Designers, PMs, engineers building a reputation beyond their job title.
              </p>
            </motion.div>

            {/* Card 2 — Founders & freelancers */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={who_.inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: EXPO, delay: 0.1 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-hairline)',
                padding: 28,
              }}
            >
              <div style={{
                width: 44, height: 44,
                background: '#E8404A',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: '#fff' }}>F</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 20,
                color: 'var(--color-ink)', margin: '0 0 10px', lineHeight: 1.25,
              }}>
                Founders &amp; freelancers
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65,
                color: 'var(--color-ink-45)', margin: 0,
              }}>
                Selling a point of view, not just a service. Presence is the pipeline.
              </p>
            </motion.div>

            {/* Card 3 — People mid-search */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={who_.inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: EXPO, delay: 0.2 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-hairline)',
                padding: 28,
              }}
            >
              <div style={{
                width: 44, height: 44,
                background: '#1F28A8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: '#fff' }}>→</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 20,
                color: 'var(--color-ink)', margin: '0 0 10px', lineHeight: 1.25,
              }}>
                People mid-search
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65,
                color: 'var(--color-ink-45)', margin: 0,
              }}>
                Proving they&apos;re fluent in where the field is heading — by actually engaging.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── AI comparison — A-011 ────────────────────────────── */}
      <section className="lp-section" style={{
        padding: '96px var(--nav-padding-x-desk)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-hairline)',
        borderBottom: '1px solid var(--color-hairline)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }} ref={compare_.ref}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={compare_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 36,
            }}
          >
            The difference
          </motion.div>

          <motion.h2
            className="lp-compare-h2"
            initial={{ opacity: 0, y: 20 }}
            animate={compare_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: EXPO, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 40,
              lineHeight: 1.15, color: 'var(--color-ink)', margin: '0 0 56px',
              maxWidth: '28ch', textWrap: 'balance',
            }}
          >
            Most AI writes{' '}
            <span style={{ color: 'var(--color-ink-45)' }}>instead</span>
            {' '}of you. Postyon writes{' '}
            <span style={{ color: '#E8404A' }}>after</span>
            {' '}you.
          </motion.h2>

          <motion.div
            className="lp-compare-grid"
            initial={{ opacity: 0, y: 24 }}
            animate={compare_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.22 }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: '1.5px solid var(--color-ink)',
            }}
          >
            {/* Left — Pure AI generators */}
            <div style={{ padding: '36px 32px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--color-ink-45)', marginBottom: 28,
              }}>
                Pure AI generators
              </div>
              {[
                'One prompt, zero of your thinking',
                'The same three openers everyone uses',
                'Readers smell it instantly',
                '"Game-changer", "leverage", "excited to share"',
              ].map(item => (
                <div key={item} style={{
                  display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700,
                    color: '#E8404A', lineHeight: 1.4, flexShrink: 0,
                  }}>
                    ✕
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55,
                    color: 'var(--color-ink-45)',
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Right — Postyon */}
            <div className="lp-compare-right" style={{
              padding: '36px 32px',
              background: '#1F28A8',
              borderLeft: '1.5px solid var(--color-ink)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(245,244,238,0.55)', marginBottom: 28,
              }}>
                Postyon
              </div>
              {[
                'Starts from your answer, every time',
                'Keeps your phrasing, your angle, your wit',
                'Sounds like a person who actually thinks',
                'Buzzwords are banned by design',
              ].map(item => (
                <div key={item} style={{
                  display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700,
                    color: '#F5C000', lineHeight: 1.4, flexShrink: 0,
                  }}>
                    ✓
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55,
                    color: 'rgba(245,244,238,0.88)',
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Pricing — A-005 ──────────────────────────────────── */}
      <section className="lp-section" style={{ padding: '96px var(--nav-padding-x-desk)', background: 'var(--color-paper)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }} ref={pricing_.ref}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={pricing_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 28,
            }}
          >
            Pricing
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={pricing_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: EXPO, delay: 0.08 }}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 48,
              lineHeight: 1.1, color: 'var(--color-ink)', margin: '0 0 48px',
            }}
          >
            Free while we build it.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={pricing_.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.18 }}
            style={{ maxWidth: 520 }}
          >
            {/* Pricing card */}
            <div style={{
              background: '#16150F',
              color: '#F5F4EE',
              padding: 44,
            }}>
              {/* Badge */}
              <div style={{
                display: 'inline-block',
                background: '#F5C000',
                color: '#16150F',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                padding: '4px 12px',
                marginBottom: 28,
              }}>
                Public beta
              </div>

              {/* Price */}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700,
                letterSpacing: '-0.03em', color: '#F5F4EE', marginBottom: 16,
                lineHeight: 1,
              }}>
                $0/mo · during beta
              </div>

              {/* Description */}
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65,
                color: 'rgba(245,244,238,0.6)', margin: '0 0 32px',
              }}>
                No card to get started. Everything below is yours during beta — and a free tier stays once we launch paid plans.
              </p>

              {/* Feature list */}
              <div style={{ marginBottom: 36 }}>
                {[
                  'Fresh questions every week',
                  'Polish & elaborate with AI',
                  'Post straight to LinkedIn',
                  'Post history',
                ].map(feat => (
                  <div key={feat} style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700,
                      color: '#F5C000', flexShrink: 0,
                    }}>
                      ✓
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5,
                      color: 'rgba(245,244,238,0.88)',
                    }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/auth"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                  color: '#16150F', background: '#F5C000',
                  border: '1px solid #F5C000',
                  padding: '0 32px', lineHeight: '52px',
                  textDecoration: 'none', letterSpacing: '0.01em',
                }}
              >
                Create your account →
              </Link>
            </div>

            {/* Below-card note */}
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em',
              color: 'var(--color-ink-45)', margin: '18px 0 0',
              lineHeight: 1.6,
            }}>
              A paid Pro tier is on the way — early users get the heads-up first.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA — single confident reveal ──────────────── */}
      <section className="lp-cta-sec" style={{
        background: 'var(--color-mark)',
        padding: '112px var(--nav-padding-x-desk)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }} ref={cta.ref}>
          <motion.h2
            className="lp-cta-h2"
            initial={{ opacity: 0, y: 24 }}
            animate={cta.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EXPO }}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 48,
              lineHeight: 1.1, color: '#F5F4EE', margin: '0 0 24px', textWrap: 'balance',
            }}
          >
            Start posting. It&apos;s free.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={cta.inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: EXPO, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: 17, color: 'rgba(245,244,238,0.55)',
              margin: '0 0 40px', lineHeight: 1.6,
            }}
          >
            No credit card. No AI slop. Just your thoughts, published.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={cta.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: EXPO, delay: 0.36 }}
          >
            <Link
              href="/auth"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                color: '#16150F', background: '#F5C000',
                border: '1px solid #F5C000',
                padding: '0 32px', lineHeight: '52px',
                textDecoration: 'none',
              }}
            >
              Get started free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer — D-001–006 ───────────────────────────────── */}
      <footer className="lp-footer" style={{
        background: '#16150F',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '72px var(--nav-padding-x-desk) 0',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {/* 4-column grid */}
          <div className="lp-footer-cols" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48,
            paddingBottom: 56,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            {/* Col 1 — brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <LogoMark size={26} />
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
                  letterSpacing: '-0.04em', color: 'rgba(245,244,238,0.7)',
                }}>
                  Postyon
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7,
                color: 'rgba(245,244,238,0.45)', margin: 0, maxWidth: '28ch',
              }}>
                Post your own narrative. A personal content engine that keeps your LinkedIn voice yours.
              </p>
            </div>

            {/* Col 2 — Office */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(245,244,238,0.3)',
                marginBottom: 18,
              }}>
                Office
              </div>
              <address style={{
                fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75,
                color: 'rgba(245,244,238,0.55)', fontStyle: 'normal',
              }}>
                Postyon ApS<br />
                Vesterbrogade 24, 2.<br />
                1620 Copenhagen V<br />
                Denmark
              </address>
            </div>

            {/* Col 3 — Contact */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(245,244,238,0.3)',
                marginBottom: 18,
              }}>
                Contact
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75,
                color: 'rgba(245,244,238,0.55)', marginBottom: 24,
              }}>
                <div>hello@postyon.com</div>
                <div>support@postyon.com</div>
              </div>
              {/* Social icons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'in', title: 'LinkedIn' },
                  { label: 'X',  title: 'X / Twitter' },
                  { label: 'f',  title: 'Facebook' },
                ].map(icon => (
                  <div
                    key={icon.label}
                    title={icon.title}
                    style={{
                      width: 34, height: 34,
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
                      color: 'rgba(245,244,238,0.55)', userSelect: 'none',
                    }}>
                      {icon.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 4 — Legal */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(245,244,238,0.3)',
                marginBottom: 18,
              }}>
                Legal
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Terms & conditions', href: '/terms' },
                  { label: 'Privacy policy',      href: '/privacy' },
                  { label: 'Log in',              href: '/auth' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5,
                      color: 'rgba(245,244,238,0.55)', textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 0',
            flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
              color: 'rgba(245,244,238,0.3)',
            }}>
              © 2026 Postyon ApS
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
              color: 'rgba(245,244,238,0.3)',
            }}>
              Made for humans who think out loud.
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}
