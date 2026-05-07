export type EquipmentHeight =
  | 'toddler'
  | 'low'
  | 'medium'
  | 'high'
  | 'various'
  | undefined;

export type SensoryCertification =
  | 'autism-friendly'
  | 'sensory-friendly'
  | 'inclusive'
  | 'accessibility-certified'
  | 'verified'
  | undefined;

export type VenueTier = '✓ Trusted' | 'Promising' | 'Help us verify' | string;

export interface VenueCore {
  recordId?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  website: string;
  phone: string;
  email: string;
  image_url: string;
}

export interface VenueSensory {
  sens_noise_1to5: number | null;
  sens_light_1to5: number | null;
  sens_crowd_1to5: number | null;
  sens_quiet_room: boolean | null;
  sens_headphones: boolean | null;
  sens_staff_trained: boolean | null;
  sens_certification: SensoryCertification;
  sens_last_verified: string | null;
  sens_score_avg: number | null;
  sens_accessibility_summary: string | null;
  ai_accessibility_summary: string | null;
  sensory_signals: string[];
}

export interface VenueAccessibility {
  accessible: boolean | null;
  fenced: boolean | null;
  near_water: boolean | null;
  equipment_height: EquipmentHeight;
}

export interface VenueCommunity {
  community_upvotes: number;
  community_downvotes: number;
  community_notes_count: number;
}

export interface VenueMeta {
  tier: VenueTier;
  confidence_score: number | null;
  source: string;
  published: boolean;
  google_place_id: string;
  google_rating: number | null;
  google_review_count: number | null;
  google_top_reviews: string[];
}

export interface Venue extends VenueCore, VenueSensory, VenueAccessibility, VenueCommunity, VenueMeta {}

export interface VenueFilters {
  search: string;
  category: string;
  city: string;
  sensory_friendly: boolean | null;
  quiet_room: boolean | null;
  headphones: boolean | null;
  staff_trained: boolean | null;
  accessible: boolean | null;
  fenced: boolean | null;
  not_near_water: boolean | null;
}

export type SortOption =
  | 'sensory_score'
  | 'most_upvoted'
  | 'recently_verified'
  | 'closest_match';

export interface VenueNote {
  id: string;
  displayName: string;
  noteText: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

export interface VoteRequest {
  slug: string;
  type?: 'up' | 'down';
  direction?: 'up' | 'down';
}

export interface VoteResponse {
  success: boolean;
  upvotes: number;
  downvotes: number;
}

export interface NoteRequest {
  slug: string;
  note_text: string;
  submitter_name?: string;
  submitter_email?: string;
}

export interface NoteResponse {
  success: boolean;
  notes: VenueNote[];
  message?: string;
}

export interface VenueDataState {
  venues: Venue[];
  source: 'airtable' | 'csv-fallback';
  warning: string | null;
}
