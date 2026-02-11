"use client";

import { useMemo, useState } from 'react';
import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import { DirectoryFilters } from '@/components/venues/DirectoryFilters';
import { VenueCardGrid } from '@/components/venues/VenueCardGrid';
import { filterVenues, sortVenues } from '@/lib/venue-filters';
import type { Venue, VenueFilters, SortOption } from '@/lib/types';

interface DirectoryClientProps {
  venues: Venue[];
  categories: string[];
  cities: string[];
  initialFilters: VenueFilters;
  initialSort: SortOption;
}

export function DirectoryClient({
  venues,
  categories,
  cities,
  initialFilters,
  initialSort,
}: DirectoryClientProps) {
  const [search, setSearch] = useState(initialFilters.search);
  const [category, setCategory] = useState(initialFilters.category);
  const [city, setCity] = useState(initialFilters.city);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [filters, setFilters] = useState<Partial<VenueFilters>>({
    sensory_friendly: initialFilters.sensory_friendly ?? null,
    quiet_room: initialFilters.quiet_room ?? null,
    headphones: initialFilters.headphones ?? null,
    staff_trained: initialFilters.staff_trained ?? null,
    accessible: initialFilters.accessible ?? null,
    fenced: initialFilters.fenced ?? null,
    not_near_water: initialFilters.not_near_water ?? null,
  });

  const combinedFilters: VenueFilters = {
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
    const filteredVenues = filterVenues(venues, combinedFilters);
    return sortVenues(filteredVenues, sortBy);
  }, [venues, combinedFilters, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50">
      <DirectoryHeader venueCount={sortedVenues.length} />

      <div className="max-w-7xl mx-auto px-4 py-8">
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

        <VenueCardGrid venues={sortedVenues} />

        {sortedVenues.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No venues found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </main>
  );
}
