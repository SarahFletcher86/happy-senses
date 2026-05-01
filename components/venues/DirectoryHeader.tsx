import Image from 'next/image';

export function DirectoryHeader() {
  return (
    <header
      className="bg-veryLightMint"
      style={{ background: 'var(--veryLightMint)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-12">
          <div className="relative h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 shrink-0 flex justify-center items-center mb-8 sm:mb-0">
            <Image
              src="/heart.png"
              alt="Happy Senses heart icon"
              fill
              sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 160px"
              className="rounded-full shadow-none"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <h1
              className="text-5xl sm:text-6xl font-heading font-bold text-charcoal mb-2 leading-tight"
            >
              Happy Senses
            </h1>
            <span
              className="text-xl sm:text-2xl font-sans font-normal text-charcoal/80 leading-relaxed mt-1"
              style={{ letterSpacing: 0.2 }}
            >
              Finding calmer spaces, together.
            </span>
            <div className="mt-6 flex flex-col items-center sm:items-start gap-2 w-full">
              <a
                href="#explore"
                className="inline-block px-8 py-3 bg-calmTeal text-white rounded-[8px] shadow-md font-sans font-semibold text-lg transition hover:bg-calmTeal/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-calmTeal"
                style={{ boxShadow: '0 4px 24px 0 rgba(62,198,183,0.10)' }}
              >
                Explore Venues Near You
              </a>
              <a
                href="#add-venue"
                className="inline-block text-base font-sans text-charcoal/60 hover:text-charcoal/80 transition mt-1"
              >
                Add Your Venue
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
