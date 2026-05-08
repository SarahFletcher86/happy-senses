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
        'search-container rounded-2xl border border-border-subtle bg-cream p-5 shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-dark-border dark:bg-dark-card',
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
            className="search-input w-full rounded-2xl border border-border-subtle bg-light-cream px-12 py-3 text-sm text-charcoal outline-none ring-0 placeholder:text-mid-gray focus:border-calm-teal dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-primary dark:placeholder:text-dark-text-muted"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-mid-gray hover:text-charcoal dark:text-dark-text-muted dark:hover:text-dark-text-primary"
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
                'filter-chip inline-flex items-center gap-1.5 rounded-full border px-4 py-[9px] text-[13px] font-medium',
                active
                  ? 'filter-chip--active border-calm-teal bg-calm-teal text-[#0E1417] dark:border-dark-cta-teal dark:bg-dark-cta-teal dark:text-[#0E1417]'
                  : 'border-border-subtle bg-light-cream text-charcoal hover:border-calm-teal hover:text-calm-teal dark:border-[#3A4A50] dark:bg-[#2A3540] dark:text-[#F2EBDD] dark:hover:border-dark-cta-teal dark:hover:text-dark-cta-teal'
              )}
            >
              <span>{filter.icon}</span>
              {filter.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-[13px] text-mid-gray dark:text-dark-text-dim">
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
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-charcoal hover:text-calm-teal dark:text-dark-text-primary dark:hover:text-dark-cta-teal"
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
        className="filter-dropdown w-full appearance-none rounded-2xl border border-border-subtle bg-light-cream px-4 py-3 pr-10 text-sm font-medium text-charcoal outline-none focus:border-calm-teal dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-primary"
      >
        {children}
      </select>
      <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mid-gray dark:text-dark-text-muted" />
    </div>
  );
}
