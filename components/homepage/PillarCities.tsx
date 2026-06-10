import Link from 'next/link';
import type { CityCounts } from '@/lib/featured';

interface PillarCitiesProps {
  cityCounts: CityCounts;
}

const cities = [
  { name: 'Toronto', slug: 'Toronto', count: (c: CityCounts) => c.toronto },
  { name: 'Ottawa', slug: 'Ottawa', count: (c: CityCounts) => c.ottawa },
  { name: 'GTA', slug: 'Mississauga', count: (c: CityCounts) => c.gta },
  {
    name: 'Kitchener–Waterloo–Guelph',
    slug: 'Kitchener',
    count: (c: CityCounts) => c.kwg,
  },
  { name: 'Belleville', slug: 'Belleville', count: (c: CityCounts) => c.belleville },
];

export function PillarCities({ cityCounts }: PillarCitiesProps) {
  return (
    <section className="bg-[var(--mint)] px-4 py-20 md:py-28 dark:bg-[#141A20]">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-[var(--mid-gray)] dark:text-[#9AA8A6]">
          Browse by city
        </p>
        <h2 className="text-center font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.2] font-semibold text-[var(--charcoal)] md:text-[38px] dark:text-[#F8F2E5]">
          Find calmer places near you
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-center text-[15px] leading-[1.7] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
          We started where the data was densest. Your city not here yet? Add a venue you love — that&rsquo;s
          how we grow.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cities.map((city) => {
            const count = city.count(cityCounts);
            return (
              <Link
                key={city.slug}
                href={`/directory?city=${encodeURIComponent(city.slug)}`}
                className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--mint)] px-5 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--calm-teal)] hover:bg-[var(--cream)] dark:border-[rgba(248,242,229,0.08)] dark:bg-[#1A2024] dark:hover:border-[#6FCFCE] dark:hover:bg-[#232C36]"
              >
                <p className="font-[family-name:var(--font-fraunces)] text-[18px] font-semibold text-[var(--charcoal)] dark:text-[#F8F2E5]">
                  {city.name}
                </p>
                <p className="mt-1 text-[13px] font-medium text-[var(--mid-gray)] dark:text-[#ADA590]">
                  {count} venue{count !== 1 ? 's' : ''}
                </p>
                <p className="mt-3 text-[13px] font-semibold text-[var(--calm-teal)] transition group-hover:text-[var(--calm-teal-deep)] dark:text-[#6FCFCE] dark:group-hover:text-[#8FE0DF]">
                  Browse →
                </p>
              </Link>
            );
          })}
        </div>

        <p className="mx-auto mt-12 max-w-[600px] text-center text-[14px] leading-[1.6] text-[var(--mid-gray)] dark:text-[#ADA590]">
          Not your city?{' '}
          <Link href="/submit" className="font-semibold text-[var(--calm-teal)] hover:underline dark:text-[#6FCFCE]">
            Submit a venue you love
          </Link>{' '}
          or{' '}
          <Link href="/notify" className="font-semibold text-[var(--calm-teal)] hover:underline dark:text-[#6FCFCE]">
            tell us where you are
          </Link>{' '}
          — we add cities as the community grows them.
        </p>
      </div>
    </section>
  );
}
