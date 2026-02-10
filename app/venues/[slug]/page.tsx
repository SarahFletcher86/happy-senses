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

// Mock notes data (replace with database later)
function getVenueNotes(slug: string): VenueNote[] {
  return [
    {
      id: '1',
      displayName: 'Sarah M.',
      noteText: 'Great quiet room for sensory breaks. Staff was very understanding of our needs.',
      createdAt: '2024-01-15',
      upvotes: 5,
      downvotes: 0,
    },
    {
      id: '2',
      displayName: 'Mike T.',
      noteText: 'Visited with autistic child. The fenced area made it easy to relax.',
      createdAt: '2024-01-10',
      upvotes: 3,
      downvotes: 0,
    },
  ];
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  
  if (!venue) {
    notFound();
  }

  const notes = getVenueNotes(slug);
  const score = venue.sens_score_avg ?? 0;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
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
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  venue.category === 'Park' ? 'bg-green-100 text-green-700' :
                  venue.category === 'Community Centre' ? 'bg-blue-100 text-blue-700' :
                  venue.category === 'Museum' ? 'bg-purple-100 text-purple-700' :
                  venue.category === 'Library' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {venue.category}
                </span>
                {venue.sens_certification && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {venue.sens_certification}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
              <p className="text-gray-500 mt-1">
                {venue.city || 'Ontario, Canada'}
              </p>
            </div>
            
            {/* Score Badge */}
            <div className="flex flex-col items-end">
              <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-white', getScoreColor(score))}>
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-sm font-medium">/100</span>
              </div>
              <span className="text-sm text-gray-500 mt-1">Sensory Score</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location & Contact */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Location & Contact</h2>
              <div className="space-y-3">
                {venue.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{venue.address}</p>
                      <p className="text-gray-500">{venue.city || 'Ontario'}</p>
                    </div>
                  </div>
                )}
                {venue.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a 
                      href={venue.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
                {venue.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${venue.phone}`} className="text-blue-600 hover:text-blue-700">
                      {venue.phone}
                    </a>
                  </div>
                )}
                {venue.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${venue.email}`} className="text-blue-600 hover:text-blue-700">
                      {venue.email}
                    </a>
                  </div>
                )}
                {venue.sens_last_verified && (
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Calendar className="w-5 h-5 text-gray-400" />
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
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Community Notes</h2>
                <span className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
              </div>
              
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map(note => (
                    <div key={note.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{note.displayName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{note.noteText}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-emerald-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{note.upvotes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          <span>{note.downvotes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No community notes yet. Be the first to share your experience!</p>
              )}

              {/* Add Note Form */}
              <form className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add a Note</h3>
                <textarea
                  placeholder="Share your experience at this venue..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Note
                  </button>
                </div>
              </form>
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
              <button className="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Report Issue
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
