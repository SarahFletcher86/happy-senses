'use client';

import Link from 'next/link';
import { HappySensesLogo } from '@/components/HappySensesLogo';
import { ThemeControls } from './ThemeControls';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  return (
    <header className="border-b border-[rgba(44,51,56,0.08)] bg-cream/95 backdrop-blur dark:border-white/10 dark:bg-dark-bg/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <HappySensesLogo size={56} className="rounded-2xl" />
          <div>
            <div className="text-2xl font-bold tracking-tight text-charcoal dark:text-dark-text">
              Happy Senses
            </div>
            <p className="text-sm font-medium text-mid-gray dark:text-dark-text-soft">
              Sensory-friendly spaces for everyone
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mid-gray dark:text-dark-text-soft">
              {venueCount} spaces currently showing
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <ThemeControls />
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/about"
              className="rounded-full border border-[rgba(44,51,56,0.12)] px-4 py-2 text-sm font-semibold text-charcoal hover:border-calm-teal hover:text-calm-teal dark:border-white/10 dark:text-dark-text"
            >
              About
            </Link>
            <Link
              href="/add-venue"
              className="rounded-full bg-calm-teal px-4 py-2 text-sm font-semibold text-white shadow-card hover:translate-y-[-1px] hover:bg-[#4aa9a8]"
            >
              + Add a Venue
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
