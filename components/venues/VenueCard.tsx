'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplaySensoryValue } from '@/lib/sensory-utils';
import { SafetyBadge } from './SafetyBadge';
import { SensoryPill } from './SensoryBadge';
import type { Venue } from '@/lib/types';

interface VenueCardProps {
  venue: Venue;
  localVotes?: { upvotes: number; downvotes: number };
}

const categoryStyles: Record<string, string> = {
  Library:
    'bg-[rgba(184,221,232,0.60)] text-[#2B6478] dark:bg-[rgba(184,221,232,0.20)] dark:text-[#C4E2EE]',
  Museum:
    'bg-[rgba(244,168,146,0.40)] text-[#B25938] dark:bg-[rgba(244,168,146,0.20)] dark:text-[#F8C4B0]',
  Park:
    'bg-[rgba(168,216,168,0.40)] text-[#3F7A3F] dark:bg-[rgba(168,216,168,0.20)] dark:text-[#B5DCB5]',
  'Community Centre':
    'bg-[rgba(91,184,183,0.50)] text-[#155251] dark:bg-[rgba(91,184,183,0.28)] dark:text-[#8DD3D2]',
  'Cafe / Restaurant':
    'bg-[rgba(245,216,108,0.55)] text-[#6B5418] dark:bg-[rgba(245,216,108,0.22)] dark:text-[#F5D86C]',
};

const tierStyles: Record<string, string> = {
  '✓ Trusted': 'bg-[rgba(168,216,168,0.45)] text-[#2B5C2B] dark:bg-[rgba(168,216,168,0.22)] dark:text-[#DDF2DD]',
  Promising: 'bg-[rgba(245,216,108,0.65)] text-[#6B5418] dark:bg-[rgba(245,216,108,0.26)] dark:text-[#F8E1A5]',
  'Help us verify':
    'bg-[rgba(244,168,146,0.45)] text-[#8B3F22] dark:bg-[rgba(244,168,146,0.22)] dark:text-[#FCD8C8]',
};

export function VenueCard({ venue, localVotes }: VenueCardProps) {
  const upvotes = localVotes?.upvotes ?? venue.community_upvotes;
  const downvotes = localVotes?.downvotes ?? venue.community_downvotes;
  const totalCommunityVotes = upvotes + downvotes;
  const tierLabel = venue.tier || 'Help us verify';
  const activeAmenities = [
    venue.sens_quiet_room ? <SensoryPill key="quiet-room" type="quiet_room" available={venue.sens_quiet_room} /> : null,
    venue.sens_headphones ? <SensoryPill key="headphones" type="headphones" available={venue.sens_headphones} /> : null,
    venue.sens_staff_trained ? (
      <SensoryPill key="staff-trained" type="staff_trained" available={venue.sens_staff_trained} />
    ) : null,
    venue.sens_certification ? <SensoryPill key="certified" type="certified" available /> : null,
    venue.fenced ? <SafetyBadge key="fenced" type="fenced" value={venue.fenced} /> : null,
    venue.accessible ? <SafetyBadge key="accessible" type="accessible" value={venue.accessible} /> : null,
    venue.near_water === false ? <SafetyBadge key="near-water" type="near_water" value={false} /> : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="venue-card group flex h-full flex-col gap-[14px] rounded-2xl border border-border-subtle bg-white p-[22px] transition duration-200 hover:-translate-y-0.5 hover:border-calm-teal hover:shadow-[0_8px_24px_rgba(91,184,183,0.12)] dark:border-dark-border dark:bg-dark-card dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)] dark:hover:border-dark-cta-teal dark:hover:shadow-[0_12px_32px_rgba(111,207,206,0.18)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-[5px] text-[12px] font-semibold',
            categoryStyles[venue.category] ??
              'bg-[rgba(142,151,163,0.18)] text-[#5F6873] dark:bg-[rgba(142,151,163,0.16)] dark:text-[#D5D9DE]'
          )}
        >
          {venue.category}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-[5px] text-[11px] font-semibold',
            tierStyles[tierLabel] ?? tierStyles['Help us verify']
          )}
        >
          {tierLabel}
        </span>
      </div>

      <div>
        <h2 className="text-[19px] font-bold leading-[1.3] tracking-[-0.2px] text-charcoal transition group-hover:text-calm-teal dark:text-dark-text-heading dark:group-hover:text-dark-cta-teal">
          {venue.name}
        </h2>
        <div className="mt-1 inline-flex items-start gap-1 text-[13px] font-medium text-mid-gray dark:text-dark-text-muted">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            {[venue.city, venue.address].filter(Boolean).join(' · ') || 'Address details coming soon'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[9px] border-y border-border-subtle py-3 dark:border-dark-border">
        <SensoryDots label="Quiet" emoji="🤫" value={venue.sens_noise_1to5} />
        <SensoryDots label="Calm light" emoji="💡" value={venue.sens_light_1to5} />
        <SensoryDots label="Low crowd" emoji="👥" value={venue.sens_crowd_1to5} />
      </div>

      {activeAmenities.length > 0 ? <div className="flex flex-wrap gap-2">{activeAmenities}</div> : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-[12px] font-medium text-mid-gray dark:text-dark-text-muted">
        <span>{totalCommunityVotes} community votes</span>
        <span className="inline-flex items-center gap-1 text-mid-gray dark:text-dark-text-muted">
          {venue.google_rating ? (
            <>
              <span className="text-warm-mustard">★</span>
              <strong className="font-semibold text-charcoal dark:text-dark-text-heading">
                {venue.google_rating.toFixed(1)}
              </strong>
              <span>· {venue.google_review_count ?? 0} Google reviews</span>
            </>
          ) : (
            <span>No Google reviews yet</span>
          )}
        </span>
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
    <div className="flex items-center gap-[10px] text-[13px] text-charcoal dark:text-dark-text-primary">
      <span className="w-5 text-center text-[14px]">{emoji}</span>
      <span className="min-w-[50px] text-[11px] font-medium uppercase tracking-[0.2px] text-mid-gray dark:text-dark-text-dim">
        {label}
      </span>
      <div className="flex flex-1 items-center gap-1">
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
                'h-[13px] w-[13px] rounded-full',
                filled ? filledClass : 'bg-[#E0E5E0] dark:bg-[#3A4A50]'
              )}
            />
          );
        })}
      </div>
      <span className="w-[26px] text-right text-[11px] font-semibold text-mid-gray dark:text-dark-text-muted">
        {display ?? 0}/5
      </span>
    </div>
  );
}
