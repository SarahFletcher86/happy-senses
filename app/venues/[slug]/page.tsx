import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Route,
  Star,
  Clock3,
} from 'lucide-react';
import { DirectoryHeader } from '@/components/venues/DirectoryHeader';
import { SafetyBadge, WarningBadge } from '@/components/venues/SafetyBadge';
import { SensoryPill } from '@/components/venues/SensoryBadge';
import { VenueDetailClient } from '@/components/venues/VenueDetailClient';
import {
  getApprovedNotesBySlug,
  getAllVenues,
  getVenueBySlug,
} from '@/lib/venues';
import {
  getCrowdDescription,
  getDisplaySensoryValue,
  getLightDescription,
  getNoiseDescription,
} from '@/lib/sensory-utils';
import { cn } from '@/lib/utils';

interface VenueDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

const categoryStyles: Record<string, string> = {
  Library:
    'bg-[rgba(184,221,232,0.60)] text-[#2B6478] dark:bg-[rgba(184,221,232,0.20)] dark:text-[#C4E2EE]',
  Museum:
    'bg-[rgba(244,168,146,0.40)] text-[#B25938] dark:bg-[rgba(244,168,146,0.20)] dark:text-[#F8C4B0]',
  Park:
    'bg-[rgba(168,216,168,0.40)] text-[#3F7A3F] dark:bg-[rgba(168,216,168,0.20)] dark:text-[#B5DCB5]',
  'Community Centre':
    'bg-[rgba(91,184,183,0.50)] text-[#155251] dark:bg-[rgba(91,184,183,0.28)] dark:text-[#8DD3D2]',
};

const tierStyles: Record<string, string> = {
  '✓ Trusted': 'bg-[rgba(168,216,168,0.45)] text-[#2B5C2B] dark:bg-[rgba(168,216,168,0.22)] dark:text-[#DDF2DD]',
  Promising: 'bg-[rgba(245,216,108,0.65)] text-[#6B5418] dark:bg-[rgba(245,216,108,0.26)] dark:text-[#F8E1A5]',
  'Help us verify':
    'bg-[rgba(244,168,146,0.45)] text-[#8B3F22] dark:bg-[rgba(244,168,146,0.22)] dark:text-[#FCD8C8]',
};

export async function generateStaticParams() {
  const venues = await getAllVenues();
  const topVenues = venues
    .filter((venue) => venue.published)
    .sort((a, b) => {
      const upvoteDiff = (b.community_upvotes ?? 0) - (a.community_upvotes ?? 0);
      if (upvoteDiff !== 0) return upvoteDiff;
      return (b.google_review_count ?? 0) - (a.google_review_count ?? 0);
    })
    .slice(0, 50);

  return topVenues.map((venue) => ({ slug: venue.slug }));
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  const notes = await getApprovedNotesBySlug(slug);
  const mapsQuery = encodeURIComponent([venue.name, venue.address, venue.city].filter(Boolean).join(', '));
  const website = venue.website || '';
  const tierLabel = venue.tier || 'Help us verify';

  return (
    <main className="min-h-screen">
      <DirectoryHeader venueCount={1} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-mid-gray dark:text-dark-text-soft">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-charcoal dark:text-dark-text">
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
          <span>·</span>
          <span>{venue.city || 'Ontario'}</span>
          <span>·</span>
          <span>{venue.category}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <section className="rounded-[32px] border border-border-subtle bg-cream p-5 shadow-card dark:border-dark-border dark:bg-dark-card">
            <div className="flex h-[320px] items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,rgba(184,221,232,0.35),rgba(168,216,168,0.22),rgba(255,252,247,1))] text-center dark:bg-[linear-gradient(135deg,rgba(91,184,183,0.16),rgba(26,31,35,0.92))]">
              <div className="max-w-xs">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mid-gray dark:text-dark-text-soft">
                  Photo placeholder
                </p>
                <p className="mt-3 text-base text-charcoal dark:text-dark-text">
                  Google Places photos arrive in Change Order #2. For now, the detail view keeps the space ready.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-border-subtle bg-cream p-6 shadow-card dark:border-dark-border dark:bg-dark-card">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  categoryStyles[venue.category] ??
                    'bg-[rgba(142,151,163,0.18)] text-[#5F6873] dark:bg-[rgba(142,151,163,0.16)] dark:text-[#D5D9DE]'
                )}
              >
                {venue.category}
              </span>
              <span
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  tierStyles[tierLabel] ?? tierStyles['Help us verify']
                )}
              >
                {tierLabel}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-charcoal dark:text-dark-text-heading">
              {venue.name}
            </h1>
            <div className="mt-3 flex items-start gap-2 text-mid-gray dark:text-dark-text-muted">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>{[venue.address, venue.city].filter(Boolean).join(', ') || 'Location details coming soon'}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-mid-gray dark:text-dark-text-muted">
              {venue.google_rating ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-warm-mustard">★</span>
                  <strong className="font-semibold text-charcoal dark:text-dark-text-heading">
                    {venue.google_rating.toFixed(1)}
                  </strong>
                  <span>· {venue.google_review_count ?? 0} Google reviews</span>
                </span>
              ) : null}
              <span>{venue.community_upvotes + venue.community_downvotes} community votes</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <QuickInfo icon={Phone} label="Phone" value={venue.phone || 'Not listed'} href={venue.phone ? `tel:${venue.phone}` : undefined} />
              <QuickInfo icon={Globe} label="Website" value={website ? 'Open website' : 'Not listed'} href={website || undefined} />
              <QuickInfo icon={Clock3} label="Hours" value="Hours will arrive with place enrichment" />
              <QuickInfo
                icon={Route}
                label="Get directions"
                value="Open in maps"
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              />
            </div>

            <div className="mt-6">
              <VenueDetailClient
                slug={venue.slug}
                initialUpvotes={venue.community_upvotes}
                initialDownvotes={venue.community_downvotes}
                initialNotes={notes}
              />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="detail-section rounded-[32px] border border-border-subtle bg-cream p-6 shadow-card dark:border-dark-border dark:bg-dark-card">
            <h2 className="text-2xl font-bold text-charcoal dark:text-dark-text-heading">AI sensory summary</h2>
            <p className="mt-4 text-base leading-8 text-charcoal dark:text-dark-text-primary">
              {venue.sens_accessibility_summary ||
                venue.ai_accessibility_summary ||
                'AI summary not yet generated for this venue.'}
            </p>
          </section>

          <section className="detail-section rounded-[32px] border border-border-subtle bg-cream p-6 shadow-card dark:border-dark-border dark:bg-dark-card">
            <h2 className="text-2xl font-bold text-charcoal dark:text-dark-text-heading">Sensory-Friendly Certified™</h2>
            <p className="mt-3 text-sm leading-7 text-mid-gray dark:text-dark-text-muted">
              Are you the venue owner? Learn how certification can make your space easier to trust and easier to find.
            </p>
            <Link
              href="/certify"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-calm-teal px-4 py-2 font-semibold text-white"
            >
              Explore certification
              <ExternalLink className="h-4 w-4" />
            </Link>
          </section>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <SensoryCard
            title="Quiet"
            emoji="🤫"
            value={venue.sens_noise_1to5}
            description={getNoiseDescription(venue.sens_noise_1to5)}
          />
          <SensoryCard
            title="Calm lighting"
            emoji="💡"
            value={venue.sens_light_1to5}
            description={getLightDescription(venue.sens_light_1to5)}
          />
          <SensoryCard
            title="Low crowd"
            emoji="👥"
            value={venue.sens_crowd_1to5}
            description={getCrowdDescription(venue.sens_crowd_1to5)}
          />
        </section>

        <section className="mt-6 rounded-[32px] border border-border-subtle bg-cream p-6 shadow-card dark:border-dark-border dark:bg-dark-card">
          <h2 className="text-2xl font-bold text-charcoal dark:text-dark-text-heading">Sensory accommodations</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SensoryPill type="quiet_room" available={venue.sens_quiet_room} />
            <SensoryPill type="headphones" available={venue.sens_headphones} />
            <SensoryPill type="staff_trained" available={venue.sens_staff_trained} />
            <SensoryPill type="certified" available={Boolean(venue.sens_certification)} />
            <SafetyBadge type="accessible" value={venue.accessible} />
            <SafetyBadge type="fenced" value={venue.fenced} />
            <SafetyBadge type="near_water" value={venue.near_water} />
            <SafetyBadge type="equipment_height" heightValue={venue.equipment_height} />
          </div>
          {venue.near_water === true && venue.fenced !== true ? (
            <div className="mt-4">
              <WarningBadge message="Near water is flagged here, so closer supervision may be needed." />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function QuickInfo({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="detail-subcard rounded-2xl border border-border-subtle bg-light-cream p-4 dark:border-dark-border dark:bg-dark-bg">
      <div className="flex items-center gap-2 text-sm font-semibold text-charcoal dark:text-dark-text-heading">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm text-mid-gray dark:text-dark-text-muted">{value}</p>
    </div>
  );

  if (!href) return content;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}

function SensoryCard({
  title,
  emoji,
  value,
  description,
}: {
  title: string;
  emoji: string;
  value: number | null;
  description: string;
}) {
  const display = getDisplaySensoryValue(value) ?? 0;
  const percent = (display / 5) * 100;

  return (
    <article className="detail-section rounded-[28px] border border-border-subtle bg-cream p-6 shadow-card dark:border-dark-border dark:bg-dark-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-charcoal dark:text-dark-text-heading">
          <span className="mr-2">{emoji}</span>
          {title}
        </h2>
        <span className="text-sm font-semibold text-mid-gray dark:text-dark-text-muted">
          {display || '?'} / 5
        </span>
      </div>
      <div className="mt-4 h-3 rounded-full bg-[#E0E5E0] dark:bg-[#3A4A50]">
        <div
          className={cn(
            'h-3 rounded-full',
            display >= 4 ? 'bg-gentle-green' : display === 3 ? 'bg-warm-mustard' : 'bg-soft-peach'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-4 text-sm leading-7 text-mid-gray dark:text-dark-text-muted">{description}</p>
    </article>
  );
}
