import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/app/components/theme-toggle';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <span className="text-sm font-medium text-violet-100 font-subtitle">Ontario Sensory-Friendly Directory</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 font-title">Happy Senses</h1>
            <p className="max-w-2xl text-lg text-violet-100">
              Find inclusive parks, libraries, museums, and family spaces with sensory ratings, safety notes,
              and accessibility support details.
            </p>
            <p className="mt-4 text-sm text-violet-200">{venueCount} venues currently listed</p>
          </div>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
