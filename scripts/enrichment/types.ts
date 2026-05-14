export interface RawCandidate {
  name: string;
  category: Category;
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  website: string | null;
  phone: string | null;
  source: 'osm' | 'airtable_existing';
  osmId?: string;
  airtableRecordId?: string;
}

export interface GooglePlacesData {
  placeId: string | null;
  rating: number | null;
  reviewCount: number | null;
  topReviews: string[];
  photosUrls: string[];
  currentHours: string | null;
}

export interface SensorySignalResult {
  rawMarkdown: string | null;
  signals: string[];
  flags: SensoryFlag[];
  crawlSuccess: boolean;
  crawlError: string | null;
}

export type SensoryFlag =
  | 'quiet_hours'
  | 'sensory_hours'
  | 'sensory_friendly'
  | 'autism_friendly'
  | 'headphones_available'
  | 'fragrance_free'
  | 'calm_light'
  | 'dim_lighting'
  | 'fenced_playground'
  | 'quiet_room'
  | 'aba_therapy'
  | 'occupational_therapy'
  | 'neurodivergent';

export interface ScreeningResult {
  score: number;
  tier: Tier;
  reasoning: string;
  sensorySummary: string;
  sensNoiseScore: number | null;
  sensLightScore: number | null;
  sensCrowdScore: number | null;
  accFenced: boolean;
  accNearWater: boolean;
  accAccessible: boolean;
  sensQuietRoom: boolean;
  sensHeadphones: boolean;
  sensStaffTrained: boolean;
  sensFragranceFree: boolean;
}

export type Tier = 'Promising' | 'Help us verify';

export type Category =
  | 'park'
  | 'library'
  | 'museum'
  | 'community_centre'
  | 'cafe'
  | 'indoor_play'
  | 'hairdresser_dentist'
  | 'attraction';

export interface EnrichedVenue extends RawCandidate {
  googlePlaces: GooglePlacesData;
  sensorySignals: SensorySignalResult;
  screening: ScreeningResult;
}

// This map reflects the current repo/Airtable field names consumed by the app.
export const AIRTABLE_FIELD_MAP = {
  name: 'name',
  slug: 'slug',
  category: 'category',
  address: 'address',
  city: 'city',
  province: 'province',
  country: 'country',
  latitude: 'lat',
  longitude: 'lng',
  website: 'website',
  phone: 'phone',
  tier: 'tier',
  confidenceScore: 'confidence_score',
  source: 'source',
  sensorySignals: 'sensory_signals',
  published: 'published',
  googlePlaceId: 'google_place_id',
  googleRating: 'google_rating',
  googleReviewCount: 'google_review_count',
  googleTopReviews: 'google_top_reviews',
  sensNoise: 'sens_noise_1to5',
  sensLight: 'sens_light_1to5',
  sensCrowd: 'sens_crowd_1to5',
  accFenced: 'fenced',
  accNearWater: 'near_water',
  accEquipmentHeight: 'equipment_height',
  accAccessible: 'accessible',
  sensQuietRoom: 'sens_quiet_room',
  sensHeadphones: 'sens_headphones',
  sensStaffTrained: 'sens_staff_trained',
  sensFragranceFree: 'sens_fragrance_free',
} as const;
