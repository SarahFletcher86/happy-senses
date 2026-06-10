import Link from 'next/link';
import { HappySensesLogo } from '@/components/HappySensesLogo';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--cream)] dark:border-[rgba(248,242,229,0.08)] dark:bg-[#1A2024]">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-start gap-3">
              <HappySensesLogo size={44} className="rounded-xl" />
              <div>
                <p className="font-[family-name:var(--font-fraunces)] text-[20px] font-semibold text-[var(--charcoal)] dark:text-[#F8F2E5]">
                  Happy Senses
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-fraunces)] text-[15px] italic text-[var(--mid-gray)] dark:text-[#ADA590]">
                  Finding calmer spaces, together.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--charcoal)] dark:text-[#FBF5E5]">
              Directory
            </h3>
            <div className="grid gap-2.5 text-[14px] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
              <Link href="/directory" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Browse all venues
              </Link>
              <Link href="/directory?view=cities" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                By city
              </Link>
              <Link href="/directory?view=categories" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                By category
              </Link>
              <Link href="/submit" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Add a venue
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--charcoal)] dark:text-[#FBF5E5]">
              Read &amp; Listen
            </h3>
            <div className="grid gap-2.5 text-[14px] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
              <a
                href="https://blog.happysenses.ca"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]"
              >
                The Journal
              </a>
              <Link href="/#newsletter" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Quiet Hours newsletter
              </Link>
              <Link href="/glossary" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Sensory glossary
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--charcoal)] dark:text-[#FBF5E5]">
              About
            </h3>
            <div className="grid gap-2.5 text-[14px] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
              <Link href="/about" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Who runs this
              </Link>
              <Link href="/about#tiers" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                How tiers work
              </Link>
              <Link href="/accessibility" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Accessibility
              </Link>
              <Link href="/privacy" className="transition hover:text-[var(--calm-teal)] dark:hover:text-[#6FCFCE]">
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-6 text-[13px] text-[var(--mid-gray)] dark:border-[rgba(248,242,229,0.08)] dark:text-[#A8B0B8] sm:flex-row">
          <span>&copy; 2026 Happy Senses &middot; sarah@happysenses.ca</span>
          <span>Made with care in Belleville, Ontario</span>
        </div>
      </div>
    </footer>
  );
}
