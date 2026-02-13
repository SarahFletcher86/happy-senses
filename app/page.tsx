import { loadVenues, getCategories, getCities } from '@/lib/venues';
import { DirectoryClient } from '@/components/venues/DirectoryClient';
import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import type { VenueFilters, SortOption } from '@/lib/types';

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    city?: string;
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  
  // Load all venues
  const allVenues = loadVenues();
  const categories = getCategories();
  const cities = getCities();
  
  // Build filters from URL params
  const filters: VenueFilters = {
    search: params.search || '',
    category: params.category || 'All',
    city: params.city || 'All',
    sensory_friendly: null,
    quiet_room: null,
    headphones: null,
    staff_trained: null,
    accessible: null,
    fenced: null,
    not_near_water: null,
  };
  
  const sortBy: SortOption = (params.sort as SortOption) || 'sensory_score';
  
  return (
    <main className="min-h-screen bg-gray-50">
      <DirectoryHeader venueCount={allVenues.length} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DirectoryClient
          initialVenues={allVenues}
          categories={categories}
          cities={cities}
          initialFilters={filters}
          initialSortBy={sortBy}
        />
      </div>
    </main>
  );
}

export function generateMetadata() {
  return {
    title: 'Happy Senses - Inclusive Spaces Directory',
    description: 'Discover sensory-friendly and accessible spaces across Ontario. Find venues with quiet rooms, trained staff, and accommodations for diverse needs.',
  };
}
