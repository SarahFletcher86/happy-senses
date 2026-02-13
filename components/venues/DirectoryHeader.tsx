import { Sparkles } from 'lucide-react';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  const formattedCount = venueCount.toLocaleString('en-US');
  return (
    <header className="bg-[linear-gradient(120deg,_hsl(200_45%_74%),_hsl(270_28%_78%))] text-white dark:bg-[linear-gradient(120deg,_hsl(210_22%_12%),_hsl(200_25%_16%),_hsl(210_18%_10%))]">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[hsl(45_80%_78%)] dark:text-[hsl(45_60%_65%)]" />
          <span className="text-xs font-medium tracking-wide text-white/80">
            Sensory-Friendly Directory
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold mb-3 text-white">
          Happy Senses
        </h1>
        <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
          Discover inclusive spaces across Ontario designed for everyone. 
          Find venues with quiet rooms, trained staff, and sensory-friendly accommodations.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <span className="text-sm text-white/75">
            {formattedCount} places • enrichment in progress
          </span>
        </div>
      </div>
    </header>
  );
}
