"use client";

import { useMemo, useState } from 'react';
import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import { DirectoryFilters } from '@/components/venues/DirectoryFilters';
import { VenueCardGrid } from '@/components/venues/VenueCardGrid';
import { filterVenues, sortVenues } from '@/lib/venue-filters';
import type { SortOption, Venue, VenueFilters } from '@/lib/types';

interface DirectoryClientProps {
  venues: Venue[];
  categories: string[];
  cities: string[];
  initialFilters: VenueFilters;
  initialSort: SortOption;
  warning?: string | null;
}

export function DirectoryClient({
  venues,
  categories,
  cities,
  initialFilters,
  initialSort,
  warning,
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
    <main className="min-h-screen bg-transparent">
      <DirectoryHeader venueCount={sortedVenues.length} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {warning ? (
          <div className="mb-5 rounded-2xl border border-[rgba(229,185,98,0.35)] bg-[rgba(229,185,98,0.16)] px-4 py-3 text-sm font-medium text-[#7A5816] dark:border-[rgba(229,185,98,0.18)] dark:bg-[rgba(229,185,98,0.1)] dark:text-[#F2D08B]">
            {warning}
          </div>
        ) : null}

        <div className="space-y-6">
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

          <section className="grid gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold text-charcoal dark:text-dark-text-heading">Find a calmer outing</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-mid-gray dark:text-dark-text-muted">
                  Ratings shown here are inverted at display time so higher scores mean more sensory-friendly:
                  quieter, calmer lighting, and lower crowd levels.
                </p>
              </div>
            </div>

            <VenueCardGrid venues={sortedVenues} />

            {sortedVenues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(44,51,56,0.16)] bg-white p-10 text-center shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-dark-border dark:bg-dark-card">
                <p className="text-lg font-semibold text-charcoal dark:text-dark-text-heading">
                  No venues match those filters yet.
                </p>
                <p className="mt-2 text-sm text-mid-gray dark:text-dark-text-muted">
                  Try a broader city, a different category, or remove a quick filter.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <footer className="mt-12 border-t border-border-subtle bg-cream dark:border-dark-border dark:bg-dark-bg">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-mid-gray dark:text-dark-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Sensory-friendly spaces for everyone</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/about">About</a>
            <a href="/add-venue">Add a Venue</a>
            <a href="/privacy">Privacy</a>
            <a href="/certify">Get certified</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
