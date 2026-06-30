'use client'

import Link from 'next/link'
import { useRef } from 'react'
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

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return { ref, inView }
}

const mq = `
  @media (max-width: 767px) {
    .lp-nav      { padding: 0 22px !important; }
    .lp-hero     { padding: 72px 22px 80px !important; }
    .lp-h1       { font-size: 44px !important; }
    .lp-kicker   { margin-bottom: 20px !important; }
    .lp-sub      { font-size: 17px !important; }
    .lp-section  { padding: 64px 22px !important; }
    .lp-steps    { grid-template-columns: 1fr !important; gap: 40px !important; }
    .lp-benefits-row { grid-template-columns: 1fr !important; gap: 12px !important; padding: 28px 0 !important; }
    .lp-cta-h2  { font-size: 36px !important; }
    .lp-cta-sec { padding: 80px 22px !important; }
    .lp-footer   { padding: 28px 22px !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`

export function LandingPage() {
  const problem   = useReveal()
  const steps_    = useReveal()
  const benefits_ = useReveal()
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
            It's not a lack of things to say. It's the friction of starting. Postyon removes that friction with a question that already knows what you're interested in.
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
            Start posting. It's free.
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

      {/* ─── Footer — no animation ────────────────────────────── */}
      <footer className="lp-footer" style={{
        background: 'var(--color-mark)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '32px var(--nav-padding-x-desk)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={22} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.04em', color: 'rgba(245,244,238,0.45)' }}>
            Postyon
          </span>
        </div>
        <Link href="/auth" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(245,244,238,0.35)', textDecoration: 'none' }}>
          Sign in
        </Link>
      </footer>

    </div>
  )
}
