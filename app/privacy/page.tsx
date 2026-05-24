import type { Metadata } from 'next';
import { SiteFooter } from '@/components/venues/SiteFooter';
import { SiteHeader } from '@/components/venues/SiteHeader';

export const metadata: Metadata = {
  title: 'Privacy — Happy Senses',
  description:
    'How Happy Senses handles your data. Plain-language privacy policy covering the directory at happysenses.ca.',
};

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
      {children}
    </a>
  );
}

function MailLink() {
  return (
    <a href="mailto:sarah@happysenses.ca" className="font-semibold underline underline-offset-4">
      sarah@happysenses.ca
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--mint)] font-[family-name:var(--font-quicksand)] text-charcoal [body.easier-reading_&]:font-[family-name:var(--font-lexend)] [body.easier-reading_&]:leading-[1.65] [body.easier-reading_&]:tracking-[0.01em] dark:bg-[var(--dark-bg)] dark:text-dark-text-primary">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-50 rounded-xl bg-[var(--cream)] px-4 py-3 text-sm font-semibold text-charcoal shadow-[0_2px_10px_rgba(44,51,56,0.03)] focus:not-sr-only dark:bg-[var(--dark-card)] dark:text-dark-text-heading"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <article className="mx-auto max-w-[720px] rounded-[32px] border border-[var(--border-subtle)] bg-[var(--cream)] px-6 py-10 shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-card)] md:px-10">
          <header className="text-center">
            <h1 className="text-4xl font-semibold text-charcoal dark:text-dark-text-heading md:text-5xl">
              Privacy
            </h1>
            <p className="mt-4 text-base italic text-mid-gray dark:text-dark-text-muted">
              Last updated: May 24, 2026
            </p>
          </header>

          <div className="mt-10 space-y-9 text-lg leading-8 text-charcoal dark:text-dark-text-primary">
            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">Who we are</h2>
              <p className="mt-4">
                Happy Senses is a Canadian-built directory of sensory-friendly spaces. The site is run by
                Sarah Fletcher in Belleville, Ontario. You can reach me directly at <MailLink />.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                What this policy covers
              </h2>
              <p className="mt-4">
                This policy covers the Happy Senses directory at happysenses.ca and its subpages. Our
                newsletter and blog are hosted on Beehiiv — they have their own privacy policy at{' '}
                <ExternalLink href="https://blog.happysenses.ca/p/privacy">
                  blog.happysenses.ca/p/privacy
                </ExternalLink>{' '}
                that covers what Beehiiv collects on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                What we collect on the directory
              </h2>
              <ul className="mt-4 space-y-4">
                <li className="ml-5 list-disc pl-1">
                  <strong>Community submissions.</strong> When you submit a venue using our "Add a Venue"
                  form, we collect what you tell us — the venue name, location, your sensory observations,
                  and (optionally) your name and email if you choose to include them.
                </li>
                <li className="ml-5 list-disc pl-1">
                  <strong>Ratings and notes.</strong> When you vote on a venue or leave a note, we record
                  your vote or note. If you include a name or email with a note, we store that too.
                </li>
                <li className="ml-5 list-disc pl-1">
                  <strong>Site usage.</strong> Like most websites, we keep basic anonymous analytics —
                  pages visited, time on site, general location at the city level (not your address) — so
                  we can understand what's working and what isn't.
                </li>
                <li className="ml-5 list-disc pl-1">
                  <strong>Cookies.</strong> We use a small number of technical cookies — for instance, to
                  remember your "Easier reading" or "Dark mode" preference. We don't use advertising
                  cookies. We don't sell your data.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                What we don't collect
              </h2>
              <p className="mt-4">
                We don't have user accounts on the directory (yet — that may change as we grow). We don't
                collect health information, neurodivergence diagnoses, or family details. You don't have to
                identify yourself to use Happy Senses.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                How we use what we collect
              </h2>
              <ul className="mt-4 space-y-3">
                <li className="ml-5 list-disc pl-1">To run the directory and improve it</li>
                <li className="ml-5 list-disc pl-1">To review community submissions before they go live</li>
                <li className="ml-5 list-disc pl-1">To respond to questions you send us</li>
                <li className="ml-5 list-disc pl-1">
                  To track which venues are working for the community and which still need more verification
                </li>
              </ul>
              <p className="mt-4">
                We don't use any of this for advertising. We don't sell it. We don't share it with data
                brokers.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                Who handles data on our behalf
              </h2>
              <p className="mt-4">
                We use a small number of trusted services to run Happy Senses. They each have their own
                privacy policies — links below:
              </p>
              <ul className="mt-4 space-y-4">
                <li className="ml-5 list-disc pl-1">
                  <strong>Airtable</strong> — stores the venue directory and community submissions, votes,
                  and notes. <ExternalLink href="https://airtable.com/privacy">airtable.com/privacy</ExternalLink>
                </li>
                <li className="ml-5 list-disc pl-1">
                  <strong>Vercel</strong> — hosts the website.{' '}
                  <ExternalLink href="https://vercel.com/legal/privacy-policy">
                    vercel.com/legal/privacy-policy
                  </ExternalLink>
                </li>
                <li className="ml-5 list-disc pl-1">
                  <strong>Beehiiv</strong> — hosts our newsletter and blog.{' '}
                  <ExternalLink href="https://beehiiv.com/privacy">beehiiv.com/privacy</ExternalLink>
                </li>
                <li className="ml-5 list-disc pl-1">
                  <strong>Hostinger</strong> — manages our domain and email inbox.{' '}
                  <ExternalLink href="https://www.hostinger.com/legal/privacy-policy">
                    hostinger.com/legal/privacy-policy
                  </ExternalLink>
                </li>
              </ul>
              <p className="mt-4">
                We chose each of these specifically because their data practices match what we'd want as
                users — minimal collection, clear policies, no resale to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                Your rights under{' '}
                <ExternalLink href="https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/">
                  PIPEDA
                </ExternalLink>
              </h2>
              <p className="mt-4">
                As a Canadian site, we follow PIPEDA (Personal Information Protection and Electronic
                Documents Act). You have the right to:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="ml-5 list-disc pl-1">Know what information we have about you</li>
                <li className="ml-5 list-disc pl-1">Ask for a copy of it</li>
                <li className="ml-5 list-disc pl-1">Ask us to correct it if it's wrong</li>
                <li className="ml-5 list-disc pl-1">Ask us to delete it (where we're legally allowed to)</li>
                <li className="ml-5 list-disc pl-1">Withdraw consent for any future use</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, email <MailLink /> and I'll respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                Children's information
              </h2>
              <p className="mt-4">
                Happy Senses is built for sensory-sensitive humans of all ages, including kids. We do not
                knowingly collect personal information from children under 13. Our forms are designed for
                adults to use. If we discover we've inadvertently collected a child's information, we'll
                delete it.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                Changes to this policy
              </h2>
              <p className="mt-4">
                If we update this policy, we'll change the "Last updated" date at the top. For significant
                changes — like adding a new third party — we'll also flag it on the homepage for at least
                30 days.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-charcoal dark:text-dark-text-heading">
                Questions or concerns
              </h2>
              <p className="mt-4">Email <MailLink />. I read every email.</p>
              <p className="mt-4">
                If you're not satisfied with how I respond, you can also contact the Office of the Privacy
                Commissioner of Canada at{' '}
                <ExternalLink href="https://priv.gc.ca">priv.gc.ca</ExternalLink>.
              </p>
            </section>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
