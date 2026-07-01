import Link from 'next/link'
import { PostyonMark } from '@/components/Nav'

const LAST_UPDATED = '1 July 2026'
const COMPANY = 'Postyon ApS'
const JURISDICTION = 'Copenhagen, Denmark'

export const metadata = {
  title: 'Terms of Service — Postyon',
  description: 'Terms of Service for Postyon, the LinkedIn content platform.',
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

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{
          fontSize: 13, color: 'var(--color-ink-45)', margin: '0 0 48px',
        }}>
          Last updated: {LAST_UPDATED} &nbsp;&middot;&nbsp; {COMPANY}, {JURISDICTION}
        </p>

        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 40 }}>

          <Section title="1. Acceptance of Terms">
            <P>By creating an account or using the Postyon platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</P>
            <P>These Terms apply to all users, including visitors, registered users, and paying subscribers.</P>
          </Section>

          <Section title="2. Service Description">
            <P>Postyon is a personal-branding platform that helps professionals plan, draft, and publish content to LinkedIn. The Service uses AI assistance to help you generate and refine posts based on your personal voice and audience.</P>
            <P>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.</P>
          </Section>

          <Section title="3. Account Registration">
            <P>You must provide accurate and complete information when registering. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.</P>
            <P>You must be at least 16 years of age to use the Service. By creating an account you confirm that you meet this requirement.</P>
          </Section>

          <Section title="4. LinkedIn Integration">
            <P>Postyon connects to your LinkedIn account via LinkedIn&rsquo;s OAuth API. By authorising this connection, you grant Postyon permission to read your basic profile and to publish posts on your behalf using the scopes you authorise.</P>
            <P>You may revoke this connection at any time from your LinkedIn settings or from your Postyon account page. Revoking access will disable posting functionality but will not delete your Postyon account or content.</P>
            <P>Your use of LinkedIn through Postyon is also subject to LinkedIn&rsquo;s own terms of service and community standards. Postyon is not affiliated with or endorsed by LinkedIn.</P>
          </Section>

          <Section title="5. Your Content">
            <P>You retain ownership of all content you create using the Service. By publishing content through Postyon you represent that you have the right to publish it and that it does not violate any applicable law or third-party rights.</P>
            <P>You grant Postyon a limited licence to store, process, and transmit your content solely to operate and improve the Service. We do not sell your content to third parties.</P>
          </Section>

          <Section title="6. Prohibited Use">
            <P>You agree not to use the Service to:</P>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Publish spam, misleading, or deceptive content</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable law, including GDPR or intellectual property law</li>
              <li>Attempt to gain unauthorised access to any part of the Service or LinkedIn&rsquo;s systems</li>
              <li>Use automated means to scrape or extract data from the Service</li>
            </ul>
          </Section>

          <Section title="7. Subscription and Billing">
            <P>Certain features of Postyon require a paid subscription. Subscription fees are billed in advance on a monthly or annual basis. Fees are non-refundable except as required by law.</P>
            <P>We may change subscription pricing with 30 days&rsquo; notice. Continued use after the effective date constitutes acceptance of the new pricing.</P>
          </Section>

          <Section title="8. Limitation of Liability">
            <P>The Service is provided &ldquo;as is&rdquo; without warranty of any kind. To the maximum extent permitted by applicable law, {COMPANY} is not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</P>
            <P>Our total liability for any claim arising from these Terms shall not exceed the amount you paid to us in the three months preceding the claim.</P>
          </Section>

          <Section title="9. Termination">
            <P>You may delete your account at any time from your account settings. We may suspend or terminate your account if you breach these Terms, with or without notice depending on the severity of the breach.</P>
            <P>On termination, your right to use the Service ceases. Provisions that by their nature should survive termination (including content ownership and limitation of liability) will do so.</P>
          </Section>

          <Section title="10. Governing Law">
            <P>These Terms are governed by the laws of Denmark. Any disputes will be subject to the exclusive jurisdiction of the courts of Copenhagen, Denmark.</P>
            <P>If you are an EU consumer, you retain any mandatory protections afforded by the laws of your country of residence.</P>
          </Section>

          <Section title="11. Contact">
            <P>For questions about these Terms, contact us at: <a href="mailto:legal@postyon.com" style={{ color: 'var(--color-oxblood)', textDecoration: 'none', fontWeight: 600 }}>legal@postyon.com</a></P>
          </Section>

        </div>

        {/* Footer nav */}
        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 24, marginTop: 16, display: 'flex', gap: 24 }}>
          <Link href="/privacy" style={{ fontSize: 13, color: 'var(--color-ink-45)', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link href="/" style={{ fontSize: 13, color: 'var(--color-ink-45)', textDecoration: 'none' }}>
            Back to Postyon
          </Link>
        </div>

      </div>
    </main>
  )
}
