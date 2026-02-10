import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import { DirectoryExperience } from '@/components/venues/DirectoryExperience';
import { getCategories, getCities, loadVenues } from '@/lib/venues';
import type { SortOption } from '@/lib/types';

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    city?: string;
    sort?: SortOption;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const allVenues = await loadVenues();
  const categories = getCategories(allVenues);
  const cities = getCities(allVenues);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DirectoryHeader venueCount={allVenues.length} />
      <DirectoryExperience
        venues={allVenues}
        categories={categories}
        cities={cities}
        initialSearch={params.search ?? ''}
        initialCategory={params.category ?? 'All'}
        initialCity={params.city ?? 'All'}
        initialSort={params.sort ?? 'sensory_score'}
      />
    </main>
  );
}

export function generateMetadata() {
  return {
    title: 'Happy Senses - Ontario Sensory-Friendly Directory',
    description:
      'Discover sensory-friendly and accessible spaces across Ontario with detailed ratings, filters, and support features for families.',
  };
}
