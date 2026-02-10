import type { SortOption, Venue, VenueFilters } from '@/lib/types';

export function filterVenues(venues: Venue[], filters: VenueFilters): Venue[] {
  return venues.filter((venue) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        venue.name.toLowerCase().includes(searchLower) ||
        venue.city.toLowerCase().includes(searchLower) ||
        venue.address.toLowerCase().includes(searchLower) ||
        venue.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.category && filters.category !== 'All' && venue.category !== filters.category) return false;
    if (filters.city && filters.city !== 'All' && venue.city !== filters.city) return false;
    if (filters.sensory_friendly === true) {
      if (!(venue.sens_quiet_room === true || venue.sens_headphones === true || venue.sens_staff_trained === true)) return false;
    }
    if (filters.quiet_room === true && venue.sens_quiet_room !== true) return false;
    if (filters.headphones === true && venue.sens_headphones !== true) return false;
    if (filters.staff_trained === true && venue.sens_staff_trained !== true) return false;
    if (filters.accessible === true && venue.accessible !== true) return false;
    if (filters.fenced === true && venue.fenced !== true) return false;
    if (filters.not_near_water === true && venue.near_water === true) return false;
    return true;
  });
}

export function sortVenues(venues: Venue[], sortBy: SortOption): Venue[] {
  const sorted = [...venues];
  switch (sortBy) {
    case 'sensory_score':
      return sorted.sort((a, b) => (b.sens_score_avg ?? 0) - (a.sens_score_avg ?? 0));
    case 'most_upvoted':
      return sorted.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    case 'recently_verified':
      return sorted.sort(
        (a, b) =>
          (b.sens_last_verified ? new Date(b.sens_last_verified).getTime() : 0) -
          (a.sens_last_verified ? new Date(a.sens_last_verified).getTime() : 0),
      );
    case 'closest_match':
    default:
      return sorted;
  }
}
