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
        'block bg-white rounded-xl border border-gray-200 shadow-sm',
        'hover:shadow-md hover:border-gray-300 transition-all duration-200',
        'overflow-hidden group'
      )}
    >
      {/* Header with score and category */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              venue.category === 'Park' ? 'bg-green-100 text-green-700' :
              venue.category === 'Community Centre' ? 'bg-blue-100 text-blue-700' :
              venue.category === 'Museum' ? 'bg-purple-100 text-purple-700' :
              venue.category === 'Library' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            )}>
              {venue.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {venue.name}
          </h3>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-end gap-1">
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-white text-sm font-bold', getScoreColor(score))}>
            <span>{score}</span>
          </div>
          <span className="text-xs text-gray-500">{getScoreLabel(score)}</span>
        </div>
      </div>

      {/* Location */}
      <div className="px-4 py-2 flex items-center gap-1.5 text-sm text-gray-600">
        <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
        {(venue.city || venue.address) ? (
          <span className="truncate">
            {venue.city}{venue.city && venue.address && ' - '}{venue.address}
          </span>
        ) : (
          <span className="text-gray-400">Location available</span>
        )}
      </div>

      {/* Sensory Badges */}
      <div className="px-4 py-2 border-t border-gray-100">
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
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-2">
            {venue.ai_accessibility_summary}
          </p>
        </div>
      )}

      {/* Footer with voting and website */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
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
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
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
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse', className)}>
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex gap-3">
          <div className="h-5 w-12 bg-gray-200 rounded" />
          <div className="h-5 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
