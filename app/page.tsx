import { loadVenues, getCategories, getCities, filterVenues, sortVenues } from '@/lib/venues';
import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import { DirectoryFilters } from '@/components/venues/DirectoryFilters';
import { VenueCardGrid } from '@/components/venues/VenueCardGrid';
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
  
  // Filter and sort venues
  const filteredVenues = filterVenues(allVenues, filters);
  const sortedVenues = sortVenues(filteredVenues, sortBy);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <DirectoryHeader venueCount={sortedVenues.length} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DirectoryFilters
          search={filters.search}
          setSearch={() => {}}
          category={filters.category}
          setCategory={() => {}}
          city={filters.city}
          setCity={() => {}}
          sortBy={sortBy}
          setSortBy={() => {}}
          categories={categories}
          cities={cities}
          filters={{
            sensory_friendly: null,
            quiet_room: null,
            headphones: null,
            staff_trained: null,
            accessible: null,
            fenced: null,
            not_near_water: null,
          }}
          setFilters={() => {}}
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

export function generateMetadata() {
  return {
    title: 'Happy Senses - Inclusive Spaces Directory',
    description: 'Discover sensory-friendly and accessible spaces across Ontario. Find venues with quiet rooms, trained staff, and accommodations for diverse needs.',
  };
}
