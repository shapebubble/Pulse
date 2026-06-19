'use client'

import Link from 'next/link'

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
`

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
    label: 'Your voice, not AI\'s',
    body: 'You answer the question first. AI only touches the words if you ask it to. Your opinions, your experience, your post.',
  },
  {
    label: 'Five minutes, done',
    body: 'A single focused question beats the blank page every time. Answer it and you\'re done for the day.',
  },
  {
    label: 'Builds the habit',
    body: 'Consistent posting is what grows a personal brand. Postyon makes showing up on LinkedIn the path of least resistance.',
  },
]

export function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-paper)', minHeight: '100dvh' }}>
      <style>{mq}</style>

      {/* ─── Nav ──────────────────────────────────────────────── */}
      <nav className="lp-nav" style={{
        background: 'var(--color-mark)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--nav-padding-x-desk)', height: 64,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: '#F6F4EF' }}>
          Postyon
        </span>
        <Link href="/auth" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(246,244,239,0.65)', textDecoration: 'none' }}>
          Sign in
        </Link>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="lp-hero" style={{
        background: 'var(--color-mark)',
        padding: '120px var(--nav-padding-x-desk) 128px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="lp-kicker" style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'rgba(246,244,239,0.5)', marginBottom: 32,
          }}>
            Personal brand · LinkedIn content
          </div>
          <h1 className="lp-h1" style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 72,
            lineHeight: 1.06, letterSpacing: '-0.018em', color: '#F6F4EF',
            margin: '0 0 28px', maxWidth: '14ch', textWrap: 'balance',
          }}>
            Your thoughts on LinkedIn. Every week.
          </h1>
          <p className="lp-sub" style={{
            fontFamily: 'var(--font-sans)', fontSize: 19, lineHeight: 1.6,
            color: 'rgba(246,244,239,0.65)', maxWidth: '50ch', margin: '0 0 48px',
          }}>
            Postyon sends you a question based on your expertise. You answer honestly. Then post. Takes five minutes.
          </p>
          <Link
            href="/auth"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
              color: '#F6F4EF', background: 'var(--color-oxblood)',
              border: '1px solid var(--color-oxblood)',
              padding: '0 32px', lineHeight: '52px',
              textDecoration: 'none', letterSpacing: '0.01em',
            }}
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* ─── Problem ──────────────────────────────────────────── */}
      <section className="lp-section" style={{ padding: '96px var(--nav-padding-x-desk)', background: 'var(--color-paper)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 28,
          }}>
            The problem
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 36,
            lineHeight: 1.35, color: 'var(--color-ink)', maxWidth: '36ch',
            margin: 0, textWrap: 'balance',
          }}>
            You know you should be posting on LinkedIn. You have the experience, the opinions, the stories. But the blank page wins every time.
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.7,
            color: 'var(--color-ink-45)', maxWidth: '52ch', margin: '24px 0 0',
          }}>
            It's not a lack of things to say. It's the friction of starting. Postyon removes that friction with a question that already knows what you're interested in.
          </p>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
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
          <div className="lp-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {steps.map(s => (
              <div key={s.n}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.12em',
                  color: 'var(--color-ink-45)', marginBottom: 16,
                }}>
                  {s.n}
                </div>
                <div style={{
                  width: 32, height: 2, background: 'var(--color-oxblood)', marginBottom: 20,
                }} />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why it works ─────────────────────────────────────── */}
      <section className="lp-section" style={{ padding: '96px var(--nav-padding-x-desk)', background: 'var(--color-paper)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: 56,
          }}>
            Why it works
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {benefits.map((b, i) => (
              <div
                key={b.label}
                className="lp-benefits-row"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="lp-cta-sec" style={{
        background: 'var(--color-mark)',
        padding: '112px var(--nav-padding-x-desk)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="lp-cta-h2" style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 48,
            lineHeight: 1.1, color: '#F6F4EF', margin: '0 0 24px', textWrap: 'balance',
          }}>
            Start posting. It's free.
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 17, color: 'rgba(246,244,239,0.6)',
            margin: '0 0 40px', lineHeight: 1.6,
          }}>
            No credit card. No AI slop. Just your thoughts, published.
          </p>
          <Link
            href="/auth"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
              color: '#F6F4EF', background: 'var(--color-oxblood)',
              border: '1px solid var(--color-oxblood)',
              padding: '0 32px', lineHeight: '52px',
              textDecoration: 'none',
            }}
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="lp-footer" style={{
        background: 'var(--color-mark)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '32px var(--nav-padding-x-desk)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'rgba(246,244,239,0.5)' }}>
          Postyon
        </span>
        <Link href="/auth" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(246,244,239,0.4)', textDecoration: 'none' }}>
          Sign in
        </Link>
      </footer>

    </div>
  )
}
