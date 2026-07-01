import Link from 'next/link'
import { PostyonMark } from '@/components/Nav'

const LAST_UPDATED = '1 July 2026'
const COMPANY = 'Postyon ApS'
const JURISDICTION = 'Copenhagen, Denmark'

export const metadata = {
  title: 'Privacy Policy — Postyon',
  description: 'Privacy Policy for Postyon. How we collect, use, and protect your personal data under GDPR.',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 36 }}>
    <h2 style={{
      fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22,
      color: 'var(--color-ink)', margin: '0 0 12px', lineHeight: 1.3,
    }}>
      {title}
    </h2>
    <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--color-ink)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
    </div>
  </section>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ margin: 0 }}>{children}</p>
)

export default function PrivacyPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      background: 'var(--color-paper)',
      padding: '40px 24px 80px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <PostyonMark size={26} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
              letterSpacing: '-0.04em', color: 'var(--color-ink)',
            }}>
              Postyon
            </span>
          </Link>
          <Link href="/" style={{
            fontSize: 13, fontWeight: 600, color: 'var(--color-ink-45)',
            textDecoration: 'none',
          }}>
            &larr; Back
          </Link>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 40,
          color: 'var(--color-ink)', margin: '0 0 8px', lineHeight: 1.1,
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontSize: 13, color: 'var(--color-ink-45)', margin: '0 0 48px',
        }}>
          Last updated: {LAST_UPDATED} &nbsp;&middot;&nbsp; {COMPANY}, {JURISDICTION}
        </p>

        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 40 }}>

          <Section title="1. Who We Are">
            <P>{COMPANY} (&ldquo;Postyon&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller for personal data processed through this Service. We are registered in {JURISDICTION}.</P>
            <P>As a company incorporated in Denmark, we process personal data in accordance with the EU General Data Protection Regulation (GDPR) and the Danish Data Protection Act.</P>
          </Section>

          <Section title="2. Data We Collect">
            <P>We collect the following categories of personal data:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Account data:</strong> email address and password (hashed) when you register with email</li>
              <li><strong>LinkedIn OAuth data:</strong> when you connect LinkedIn, we receive your LinkedIn member ID, display name, profile picture URL, and authorisation tokens (scopes: <code style={{ fontSize: 13, background: 'var(--color-surface)', padding: '1px 5px' }}>openid profile w_member_social</code>)</li>
              <li><strong>Content data:</strong> draft posts, published post records, and your content history stored in your account</li>
              <li><strong>Usage data:</strong> pages visited, feature interactions, and session metadata collected through standard server logs</li>
            </ul>
            <P>We do not collect payment card details directly. Payments are handled by our payment processor (Stripe), who operates under their own privacy policy.</P>
          </Section>

          <Section title="3. Legal Basis for Processing">
            <P>We rely on the following GDPR legal bases:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Contract (Art. 6(1)(b)):</strong> processing your account data and content to deliver the Service you signed up for</li>
              <li><strong>Consent (Art. 6(1)(a)):</strong> connecting your LinkedIn account (you may revoke this at any time)</li>
              <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> service security, fraud prevention, and improving the platform</li>
              <li><strong>Legal obligation (Art. 6(1)(c)):</strong> retaining financial records as required by Danish law</li>
            </ul>
          </Section>

          <Section title="4. LinkedIn Data">
            <P>When you authorise the LinkedIn integration, Postyon requests the following OAuth scopes:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>openid</strong> — to verify your LinkedIn identity and create or link your Postyon account</li>
              <li><strong>profile</strong> — to display your name and profile picture within the Service</li>
              <li><strong>w_member_social</strong> — to publish posts to LinkedIn on your behalf when you explicitly schedule or publish through Postyon</li>
            </ul>
            <P>We do not read your LinkedIn connections, messages, or any data beyond what is required for the above functionality. Your LinkedIn access tokens are stored encrypted and used solely to operate the integration.</P>
            <P>You can disconnect LinkedIn at any time from your Postyon account settings or from LinkedIn&rsquo;s own authorised apps page. Disconnecting revokes our posting access immediately.</P>
          </Section>

          <Section title="5. How We Use Your Data">
            <P>We use your personal data to:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Create and manage your account</li>
              <li>Deliver the content drafting and publishing features</li>
              <li>Send transactional emails (account confirmation, password reset, billing receipts)</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Improve the Service (anonymised analytics)</li>
            </ul>
            <P>We do not use your content to train third-party AI models without your explicit consent, and we do not sell your personal data to any third party.</P>
          </Section>

          <Section title="6. Data Sharing">
            <P>We share your data only with:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>LinkedIn:</strong> when you publish content, we transmit it to LinkedIn via their API</li>
              <li><strong>Supabase:</strong> our database and authentication provider (EU data residency)</li>
              <li><strong>Stripe:</strong> our payment processor for subscription billing</li>
              <li><strong>AI providers:</strong> your draft text may be sent to an AI API (e.g. Anthropic Claude) to generate suggestions; no personally identifying metadata is included</li>
            </ul>
            <P>All third-party processors are bound by data processing agreements and GDPR-compliant safeguards.</P>
          </Section>

          <Section title="7. Data Retention">
            <P>We retain your account data for as long as your account is active. If you delete your account, we delete your personal data within 30 days, except where retention is required by law (e.g. billing records, which we keep for 5 years under Danish bookkeeping law).</P>
            <P>Published post records are retained for the life of your account and deleted with it.</P>
          </Section>

          <Section title="8. Your Rights Under GDPR">
            <P>As a data subject, you have the right to:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Rectification</strong> of inaccurate data</li>
              <li><strong>Erasure</strong> (&ldquo;right to be forgotten&rdquo;) — subject to legal retention obligations</li>
              <li><strong>Restriction</strong> of processing in certain circumstances</li>
              <li><strong>Data portability</strong> — receive your data in a machine-readable format</li>
              <li><strong>Object</strong> to processing based on legitimate interests</li>
              <li><strong>Withdraw consent</strong> at any time (e.g. LinkedIn connection)</li>
            </ul>
            <P>To exercise any of these rights, email us at <a href="mailto:privacy@postyon.com" style={{ color: 'var(--color-oxblood)', textDecoration: 'none', fontWeight: 600 }}>privacy@postyon.com</a>. We will respond within 30 days.</P>
            <P>You also have the right to lodge a complaint with the Danish Data Protection Authority (Datatilsynet) at <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-oxblood)', textDecoration: 'none', fontWeight: 600 }}>datatilsynet.dk</a>.</P>
          </Section>

          <Section title="9. Cookies and Tracking">
            <P>We use essential session cookies required for authentication. We do not use advertising cookies or cross-site tracking. Usage analytics are collected in aggregate without personal identifiers.</P>
          </Section>

          <Section title="10. Changes to this Policy">
            <P>We may update this Privacy Policy from time to time. We will notify you of material changes by email or via a notice in the Service. Continued use after the effective date constitutes acceptance.</P>
          </Section>

          <Section title="11. Contact Us">
            <P>
              For privacy-related enquiries or to exercise your data rights, contact:<br />
              <strong>{COMPANY}</strong><br />
              {JURISDICTION}<br />
              <a href="mailto:privacy@postyon.com" style={{ color: 'var(--color-oxblood)', textDecoration: 'none', fontWeight: 600 }}>privacy@postyon.com</a>
            </P>
          </Section>

        </div>

        {/* Footer nav */}
        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 24, marginTop: 16, display: 'flex', gap: 24 }}>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--color-ink-45)', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/" style={{ fontSize: 13, color: 'var(--color-ink-45)', textDecoration: 'none' }}>
            Back to Postyon
          </Link>
        </div>

      </div>
    </main>
  )
}
