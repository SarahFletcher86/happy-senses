'use client';

import { Filter, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortOption, VenueFilters } from '@/lib/types';

interface DirectoryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  categories: string[];
  cities: string[];
  filters: Partial<VenueFilters>;
  setFilters: (filters: Partial<VenueFilters>) => void;
  venueCount: number;
  className?: string;
}

const quickFilters = [
  { key: 'sensory_friendly' as const, label: 'Sensory supports', icon: '✨' },
  { key: 'quiet_room' as const, label: 'Quiet room', icon: '🤫' },
  { key: 'headphones' as const, label: 'Headphones', icon: '🎧' },
  { key: 'staff_trained' as const, label: 'Staff trained', icon: '👋' },
  { key: 'accessible' as const, label: 'Accessible', icon: '♿' },
  { key: 'fenced' as const, label: 'Fenced', icon: '🚧' },
  { key: 'not_near_water' as const, label: 'Away from water', icon: '🌊' },
];

export function DirectoryFilters({
  search,
  setSearch,
  category,
  setCategory,
  city,
  setCity,
  sortBy,
  setSortBy,
  categories,
  cities,
  filters,
  setFilters,
  venueCount,
  className,
}: DirectoryFiltersProps) {
  const activeFilterCount = quickFilters.filter((filter) => filters[filter.key] === true).length;

  return (
    <section
      className={cn(
        'rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-card backdrop-blur dark:border-white/10 dark:bg-dark-surface/90',
        className
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mid-gray dark:text-dark-text-soft" />
          <input
            type="text"
            placeholder="Search by name, city, address, or vibe"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-[rgba(44,51,56,0.12)] bg-light-cream px-12 py-3 text-sm text-charcoal outline-none ring-0 placeholder:text-mid-gray focus:border-calm-teal dark:border-white/10 dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-text-soft"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-mid-gray hover:text-charcoal dark:text-dark-text-soft dark:hover:text-dark-text"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <SelectField value={category} onChange={setCategory}>
          <option value="All">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectField>

        <SelectField value={city} onChange={setCity}>
          <option value="All">All cities</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectField>

        <SelectField value={sortBy} onChange={(value) => setSortBy(value as SortOption)}>
          <option value="sensory_score">Most sensory-friendly</option>
          <option value="most_upvoted">Most helpful votes</option>
          <option value="recently_verified">Recently verified</option>
          <option value="closest_match">Closest match</option>
        </SelectField>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {quickFilters.map((filter) => {
          const active = filters[filter.key] === true;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() =>
                setFilters({
                  ...filters,
                  [filter.key]: active ? null : true,
                })
              }
              className={cn(
                'rounded-full border px-3 py-2 text-sm font-semibold',
                active
                  ? 'border-calm-teal bg-calm-teal text-white'
                  : 'border-[rgba(44,51,56,0.12)] bg-light-cream text-charcoal hover:border-calm-teal dark:border-white/10 dark:bg-dark-bg dark:text-dark-text'
              )}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-sm text-mid-gray dark:text-dark-text-soft">
          <span>{venueCount} results</span>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() =>
                setFilters({
                  sensory_friendly: null,
                  quiet_room: null,
                  headphones: null,
                  staff_trained: null,
                  accessible: null,
                  fenced: null,
                  not_near_water: null,
                })
              }
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-charcoal hover:text-calm-teal dark:text-dark-text dark:hover:text-calm-teal"
            >
              <Filter className="h-4 w-4" />
              Clear {activeFilterCount}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-[rgba(44,51,56,0.12)] bg-light-cream px-4 py-3 pr-10 text-sm font-medium text-charcoal outline-none focus:border-calm-teal dark:border-white/10 dark:bg-dark-bg dark:text-dark-text"
      >
        {children}
      </select>
      <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mid-gray dark:text-dark-text-soft" />
    </div>
  );
}
