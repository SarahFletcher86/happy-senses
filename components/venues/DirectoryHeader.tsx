import { Sparkles } from 'lucide-react';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <span className="text-sm font-medium text-blue-100">Sensory-Friendly Directory</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Happy Senses</h1>
        <p className="text-lg text-blue-100 max-w-2xl">
          Discover inclusive spaces across Ontario designed for everyone. 
          Find venues with quiet rooms, trained staff, and sensory-friendly accommodations.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-blue-200">
            {venueCount} venue{venueCount !== 1 ? 's' : ''} in our directory
          </span>
        </div>
      </div>
    </header>
  );
}
