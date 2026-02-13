import { Sparkles } from 'lucide-react';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  const formattedCount = venueCount.toLocaleString('en-US');
  return (
    <header className="bg-[linear-gradient(120deg,_hsl(200_55%_90%),_hsl(270_35%_94%))]">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[hsl(38_70%_75%)]" />
          <span className="text-xs font-medium tracking-wide text-[color:var(--muted)]">
            Sensory-Friendly Directory
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold mb-3 text-[color:var(--text)]">
          Happy Senses
        </h1>
        <p className="text-base sm:text-lg text-[color:var(--text)]/85 max-w-2xl leading-relaxed">
          Discover inclusive spaces across Ontario designed for everyone. 
          Find venues with quiet rooms, trained staff, and sensory-friendly accommodations.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <span className="text-sm text-[color:var(--muted)]">
            {formattedCount} places • enrichment in progress
          </span>
        </div>
      </div>
    </header>
  );
}
