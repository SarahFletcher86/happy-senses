'use client';

import { useState } from 'react';
import { VenueCard } from './VenueCard';
import type { Venue } from '@/lib/types';

interface VenueCardGridProps {
  venues: Venue[];
}

export function VenueCardGrid({ venues }: VenueCardGridProps) {
  // Local state for optimistic UI updates
  const [localVotes, setLocalVotes] = useState<Record<string, { upvotes: number; downvotes: number }>>({});

  const handleVote = async (slug: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, direction }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalVotes(prev => ({
          ...prev,
          [slug]: { upvotes: data.upvotes, downvotes: data.downvotes },
        }));
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  if (venues.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 py-2">
      {venues.map(venue => (
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
