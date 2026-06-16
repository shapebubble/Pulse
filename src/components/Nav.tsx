import Link from 'next/link'

export function ECGMark({ size = 34 }: { size?: number }) {
  const h = Math.round(size * 20 / 34)
  return (
    <svg width={size} height={h} viewBox="0 0 34 20" fill="none" aria-hidden="true">
      <polyline
        points="0,10 8,10 11,10 14,3 18,17 22,6 25,10 34,10"
        stroke="#7C1D2B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Nav({ active }: { active?: 'history' | 'account' }) {
  return (
    <header style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      padding:         '26px 64px',
      borderBottom:    '1px solid var(--color-hairline)',
      backgroundColor: 'var(--color-paper)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
        <ECGMark />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.01em', color: 'var(--color-ink)' }}>
          Pulse
        </span>
      </Link>

      <nav style={{
        display:       'flex',
        gap:           34,
        fontFamily:    'var(--font-mono)',
        fontSize:      12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}>
        <Link href="/history" style={{
          color:         active === 'history' ? 'var(--color-ink)' : 'var(--color-ink-45)',
          textDecoration:'none',
          borderBottom:  active === 'history' ? '2px solid var(--color-oxblood)' : 'none',
          paddingBottom: active === 'history' ? 3 : 0,
        }}>
          History
        </Link>
        <Link href="/admin" style={{
          color:         active === 'account' ? 'var(--color-ink)' : 'var(--color-ink-45)',
          textDecoration:'none',
          borderBottom:  active === 'account' ? '2px solid var(--color-oxblood)' : 'none',
          paddingBottom: active === 'account' ? 3 : 0,
        }}>
          Account
        </Link>
      </nav>
    </header>
  )
}
