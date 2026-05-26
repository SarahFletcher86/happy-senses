import Link from 'next/link';

interface HeroProps {
  totalVenues: number;
}

function formatVenueCount(count: number): string {
  if (count >= 100) {
    const rounded = Math.round(count / 5) * 5;
    return `${rounded}`;
  }
  return 'curated';
}

export function Hero({ totalVenues }: HeroProps) {
  const venueDisplay = formatVenueCount(totalVenues);
  const venueLabel =
    totalVenues >= 100
      ? `${venueDisplay} curated venues`
      : 'curated venues';

  return (
    <section className="bg-[var(--mint)] px-4 pt-16 pb-20 md:pt-24 md:pb-28 dark:bg-[#141A20]">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 text-[13px] font-semibold uppercase tracking-[0.15em] text-[var(--mid-gray)] dark:text-[#9AA8A6]">
          Sensory-friendly · neuro-affirming · curated by hand
        </p>

        <h1 className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[1.15] font-semibold text-[var(--charcoal)] md:text-[52px] dark:text-[#F8F2E5]">
          Sensory-friendly spaces for{' '}
          <i className="font-[family-name:var(--font-fraunces)] text-[var(--calm-teal-deep)] dark:text-[#6FCFCE]">
            everyone
          </i>
          .
        </h1>

        <p className="mx-auto mt-6 max-w-[620px] text-[17px] leading-[1.7] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
          A directory of cafés, libraries, parks, and places that get it — curated for neurodivergent and
          sensory-sensitive humans of any age. Built by an autistic mom in Belleville who needed this to
          exist.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/directory"
            className="inline-flex items-center justify-center gap-1.5 rounded-[999px] border border-[var(--calm-teal)] bg-[var(--calm-teal)] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[var(--calm-teal-deep)] dark:border-[#6FCFCE] dark:bg-[#6FCFCE] dark:text-[#141A20] dark:hover:bg-[#8FE0DF]"
          >
            Browse the directory
          </Link>
          <a
            href="#newsletter"
            className="inline-flex items-center justify-center gap-1.5 rounded-[999px] border border-[var(--border-subtle)] bg-transparent px-7 py-3.5 text-[16px] font-semibold text-[var(--charcoal)] transition hover:border-[var(--calm-teal)] hover:text-[var(--calm-teal)] dark:border-[rgba(248,242,229,0.18)] dark:text-[#F8F2E5] dark:hover:border-[#6FCFCE] dark:hover:text-[#6FCFCE]"
          >
            Get the newsletter
          </a>
        </div>

        <p className="mt-9 text-[13px] font-medium text-[var(--mid-gray)] dark:text-[#ADA590]">
          {venueLabel} · Toronto · Ottawa · GTA · Kitchener–Waterloo–Guelph · Belleville · growing weekly
        </p>
      </div>
    </section>
  );
}
