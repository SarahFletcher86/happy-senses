'use client';

import Link from 'next/link';
import { ExternalLink, MapPin, ThumbsDown, ThumbsUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplaySensoryValue } from '@/lib/sensory-utils';
import { SafetyBadge } from './SafetyBadge';
import { SensoryPill } from './SensoryBadge';
import type { Venue } from '@/lib/types';

interface VenueCardProps {
  venue: Venue;
  onUpvote?: (slug: string) => void;
  onDownvote?: (slug: string) => void;
  localVotes?: { upvotes: number; downvotes: number };
}

const categoryStyles: Record<string, string> = {
  Library:
    'bg-[rgba(184,221,232,0.5)] text-[#2B6478] dark:bg-[rgba(184,221,232,0.10)] dark:text-[#C4E2EE]',
  Museum:
    'bg-[rgba(244,168,146,0.3)] text-[#B25938] dark:bg-[rgba(244,168,146,0.10)] dark:text-[#F8C4B0]',
  Park:
    'bg-[rgba(168,216,168,0.3)] text-[#3F7A3F] dark:bg-[rgba(168,216,168,0.08)] dark:text-[#B5DCB5]',
  'Community Centre':
    'bg-[rgba(91,184,183,0.18)] text-[#2F7372] dark:bg-[rgba(91,184,183,0.10)] dark:text-[#8DD3D2]',
  'Cafe / Restaurant':
    'bg-[rgba(229,185,98,0.22)] text-[#8A631E] dark:bg-[rgba(229,185,98,0.12)] dark:text-[#F2D08B]',
  'Indoor Play':
    'bg-[rgba(244,168,146,0.24)] text-[#B25938] dark:bg-[rgba(244,168,146,0.12)] dark:text-[#F8C4B0]',
};

const tierStyles: Record<string, string> = {
  'Trusted ✓': 'bg-gentle-green text-[#305C30]',
  'Promising ⚡': 'bg-warm-mustard text-[#63450A]',
  'Help us verify ?': 'bg-soft-peach text-[#823E25]',
};

export function VenueCard({ venue, onUpvote, onDownvote, localVotes }: VenueCardProps) {
  const upvotes = localVotes?.upvotes ?? venue.community_upvotes;
  const downvotes = localVotes?.downvotes ?? venue.community_downvotes;
  const helpful = upvotes - downvotes;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group block rounded-[28px] border border-[rgba(44,51,56,0.08)] bg-white p-5 shadow-card transition hover:translate-y-[-3px] hover:border-calm-teal dark:border-white/10 dark:bg-dark-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex rounded-full px-3 py-1.5 text-xs font-semibold',
            categoryStyles[venue.category] ??
              'bg-[rgba(91,184,183,0.15)] text-[#2F7372] dark:bg-[rgba(91,184,183,0.1)] dark:text-[#8DD3D2]'
          )}
        >
          {venue.category}
        </span>
        <span
          className={cn(
            'inline-flex rounded-full px-3 py-1.5 text-xs font-semibold',
            tierStyles[venue.tier] ?? tierStyles['Help us verify ?']
          )}
        >
          {venue.tier}
        </span>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold text-charcoal transition group-hover:text-calm-teal dark:text-dark-text">
          {venue.name}
        </h2>
        <div className="mt-2 flex items-start gap-2 text-sm text-mid-gray dark:text-dark-text-soft">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            {[venue.city, venue.address].filter(Boolean).join(' · ') || 'Address details coming soon'}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <SensoryDots label="Quiet level" emoji="🤫" value={venue.sens_noise_1to5} />
        <SensoryDots label="Calm lighting" emoji="💡" value={venue.sens_light_1to5} />
        <SensoryDots label="Low crowd" emoji="👥" value={venue.sens_crowd_1to5} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <SensoryPill type="quiet_room" available={venue.sens_quiet_room} />
        <SensoryPill type="headphones" available={venue.sens_headphones} />
        <SensoryPill type="staff_trained" available={venue.sens_staff_trained} />
        <SensoryPill type="certified" available={Boolean(venue.sens_certification)} />
        <SafetyBadge type="fenced" value={venue.fenced} />
        <SafetyBadge type="near_water" value={venue.near_water} />
        <SafetyBadge type="accessible" value={venue.accessible} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[rgba(44,51,56,0.08)] pt-4 text-sm dark:border-white/10">
        <div className="flex items-center gap-2 text-mid-gray dark:text-dark-text-soft">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onUpvote?.(venue.slug);
            }}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[rgba(168,216,168,0.2)] dark:hover:bg-[rgba(168,216,168,0.12)]"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onDownvote?.(venue.slug);
            }}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[rgba(244,168,146,0.18)] dark:hover:bg-[rgba(244,168,146,0.12)]"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
          <span className="font-semibold text-charcoal dark:text-dark-text">{helpful}</span>
          <span>helpful votes</span>
        </div>

        <div className="flex items-center gap-3 text-mid-gray dark:text-dark-text-soft">
          {venue.google_rating ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-warm-mustard text-warm-mustard" />
              {venue.google_rating.toFixed(1)} ({venue.google_review_count ?? 0})
            </span>
          ) : null}
          {venue.website ? (
            <span className="inline-flex items-center gap-1 text-calm-teal">
              Website <ExternalLink className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function SensoryDots({
  label,
  emoji,
  value,
}: {
  label: string;
  emoji: string;
  value: number | null;
}) {
  const display = getDisplaySensoryValue(value);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 text-sm font-semibold text-charcoal dark:text-dark-text">
        <span className="mr-2">{emoji}</span>
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = display !== null && index < display;
          const filledClass =
            display !== null && display >= 4
              ? 'bg-gentle-green'
              : display === 3
                ? 'bg-warm-mustard'
                : 'bg-soft-peach';

          return (
            <span
              key={`${label}-${index}`}
              className={cn(
                'h-3 w-3 rounded-full',
                filled
                  ? filledClass
                  : 'bg-[rgba(142,151,163,0.28)] dark:bg-[rgba(149,160,170,0.2)]'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
