import { DirectoryClient } from '@/components/venues/DirectoryClient';
import { getCategories, getCities, loadVenueDataState } from '@/lib/venues';
import type { SortOption, VenueFilters } from '@/lib/types';

interface HomePageProps {
  searchParams?: Promise<{
    search?: string;
    category?: string;
    city?: string;
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const venueState = await loadVenueDataState();
  const categories = await getCategories();
  const cities = await getCities();

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
    <DirectoryClient
      venues={venueState.venues}
      categories={categories}
      cities={cities}
      initialFilters={filters}
      initialSort={sortBy}
      warning={venueState.warning}
    />
  );
}

export const metadata = {
  title: 'Happy Senses | Sensory-friendly spaces for everyone',
  description:
    'Explore sensory-friendly community spaces with calmer lighting, quieter environments, and accessibility details for families.',
};

export const revalidate = 3600;
