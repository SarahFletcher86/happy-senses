'use client';

import Link from 'next/link';
import { HappySensesLogo } from '@/components/HappySensesLogo';
import { ThemeControls } from './ThemeControls';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-cream dark:border-dark-border dark:bg-dark-bg">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-6 pt-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <HappySensesLogo size={56} className="rounded-2xl" />
          <div>
            <div className="text-[28px] font-bold tracking-[-0.4px] text-charcoal dark:text-dark-text-heading">
              Happy Senses
            </div>
            <p className="text-[13px] font-medium text-mid-gray dark:text-dark-text-muted">
              Sensory-friendly spaces for everyone
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mid-gray dark:text-dark-text-dim">
              {venueCount} spaces currently showing
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <ThemeControls />
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-transparent bg-transparent px-[18px] py-[9px] text-[13px] font-semibold text-charcoal hover:bg-[rgba(91,184,183,0.10)] hover:text-calm-teal dark:text-dark-text-primary dark:hover:bg-[rgba(111,207,206,0.12)] dark:hover:text-dark-cta-teal"
            >
              About
            </Link>
            <Link
              href="/add-venue"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-calm-teal bg-calm-teal px-[18px] py-[9px] text-[13px] font-semibold text-white hover:bg-calm-teal-deep dark:border-dark-cta-teal dark:bg-dark-cta-teal dark:text-[#14201F] dark:shadow-[0_2px_8px_rgba(111,207,206,0.3)] dark:hover:bg-[#8FE0DF]"
            >
              + Add a Venue
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
