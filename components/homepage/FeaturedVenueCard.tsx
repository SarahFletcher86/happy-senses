import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplaySensoryValue } from '@/lib/sensory-utils';
import type { FeaturedVenue } from '@/lib/featured';

const categoryEmoji: Record<string, string> = {
  'Library': '📚',
  'Museum': '🎨',
  'Park': '🌿',
  'Community Centre': '🏛️',
  'Cafe / Restaurant': '☕',
  'Restaurant': '🍽️',
  'Café': '☕',
  'Cafe': '☕',
};

const tierStyles: Record<string, string> = {
  'Tier 1 - Verified':
    'bg-[rgba(181,220,181,0.82)] text-[#4A7A4A] dark:bg-[rgba(168,216,168,0.24)] dark:text-[#B5DCB5]',
  'Tier 2 - Likely':
    'bg-[rgba(196,226,238,0.85)] text-[#2F6985] dark:bg-[rgba(184,221,232,0.24)] dark:text-[#C4E2EE]',
  'Tier 3 - Needs Verification':
    'bg-[rgba(248,196,176,0.78)] text-[#A24E2A] dark:bg-[rgba(244,168,146,0.24)] dark:text-[#F8C4B0]',
};

interface FeaturedVenueCardProps {
  venue: FeaturedVenue;
}

export function FeaturedVenueCard({ venue }: FeaturedVenueCardProps) {
  const placeholderEmoji = categoryEmoji[venue.category] ?? '📍';
  const tierLabel = venue.tier.replace(/^Tier \d - /, '');

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--cream)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--calm-teal)] hover:shadow-[0_8px_24px_rgba(91,184,183,0.12)] dark:border-[var(--dark-border)] dark:bg-[#232C36] dark:hover:border-[#6FCFCE] dark:hover:shadow-[0_12px_32px_rgba(111,207,206,0.18)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        {venue.featuredPhotoUrl ? (
          <img
            src={venue.featuredPhotoUrl}
            alt={venue.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--light-cream)] dark:bg-[#1F2A2F]">
            <span className="text-[48px]">{placeholderEmoji}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-[18px]">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-[5px] text-[11px] font-semibold',
              tierStyles[venue.tier] ?? tierStyles['Tier 3 - Needs Verification']
            )}
          >
            {tierLabel}
          </span>
        </div>

        <h3 className="text-[17px] font-bold leading-[1.3] tracking-[-0.1px] text-[var(--charcoal)] transition group-hover:text-[var(--calm-teal)] dark:text-[#FBF5E5] dark:group-hover:text-[#6FCFCE]">
          {venue.name}
        </h3>

        <div className="inline-flex items-start gap-1 text-[13px] font-medium text-[var(--mid-gray)] dark:text-[#C8C0B2]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{venue.city}</span>
        </div>

        <div className="mt-auto flex flex-col gap-[7px] border-t border-[var(--border-subtle)] pt-3 dark:border-[rgba(255,255,255,0.08)]">
          <SensoryDots label="Quiet" value={venue.sensory.quiet} />
          <SensoryDots label="Calm light" value={venue.sensory.light} />
          <SensoryDots label="Low crowd" value={venue.sensory.crowd} />
        </div>
      </div>
    </Link>
  );
}

function SensoryDots({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const display = getDisplaySensoryValue(value);

  return (
    <div className="flex items-center gap-[8px] text-[12px] text-[var(--charcoal)] dark:text-[#F5EFE5]">
      <span className="min-w-[44px] text-[11px] font-medium uppercase tracking-[0.2px] text-[var(--mid-gray)] dark:text-[#ADA590]">
        {label}
      </span>
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = display !== null && index < display;
          return (
            <span
              key={`${label}-${index}`}
              className={cn(
                'venue-card-dot h-[10px] w-[10px] rounded-full',
                filled
                  ? display && display >= 4
                    ? 'bg-[var(--gentle-green)] dark:bg-[#B5DCB5]'
                    : display === 3
                      ? 'bg-[var(--soft-peach)] dark:bg-[#F5D86C]'
                      : 'bg-[var(--soft-peach)] dark:bg-[#F4A892]'
                  : 'bg-[rgba(26,32,36,0.12)] dark:bg-[rgba(248,242,229,0.18)]'
              )}
            />
          );
        })}
      </div>
      <span className="w-[22px] text-right text-[11px] font-semibold text-[var(--mid-gray)] dark:text-[#C8C0B2]">
        {display ?? 0}/5
      </span>
    </div>
  );
}
