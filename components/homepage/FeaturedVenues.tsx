import { FeaturedVenueCard } from './FeaturedVenueCard';
import type { FeaturedVenue } from '@/lib/featured';

interface FeaturedVenuesProps {
  venues: FeaturedVenue[];
}

export function FeaturedVenues({ venues }: FeaturedVenuesProps) {
  if (venues.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--cream)] px-4 py-16 md:py-24 dark:bg-[#1A2024]">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-[var(--mid-gray)] dark:text-[#9AA8A6]">
          Trusted this week
        </p>
        <h2 className="text-center font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.2] font-semibold text-[var(--charcoal)] md:text-[38px] dark:text-[#F8F2E5]">
          Places people like us already love
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-center text-[15px] leading-[1.7] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
          Venues we&rsquo;ve verified personally or that hold real sensory credentials. Every listing is
          reviewed before it goes live.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {venues.map((venue) => (
            <FeaturedVenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </div>
    </section>
  );
}
