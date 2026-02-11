/**
 * Happy Senses - Venue Data Types
 * Comprehensive type definitions for venues with sensory and accessibility information
 */

// Equipment height options for play areas
export type EquipmentHeight = 
  | 'toddler'    // Ages 2-5, low to ground
  | 'low'        // Low to ground, minimal climbing
  | 'medium'     // Moderate height equipment
  | 'high'       // Higher equipment, more climbing
  | 'various'    // Mix of heights available
  | undefined;

// Certification types for sensory-friendly spaces
export type SensoryCertification = 
  | 'autism-friendly'
  | 'sensory-friendly'
  | 'inclusive'
  | 'accessibility-certified'
  | 'verified'
  | undefined;

// Core venue information
export interface VenueCore {
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

// Sensory information (1-5 scales where 1 = best/lowest)
export interface VenueSensory {
  sens_noise_1to5: number | null;       // 1 = quiet, 5 = loud
  sens_light_1to5: number | null;       // 1 = dim, 5 = bright
  sens_crowd_1to5: number | null;       // 1 = empty, 5 = crowded
  sens_quiet_room: boolean | null;      // Dedicated quiet room available
  sens_headphones: boolean | null;      // Noise-canceling headphones available
  sens_staff_trained: boolean | null;    // Staff trained in sensory needs
  sens_certification: SensoryCertification;
  sens_last_verified: string | null;    // ISO date string
  sens_score_avg: number | null;        // Computed overall score 0-100
  ai_accessibility_summary: string | null; // AI-generated summary
}

// Accessibility and child safety features
export interface VenueAccessibility {
  accessible: boolean | null;           // Wheelchair accessible
  fenced: boolean | null;               // Fenced area for children
  near_water: boolean | null;            // Near water body (warning flag)
  equipment_height: EquipmentHeight;    // Play equipment height suitability
}

// Community engagement metrics
export interface VenueCommunity {
  upvotes: number;
  downvotes: number;
  notes_count: number;
}

// Complete Venue type
export interface Venue extends VenueCore, VenueSensory, VenueAccessibility, VenueCommunity {}

// Raw CSV row type (before parsing)
export interface RawVenueRow {
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  address: string;
  lat: string;
  lng: string;
  website: string;
  phone: string;
  email: string;
  image_url: string;
  sens_noise_1to5: string;
  sens_light_1to5: string;
  sens_crowd_1to5: string;
  sens_quiet_room: string;
  sens_headphones: string;
  sens_staff_trained: string;
  sens_certification: string;
  sens_last_verified: string;
  sens_score_avg: string;
  sens_accessibility_summary: string;
  category_tags: string;
  'AI Sensory Accessibility Summary': string;
  'Geocode Status': string;
  'Review Status': string;
  'Last Verified Age': string;
}

// Filter options
export interface VenueFilters {
  search: string;
  category: string;
  city: string;
  sensory_friendly: boolean | null;    // Quiet room OR headphones OR staff trained
  quiet_room: boolean | null;
  headphones: boolean | null;
  staff_trained: boolean | null;
  accessible: boolean | null;
  fenced: boolean | null;
  not_near_water: boolean | null;
}

// Sort options
export type SortOption = 
  | 'sensory_score'    // Best sensory score first
  | 'most_upvoted'    // Most upvotes first
  | 'recently_verified' // Most recently verified first
  | 'closest_match';   // Closest to search criteria (placeholder)

// Community note
export interface VenueNote {
  id: string;
  displayName: string;
  noteText: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

// In-memory storage for community data (replace with database later)
export interface CommunityData {
  votes: Record<string, { upvotes: number; downvotes: number }>;
  notes: Record<string, VenueNote[]>;
}

// API Response types
export interface VoteRequest {
  slug: string;
  direction: 'up' | 'down';
}

export interface VoteResponse {
  success: boolean;
  upvotes: number;
  downvotes: number;
}

export interface NoteRequest {
  slug: string;
  displayName?: string;
  noteText: string;
}

export interface NoteResponse {
  success: boolean;
  notes: VenueNote[];
}
