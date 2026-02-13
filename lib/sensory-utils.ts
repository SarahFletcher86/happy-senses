/**
 * Happy Senses - Pure Utility Functions
 * These functions don't have Node.js dependencies and can be used in client components
 */
import type { Venue, VenueFilters, SortOption } from './types';

/**
 * Get sensory level label for display
 */
export function getSensoryLevelLabel(value: number | null): string {
  if (value === null) return 'Unknown';
  if (value <= 1) return 'Very Low';
  if (value <= 2) return 'Low';
  if (value === 3) return 'Moderate';
  if (value <= 4) return 'High';
  return 'Very High';
}

/**
 * Get sensory level description for noise
 */
export function getNoiseDescription(value: number | null): string {
  if (value === null) return 'Noise level unknown';
  if (value <= 1) return 'Very quiet - minimal sound';
  if (value <= 2) return 'Quiet - calm environment';
  if (value === 3) return 'Moderate - typical noise levels';
  if (value <= 4) return 'Busy - noticeable noise';
  return 'Loud - high noise environment';
}

/**
 * Get sensory level description for light
 */
export function getLightDescription(value: number | null): string {
  if (value === null) return 'Lighting unknown';
  if (value <= 1) return 'Dim lighting - low stimulation';
  if (value <= 2) return 'Soft lighting - comfortable';
  if (value === 3) return 'Moderate lighting - standard';
  if (value <= 4) return 'Bright lighting - well-lit';
  return 'Very bright - high illumination';
}

/**
 * Get sensory level description for crowd
 */
export function getCrowdDescription(value: number | null): string {
  if (value === null) return 'Crowd level unknown';
  if (value <= 1) return 'Usually empty';
  if (value <= 2) return 'Light crowds';
  if (value === 3) return 'Moderate crowds';
  if (value <= 4) return 'Often crowded';
  return 'Very crowded - high traffic';
}

/**
 * Compute the overall sensory score for a venue (0-100)
 * Lower sensory burden = higher score
 */
export function computeOverallScore(venue: {
  sens_noise_1to5: number | null;
  sens_light_1to5: number | null;
  sens_crowd_1to5: number | null;
  sens_quiet_room: boolean | null;
  sens_headphones: boolean | null;
  sens_staff_trained: boolean | null;
  sens_certification: string | undefined;
  near_water: boolean | null;
  fenced: boolean | null;
}): number {
  // Base score from sensory scales (lower is better, so invert)
  const noise = venue.sens_noise_1to5 ?? 3;
  const light = venue.sens_light_1to5 ?? 3;
  const crowd = venue.sens_crowd_1to5 ?? 3;
  
  // Average of 1-5 scales, inverted to 0-4, then scaled to 0-60
  const sensoryAvg = (noise + light + crowd) / 3;
  const baseScore = ((5 - sensoryAvg) / 4) * 60;
  
  // Bonuses
  let bonus = 0;
  if (venue.sens_quiet_room === true) bonus += 10;
  if (venue.sens_headphones === true) bonus += 8;
  if (venue.sens_staff_trained === true) bonus += 12;
  if (venue.sens_certification) bonus += 10;
  
  // Penalties
  let penalty = 0;
  if (venue.near_water === true && venue.fenced !== true) penalty -= 10;
  if (venue.near_water === true && venue.fenced === true) penalty -= 3;
  
  // Final score bounded 0-100
  const score = Math.round(baseScore + bonus + penalty);
  return Math.max(0, Math.min(100, score));
}

/**
 * Filter venues based on criteria
 */
export function filterVenues(
  venues: Venue[],
  filters: VenueFilters
): Venue[] {
  return venues.filter(venue => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        venue.name.toLowerCase().includes(searchLower) ||
        venue.city.toLowerCase().includes(searchLower) ||
        venue.address.toLowerCase().includes(searchLower) ||
        venue.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'All' && venue.category !== filters.category) {
      return false;
    }

    // City filter
    if (filters.city && filters.city !== 'All' && venue.city !== filters.city) {
      return false;
    }

    // Sensory-friendly filter (any of: quiet room, headphones, staff trained)
    if (filters.sensory_friendly === true) {
      const hasSensoryFeature =
        venue.sens_quiet_room === true ||
        venue.sens_headphones === true ||
        venue.sens_staff_trained === true;
      if (!hasSensoryFeature) return false;
    }

    // Individual sensory filters
    if (filters.quiet_room === true && venue.sens_quiet_room !== true) return false;
    if (filters.headphones === true && venue.sens_headphones !== true) return false;
    if (filters.staff_trained === true && venue.sens_staff_trained !== true) return false;

    // Accessibility filters
    if (filters.accessible === true && venue.accessible !== true) return false;
    if (filters.fenced === true && venue.fenced !== true) return false;

    // Not near water filter
    if (filters.not_near_water === true && venue.near_water === true) return false;

    return true;
  });
}

/**
 * Sort venues based on criteria
 */
export function sortVenues(
  venues: Venue[],
  sortBy: SortOption
): Venue[] {
  const sorted = [...venues];

  switch (sortBy) {
    case 'sensory_score':
      return sorted.sort((a, b) => {
        const scoreA = a.sens_score_avg ?? 0;
        const scoreB = b.sens_score_avg ?? 0;
        return scoreB - scoreA; // Higher score first
      });

    case 'most_upvoted':
      return sorted.sort((a, b) => {
        const votesA = a.upvotes - a.downvotes;
        const votesB = b.upvotes - b.downvotes;
        return votesB - votesA;
      });

    case 'recently_verified':
      return sorted.sort((a, b) => {
        const dateA = a.sens_last_verified ? new Date(a.sens_last_verified).getTime() : 0;
        const dateB = b.sens_last_verified ? new Date(b.sens_last_verified).getTime() : 0;
        return dateB - dateA;
      });

    case 'closest_match':
      // Placeholder - would need lat/lng for location-based sorting
      return sorted;

    default:
      return sorted;
  }
}
