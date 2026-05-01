'use client';

import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VenueFilters, SortOption } from '@/lib/types';

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
  const quickFilters = [
    { key: 'sensory_friendly' as const, label: 'Sensory Friendly', icon: '✨' },
    { key: 'quiet_room' as const, label: 'Quiet Room', icon: '🔇' },
    { key: 'headphones' as const, label: 'Headphones', icon: '🎧' },
    { key: 'staff_trained' as const, label: 'Staff Trained', icon: '👥' },
    { key: 'accessible' as const, label: 'Accessible', icon: '♿' },
    { key: 'fenced' as const, label: 'Fenced', icon: '🚧' },
    { key: 'not_near_water' as const, label: 'Not Near Water', icon: '💧' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'sensory_score', label: 'Best Sensory Score' },
    { value: 'most_upvoted', label: 'Most Upvoted' },
    { value: 'recently_verified', label: 'Recently Verified' },
    { value: 'closest_match', label: 'Closest Match' },
  ];

  const activeQuickFiltersCount = quickFilters.filter(f => filters[f.key] === true).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative font-sans">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-calmTeal" />
        <input
          type="text"
          placeholder="Search venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-mistGrey rounded-xl text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-calmTeal focus:border-calmTeal placeholder:text-mistGrey"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-mint"
          >
            <X className="w-4 h-4 text-calmTeal" />
          </button>
        )}
      </div>

      {/* Main Filters Row */}
      <div className="flex flex-wrap items-center gap-3 font-sans">
        {/* Category Select */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 border border-mistGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-calmTeal bg-white text-charcoal"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-calmTeal pointer-events-none" />
        </div>

        {/* City Select */}
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 border border-mistGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-calmTeal bg-white text-charcoal"
          >
            <option value="All">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-calmTeal pointer-events-none" />
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none pl-4 pr-10 py-2.5 border border-mistGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-calmTeal bg-white text-charcoal"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-calmTeal pointer-events-none" />
        </div>

        {/* Result Count */}
        <span className="ml-auto text-sm text-mistGrey">
          {venueCount} venue{venueCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Active Filters */}
      {activeQuickFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-mistGrey">Active filters:</span>
          {quickFilters.map(f => {
            if (filters[f.key] !== true) return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilters({ ...filters, [f.key]: null })}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-mint text-calmTeal text-sm hover:bg-calmTeal/10 hover:text-charcoal border border-calmTeal/40 transition-colors"
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                <X className="w-3 h-3" />
              </button>
            );
          })}
          <button
            onClick={() => setFilters({
              sensory_friendly: null,
              quiet_room: null,
              headphones: null,
              staff_trained: null,
              accessible: null,
              fenced: null,
              not_near_water: null,
            })}
            className="text-sm text-calmTeal hover:text-charcoal"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Quick Filter Toggles */}
      <div className="flex flex-wrap gap-3 mt-2">
        {quickFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilters({
              ...filters,
              [f.key]: filters[f.key] === true ? null : true,
            })}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium font-sans border transition-colors',
              filters[f.key] === true
                ? 'bg-mint text-calmTeal border-calmTeal'
                : 'bg-white text-calmTeal border-calmTeal hover:bg-calmTeal/10'
            )}
            style={{ boxShadow: '0 1px 4px 0 rgba(62,198,183,0.04)' }}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
