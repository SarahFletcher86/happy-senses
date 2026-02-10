'use client';

import { useMemo, useState } from 'react';
import { MapPinned } from 'lucide-react';
import { DirectoryFilters } from '@/components/venues/DirectoryFilters';
import { VenueCardGrid } from '@/components/venues/VenueCardGrid';
import { filterVenues, sortVenues } from '@/lib/venue-filters';
import type { SortOption, Venue, VenueFilters } from '@/lib/types';

interface DirectoryExperienceProps {
  venues: Venue[];
  categories: string[];
  cities: string[];
  initialSearch?: string;
  initialCategory?: string;
  initialCity?: string;
  initialSort?: SortOption;
}

export function DirectoryExperience({
  venues,
  categories,
  cities,
  initialSearch = '',
  initialCategory = 'All',
  initialCity = 'All',
  initialSort = 'sensory_score',
}: DirectoryExperienceProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [filters, setFilters] = useState<Partial<VenueFilters>>({
    sensory_friendly: null,
    quiet_room: null,
    headphones: null,
    staff_trained: null,
    accessible: null,
    fenced: null,
    not_near_water: null,
  });

  const activeFilters: VenueFilters = {
    search,
    category,
    city,
    sensory_friendly: filters.sensory_friendly ?? null,
    quiet_room: filters.quiet_room ?? null,
    headphones: filters.headphones ?? null,
    staff_trained: filters.staff_trained ?? null,
    accessible: filters.accessible ?? null,
    fenced: filters.fenced ?? null,
    not_near_water: filters.not_near_water ?? null,
  };

  const sortedVenues = useMemo(() => {
    const filtered = filterVenues(venues, activeFilters);
    return sortVenues(filtered, sortBy);
  }, [venues, search, category, city, filters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <DirectoryFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        city={city}
        setCity={setCity}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        cities={cities}
        filters={filters}
        setFilters={setFilters}
        venueCount={sortedVenues.length}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setViewMode((prev) => (prev === 'cards' ? 'map' : 'cards'))}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <MapPinned className="h-4 w-4" />
          {viewMode === 'cards' ? 'Map View' : 'Card View'}
        </button>
      </div>

      {viewMode === 'cards' ? (
        <VenueCardGrid venues={sortedVenues} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="grid gap-3 md:grid-cols-2">
            {sortedVenues.slice(0, 12).map((venue) => (
              <a
                key={venue.slug}
                href={`https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-800"
              >
                <p className="font-semibold text-gray-900 dark:text-white">{venue.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{venue.city || venue.address || 'Ontario'}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {sortedVenues.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg dark:text-gray-300">No venues found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2 dark:text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
