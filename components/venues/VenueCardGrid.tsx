'use client';

import { VenueCard } from './VenueCard';
import type { Venue } from '@/lib/types';

interface VenueCardGridProps {
  venues: Venue[];
}

export function VenueCardGrid({ venues }: VenueCardGridProps) {
  if (venues.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {venues.map((venue) => (
        <VenueCard key={venue.slug} venue={venue} />
      ))}
    </div>
  );
}
