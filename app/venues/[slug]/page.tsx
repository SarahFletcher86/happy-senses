import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Share2,
  AlertCircle
} from 'lucide-react';
import { getVenueBySlug, loadVenues, getSensoryLevelLabel, getNoiseDescription, getLightDescription, getCrowdDescription } from '@/lib/venues';
import { SensoryBadge, SensoryPill } from '@/components/venues/SensoryBadge';
import { SafetyBadge, WarningBadge } from '@/components/venues/SafetyBadge';
import { cn } from '@/lib/utils';
import type { VenueNote } from '@/lib/types';

interface VenueDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all venues
export async function generateStaticParams() {
  const venues = loadVenues();
  return venues.map((venue) => ({
    slug: venue.slug,
  }));
}



export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  
  if (!venue) {
    notFound();
  }

  const score = venue.sens_score_avg ?? 0;

  // Get score color (calm, no orange)
  const getScoreColor = () => {
    return 'bg-peach/30 text-charcoal border border-calmTeal/40';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium font-sans bg-veryLightMint text-calmTeal border border-calmTeal/30"
                >
                  {venue.category}
                </span>
                {venue.sens_certification && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {venue.sens_certification}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-heading font-bold text-charcoal mb-1">{venue.name}</h1>
              <p className="text-calmTeal font-sans text-base mb-1">Community-submitted accessibility insights.</p>
              <p className="text-charcoal/80 font-sans mt-1">
                {venue.city || 'Ontario, Canada'}
              </p>
            </div>
            
            {/* Score Badge */}
            <div className="flex flex-col items-end">
              <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl', getScoreColor())}>
                <span className="text-2xl font-semibold font-sans">{score}</span>
                <span className="text-sm font-medium font-sans">/100</span>
              </div>
              <span className="text-xs text-mistGrey mt-1">Sensory Score</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location & Contact */}
            <section className="bg-white rounded-xl border border-mistGrey p-6">
              <h2 className="text-xl font-heading font-semibold text-charcoal mb-4">Location & Contact</h2>
              <div className="space-y-3">
                {venue.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-charcoal font-sans font-medium">{venue.address}</p>
                      <p className="text-charcoal/80 font-sans">{venue.city || 'Ontario'}</p>
                    </div>
                  </div>
                )}
                {venue.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-calmTeal" />
                    <a 
                      href={venue.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-calmTeal hover:text-charcoal flex items-center gap-1 font-sans font-medium"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
                {venue.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-calmTeal" />
                    <a href={`tel:${venue.phone}`} className="text-calmTeal hover:text-charcoal font-sans font-medium">
                      {venue.phone}
                    </a>
                  </div>
                )}
                {venue.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-calmTeal" />
                    <a href={`mailto:${venue.email}`} className="text-calmTeal hover:text-charcoal font-sans font-medium">
                      {venue.email}
                    </a>
                  </div>
                )}
                {venue.sens_last_verified && (
                  <div className="flex items-center gap-3 text-sm text-mistGrey">
                    <Calendar className="w-5 h-5 text-calmTeal" />
                    <span>Last verified: {new Date(venue.sens_last_verified).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Sensory Details */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Sensory Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Noise Level</span>
                    <span className="text-xs text-gray-500">{venue.sens_noise_1to5 || '?'}/5</span>
                  </div>
                  <SensoryBadge type="noise" value={venue.sens_noise_1to5} />
                  <p className="text-xs text-gray-500 mt-2">
                    {getNoiseDescription(venue.sens_noise_1to5)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Lighting</span>
                    <span className="text-xs text-gray-500">{venue.sens_light_1to5 || '?'}/5</span>
                  </div>
                  <SensoryBadge type="light" value={venue.sens_light_1to5} />
                  <p className="text-xs text-gray-500 mt-2">
                    {getLightDescription(venue.sens_light_1to5)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Crowd Level</span>
                    <span className="text-xs text-gray-500">{venue.sens_crowd_1to5 || '?'}/5</span>
                  </div>
                  <SensoryBadge type="crowd" value={venue.sens_crowd_1to5} />
                  <p className="text-xs text-gray-500 mt-2">
                    {getCrowdDescription(venue.sens_crowd_1to5)}
                  </p>
                </div>
              </div>

              {/* Sensory Features */}
              <div className="flex flex-wrap gap-2">
                {venue.sens_quiet_room === true && <SensoryPill type="quiet_room" available={venue.sens_quiet_room} />}
                {venue.sens_headphones === true && <SensoryPill type="headphones" available={venue.sens_headphones} />}
                {venue.sens_staff_trained === true && <SensoryPill type="staff_trained" available={venue.sens_staff_trained} />}
                {venue.sens_quiet_room !== true && venue.sens_headphones !== true && venue.sens_staff_trained !== true && (
                  <p className="text-sm text-gray-500">No sensory accommodations recorded</p>
                )}
              </div>
            </section>

            {/* Safety & Accessibility */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Safety & Accessibility</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {venue.accessible === true && <SafetyBadge type="accessible" value={venue.accessible} />}
                {venue.fenced === true && <SafetyBadge type="fenced" value={venue.fenced} />}
                {venue.equipment_height && (
                  <SafetyBadge type="equipment_height" value={undefined} heightValue={venue.equipment_height} />
                )}
              </div>

              {venue.near_water === true && venue.fenced !== true && (
                <WarningBadge message="Near water - adult supervision required for children" />
              )}
              
              {venue.near_water === true && venue.fenced === true && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Fenced area near water provides some protection, but supervision still recommended</span>
                </div>
              )}
            </section>

            {/* AI Summary */}
            {venue.ai_accessibility_summary && (
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                <h2 className="text-lg font-semibold mb-2 text-blue-900">AI Accessibility Summary</h2>
                <p className="text-blue-800 leading-relaxed">
                  {venue.ai_accessibility_summary}
                </p>
              </section>
            )}

            {/* Community Notes */}
            <section className="bg-white rounded-xl border border-mistGrey/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Community Insights</h2>
                <button
                  className="px-4 py-2 rounded-lg bg-calmTeal text-white font-sans font-medium hover:bg-calmTeal/90 transition-colors"
                  // TODO: Open modal for submitting insight
                  type="button"
                >
                  Submit Insight
                </button>
              </div>
              <div className="text-center py-6">
                <p className="text-mistGrey text-base mb-2">No insights have been shared for this venue yet.</p>
                <p className="text-charcoal/70 text-sm">Be the first to help others by sharing your experience or accessibility tips.</p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Rate this venue</h3>
              <div className="flex gap-3">
                <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                  <ThumbsUp className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                  <span className="text-sm font-medium">{venue.upvotes}</span>
                  <span className="text-xs text-gray-500">Helpful</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                  <ThumbsDown className="w-6 h-6 text-gray-400 group-hover:text-red-600" />
                  <span className="text-sm font-medium">{venue.downvotes}</span>
                  <span className="text-xs text-gray-500">Not helpful</span>
                </button>
              </div>
            </section>

            {/* Share */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Share</h3>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
            </section>

            {/* Report Issue */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Something wrong?</h3>
              <p className="text-xs text-gray-500 mb-3">
                Help us keep this directory accurate by reporting outdated information.
              </p>
              <button className="w-full px-4 py-2 text-sm bg-calmTeal text-white rounded-lg hover:bg-calmTeal/90 transition-colors font-sans font-medium">
                Report Issue
              </button>
              <p className="text-xs text-mistGrey mt-2 text-center">Help us keep this accurate and safe.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
