'use client';

import Link from 'next/link';
import { MapPin, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SensoryBadge, SensoryPill } from './SensoryBadge';
import { SafetyBadge, WarningBadge } from './SafetyBadge';
import type { Venue } from '@/lib/types';

interface VenueCardProps {
  venue: Venue;
  onUpvote?: (slug: string) => void;
  onDownvote?: (slug: string) => void;
  localVotes?: { upvotes: number; downvotes: number };
}

export function VenueCard({ venue, onUpvote, onDownvote, localVotes }: VenueCardProps) {
  const score = venue.sens_score_avg ?? 0;
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Challenging';
    return 'High Sensory';
  };

  const upvotes = localVotes?.upvotes ?? venue.upvotes;
  const downvotes = localVotes?.downvotes ?? venue.downvotes;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className={cn(
        'block rounded-xl border border-[color:var(--border)]/80 bg-[color:var(--surface)] shadow-[0_2px_10px_rgba(15,23,42,0.06)]',
        'hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:border-[color:var(--border)] transition-all duration-200',
        'overflow-hidden group'
      )}
    >
      {/* Header with score and category */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[color:var(--border)]/60">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              venue.category === 'Park' ? 'bg-[hsl(150_35%_92%)] text-[hsl(150_35%_30%)] dark:bg-[hsl(150_20%_18%)] dark:text-[hsl(150_30%_80%)]' :
              venue.category === 'Community Centre' ? 'bg-[hsl(200_45%_92%)] text-[hsl(200_35%_30%)] dark:bg-[hsl(200_20%_18%)] dark:text-[hsl(200_30%_80%)]' :
              venue.category === 'Museum' ? 'bg-[hsl(22_70%_92%)] text-[hsl(22_45%_32%)] dark:bg-[hsl(22_25%_20%)] dark:text-[hsl(22_45%_80%)]' :
              venue.category === 'Library' ? 'bg-[hsl(38_65%_90%)] text-[hsl(38_45%_32%)] dark:bg-[hsl(38_25%_20%)] dark:text-[hsl(38_45%_80%)]' :
              'bg-[hsl(210_25%_94%)] text-[hsl(210_15%_35%)] dark:bg-[hsl(210_16%_20%)] dark:text-[hsl(210_14%_82%)]'
            )}>
              {venue.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[color:var(--text)] group-hover:text-[hsl(182_40%_35%)] transition-colors truncate">
            {venue.name}
          </h3>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-end gap-1">
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-white text-sm font-bold', getScoreColor(score))}>
            <span>{score}</span>
          </div>
          <span className="text-xs text-[color:var(--muted)]">{getScoreLabel(score)}</span>
        </div>
      </div>

      {/* Location */}
      <div className="px-4 py-2 flex items-center gap-1.5 text-sm text-[color:var(--muted)]">
        <MapPin className="w-4 h-4 flex-shrink-0 text-[color:var(--muted)]/70" />
        {(venue.city || venue.address) ? (
          <span className="truncate">
            {venue.city}{venue.city && venue.address && ' - '}{venue.address}
          </span>
        ) : (
          <span className="text-[color:var(--muted)]/70">Location available</span>
        )}
      </div>

      {/* Sensory Badges */}
      <div className="px-4 py-2 border-t border-[color:var(--border)]/60">
        <div className="flex flex-wrap gap-1.5">
          <SensoryBadge type="noise" value={venue.sens_noise_1to5} showLabel={false} />
          <SensoryBadge type="light" value={venue.sens_light_1to5} showLabel={false} />
          <SensoryBadge type="crowd" value={venue.sens_crowd_1to5} showLabel={false} />
        </div>
      </div>

      {/* Sensory Features */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5">
        {venue.sens_quiet_room === true && <SensoryPill type="quiet_room" available={venue.sens_quiet_room} />}
        {venue.sens_headphones === true && <SensoryPill type="headphones" available={venue.sens_headphones} />}
        {venue.sens_staff_trained === true && <SensoryPill type="staff_trained" available={venue.sens_staff_trained} />}
        {venue.sens_certification && <SensoryPill type="certified" available={true} />}
      </div>

      {/* Safety Warnings */}
      <div className="px-4 py-2">
        {venue.near_water === true && venue.fenced !== true && (
          <WarningBadge message="Near water - supervise children" />
        )}
        {venue.accessible === true && (
          <SafetyBadge type="accessible" value={venue.accessible} />
        )}
        {venue.fenced === true && (
          <SafetyBadge type="fenced" value={venue.fenced} />
        )}
        {venue.equipment_height && (
          <SafetyBadge type="equipment_height" value={undefined} heightValue={venue.equipment_height} />
        )}
      </div>

      {/* AI Summary Preview */}
      {venue.ai_accessibility_summary && (
        <div className="px-4 py-2 border-t border-[color:var(--border)]/60">
          <p className="text-xs text-[color:var(--muted)] line-clamp-2">
            {venue.ai_accessibility_summary}
          </p>
        </div>
      )}

      {/* Footer with voting and website */}
      <div className="px-4 py-3 bg-[color:var(--bg)] border-t border-[color:var(--border)]/60 flex items-center justify-between">
        {/* Voting */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onUpvote?.(venue.slug);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{upvotes}</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDownvote?.(venue.slug);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm font-medium">{downvotes}</span>
          </button>
        </div>

        {/* Website Link */}
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-[hsl(182_40%_35%)] hover:text-[hsl(182_45%_28%)]"
          >
            <span className="hidden sm:inline">Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </Link>
  );
}

interface VenueCardSkeletonProps {
  className?: string;
}

export function VenueCardSkeleton({ className }: VenueCardSkeletonProps) {
  return (
    <div className={cn('bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]/80 shadow-[0_2px_10px_rgba(15,23,42,0.06)] overflow-hidden animate-pulse', className)}>
      <div className="p-4 pb-3 border-b border-[color:var(--border)]/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-20 bg-[color:var(--border)]/60 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-[color:var(--border)]/60 rounded" />
      </div>
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-[color:var(--border)]/60 rounded-full" />
          <div className="h-6 w-16 bg-[color:var(--border)]/60 rounded-full" />
          <div className="h-6 w-16 bg-[color:var(--border)]/60 rounded-full" />
        </div>
      </div>
      <div className="px-4 py-3 bg-[color:var(--bg)]">
        <div className="flex gap-3">
          <div className="h-5 w-12 bg-[color:var(--border)]/60 rounded" />
          <div className="h-5 w-12 bg-[color:var(--border)]/60 rounded" />
        </div>
      </div>
    </div>
  );
}
