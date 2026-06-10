import { SiteHeader } from '@/components/venues/SiteHeader';
import { Hero } from '@/components/homepage/Hero';
import { FeaturedVenues } from '@/components/homepage/FeaturedVenues';
import { PillarCities } from '@/components/homepage/PillarCities';
import { ValueBlocks } from '@/components/homepage/ValueBlocks';
import { NewsletterSignup } from '@/components/homepage/NewsletterSignup';
import { JournalTeaser } from '@/components/homepage/JournalTeaser';
import { SiteFooter } from '@/components/venues/SiteFooter';
import { fetchFeaturedVenues, fetchCityCounts } from '@/lib/featured';

export default async function HomePage() {
  const [featuredVenues, cityCounts] = await Promise.all([
    fetchFeaturedVenues(),
    fetchCityCounts(),
  ]);

  const totalVenues =
    cityCounts.toronto + cityCounts.ottawa + cityCounts.gta + cityCounts.kwg + cityCounts.belleville;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Hero totalVenues={totalVenues} />
      <FeaturedVenues venues={featuredVenues} />
      <PillarCities cityCounts={cityCounts} />
      <ValueBlocks />
      <NewsletterSignup />
      <JournalTeaser />
      <SiteFooter />
    </main>
  );
}

export const metadata = {
  title: 'Happy Senses | Sensory-friendly spaces for everyone',
  description:
    'A directory of cafés, libraries, parks, and places that get it — curated for neurodivergent and sensory-sensitive humans of any age.',
};
