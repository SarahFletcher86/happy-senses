'use client';

import { useState } from 'react';
import { VenueCard } from './VenueCard';
import type { Venue } from '@/lib/types';

interface VenueCardGridProps {
  venues: Venue[];
}

export function VenueCardGrid({ venues }: VenueCardGridProps) {
  const [localVotes, setLocalVotes] = useState<Record<string, { upvotes: number; downvotes: number }>>({});

  const handleVote = async (slug: string, type: 'up' | 'down') => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type }),
      });

      if (!response.ok) return;
      const data = await response.json();
      setLocalVotes((current) => ({
        ...current,
        [slug]: { upvotes: data.upvotes, downvotes: data.downvotes },
      }));
    } catch (error) {
      console.error('Error submitting vote', error);
    }
  };

  if (venues.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {venues.map((venue) => (
        <VenueCard
          key={venue.slug}
          venue={venue}
          onUpvote={(slug) => handleVote(slug, 'up')}
          onDownvote={(slug) => handleVote(slug, 'down')}
          localVotes={localVotes[venue.slug]}
        />
      ))}
    </div>
  );
}
