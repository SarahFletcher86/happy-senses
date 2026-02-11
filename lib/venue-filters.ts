import type { Venue, VenueFilters, SortOption } from './types';

/**
 * Filter venues based on criteria
 */
export function filterVenues(venues: Venue[], filters: VenueFilters): Venue[] {
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
export function sortVenues(venues: Venue[], sortBy: SortOption): Venue[] {
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
