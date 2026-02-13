import { loadVenues, getCategories, getCities } from '@/lib/venues';
import { DirectoryClient } from '@/components/venues/DirectoryClient';
import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import { QuickExploreBar } from '@/components/venues/QuickExploreBar';
import type { VenueFilters, SortOption } from '@/lib/types';

interface HomePageProps {
  searchParams: Promise<{
    search?: string | string[];
    category?: string | string[];
    city?: string | string[];
    sort?: string | string[];
    sensory_friendly?: string | string[];
    quiet_room?: string | string[];
    headphones?: string | string[];
    staff_trained?: string | string[];
    accessible?: string | string[];
    fenced?: string | string[];
    not_near_water?: string | string[];
  }>;
}

function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseBooleanParam(value?: string | string[]) {
  const raw = getFirstParam(value);
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  return null;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = getFirstParam(params.search) || '';
  const category = getFirstParam(params.category) || 'All';
  const city = getFirstParam(params.city) || 'All';
  const sortParam = getFirstParam(params.sort);
  
  // Load all venues
  const allVenues = loadVenues();
  const categories = getCategories();
  const cities = getCities();
  
  // Build filters from URL params
  const filters: VenueFilters = {
    search,
    category,
    city,
    sensory_friendly: parseBooleanParam(params.sensory_friendly),
    quiet_room: parseBooleanParam(params.quiet_room),
    headphones: parseBooleanParam(params.headphones),
    staff_trained: parseBooleanParam(params.staff_trained),
    accessible: parseBooleanParam(params.accessible),
    fenced: parseBooleanParam(params.fenced),
    not_near_water: parseBooleanParam(params.not_near_water),
  };
  
  const sortBy: SortOption = (sortParam as SortOption) || 'sensory_score';
  
  return (
    <main className="min-h-screen bg-gray-50">
      <DirectoryHeader venueCount={allVenues.length} />
      <QuickExploreBar />

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
