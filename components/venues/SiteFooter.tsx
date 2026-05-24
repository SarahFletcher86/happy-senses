import Link from 'next/link';
import { HappySensesLogo } from '@/components/HappySensesLogo';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--cream)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-bg)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.25fr_repeat(3,minmax(0,1fr))]">
        <div className="flex items-start gap-4">
          <HappySensesLogo size={56} className="rounded-2xl" />
          <p className="max-w-[220px] text-lg leading-8 text-charcoal dark:text-dark-text-primary">
            A community-curated directory of sensory-friendly spaces.
          </p>
        </div>

        <div>
          <h2 className="text-[28px] font-semibold text-charcoal dark:text-dark-text-heading">Explore</h2>
          <div className="mt-4 grid gap-3 text-lg text-mid-gray dark:text-dark-text-muted">
            <Link href="/">Directory</Link>
            <a href="https://blog.happysenses.ca" target="_blank" rel="noreferrer">
              The Journal
            </a>
            <a href="https://blog.happysenses.ca" target="_blank" rel="noreferrer">
              Newsletter
            </a>
            <Link href="/add-venue">Add a Venue</Link>
          </div>
        </div>

        <div>
          <h2 className="text-[28px] font-semibold text-charcoal dark:text-dark-text-heading">Trust</h2>
          <div className="mt-4 grid gap-3 text-lg text-mid-gray dark:text-dark-text-muted">
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="/community-guidelines">Community Guidelines</a>
          </div>
        </div>

        <div>
          <h2 className="text-[28px] font-semibold text-charcoal dark:text-dark-text-heading">Get in touch</h2>
          <div className="mt-4 grid gap-3 text-lg text-mid-gray dark:text-dark-text-muted">
            <a href="mailto:sarah@happysenses.ca">Contact</a>
            <Link href="/add-venue">Submissions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
