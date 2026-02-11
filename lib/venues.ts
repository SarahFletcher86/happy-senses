/**
 * Happy Senses - Venue Data Loader
 * Server-side CSV parsing and venue data management
 */

import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  Venue,
  RawVenueRow,
  EquipmentHeight,
  SensoryCertification,
} from './types';

// Cache for loaded venues (avoids re-parsing on every request)
let venuesCache: Venue[] | null = null;

/**
 * Parse a string value safely, returning empty string for invalid values
 */
function parseString(value: string | null | undefined): string {
  if (!value || value.trim() === '' || value === 'NaN') return '';
  return value.trim();
}

/**
 * Parse a number safely, returning null for invalid values
 */
function parseNumber(value: string | null | undefined): number | null {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Parse a boolean safely from various CSV representations
 */
function parseBoolean(value: string | null | undefined): boolean | null {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return null;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === 'yes' || lower === '1' || lower === '✅';
}

/**
 * Parse equipment height enum
 */
function parseEquipmentHeight(value: string | null | undefined): EquipmentHeight {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return undefined;
  const lower = value.toLowerCase().trim();
  if (['toddler', 'low', 'medium', 'high', 'various'].includes(lower)) {
    return lower as EquipmentHeight;
  }
  return undefined;
}

/**
 * Parse sensory certification
 */
function parseCertification(value: string | null | undefined): SensoryCertification {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return undefined;
  const lower = value.toLowerCase().trim();
  if (['autism-friendly', 'sensory-friendly', 'inclusive', 'accessibility-certified', 'verified'].includes(lower)) {
    return lower as SensoryCertification;
  }
  return undefined;
}

/**
 * Normalize category names (handle variations)
 */
function normalizeCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  
  // Map common variations to standard names
  const categoryMap: Record<string, string> = {
    'community centre': 'Community Centre',
    'community center': 'Community Centre',
    'park': 'Park',
    'parks': 'Park',
    'museum': 'Museum',
    'library': 'Library',
    'cafe': 'Café',
    'restaurant': 'Restaurant',
    'playground': 'Playground',
    'indoor playground': 'Indoor Playground',
    'nature reserve': 'Nature Reserve',
    'trail': 'Trail',
    'beach': 'Beach',
    'pool': 'Pool',
    'recreation centre': 'Recreation Centre',
    'school': 'School',
    'church': 'Church',
  };
  
  return categoryMap[normalized] || category;
}

/**
 * Compute the overall sensory score for a venue (0-100)
 * Lower sensory burden = higher score
 */
export function computeOverallScore(venue: Partial<Venue>): number {
  // Base score from sensory scales (lower is better, so invert)
  const noise = venue.sens_noise_1to5 ?? 3;
  const light = venue.sens_light_1to5 ?? 3;
  const crowd = venue.sens_crowd_1to5 ?? 3;
  
  // Average of 1-5 scales, inverted to 0-4, then scaled to 0-60
  const sensoryAvg = (noise + light + crowd) / 3;
  const baseScore = ((5 - sensoryAvg) / 4) * 60;
  
  // Bonuses
  let bonus = 0;
  if (venue.sens_quiet_room === true) bonus += 10;
  if (venue.sens_headphones === true) bonus += 8;
  if (venue.sens_staff_trained === true) bonus += 12;
  if (venue.sens_certification) bonus += 10;
  
  // Penalties
  let penalty = 0;
  const nearWater = venue.near_water ?? null;
  const fenced = venue.fenced ?? null;
  if (nearWater === true && fenced !== true) penalty -= 10;
  if (nearWater === true && fenced === true) penalty -= 3;
  
  // Final score bounded 0-100
  const score = Math.round(baseScore + bonus + penalty);
  return Math.max(0, Math.min(100, score));
}

/**
 * Parse a single raw CSV row into a Venue object
 */
function parseVenueRow(row: RawVenueRow): Venue {
  return {
    // Core fields
    name: parseString(row.name),
    slug: parseString(row.slug),
    category: normalizeCategory(parseString(row.category)),
    description: parseString(row.description),
    city: parseString(row.city),
    address: parseString(row.address),
    lat: parseNumber(row.lat) ?? 0,
    lng: parseNumber(row.lng) ?? 0,
    website: parseString(row.website),
    phone: parseString(row.phone),
    email: parseString(row.email),
    image_url: parseString(row.image_url),
    
    // Sensory fields
    sens_noise_1to5: parseNumber(row.sens_noise_1to5),
    sens_light_1to5: parseNumber(row.sens_light_1to5),
    sens_crowd_1to5: parseNumber(row.sens_crowd_1to5),
    sens_quiet_room: parseBoolean(row.sens_quiet_room),
    sens_headphones: parseBoolean(row.sens_headphones),
    sens_staff_trained: parseBoolean(row.sens_staff_trained),
    sens_certification: parseCertification(row.sens_certification),
    sens_last_verified: parseString(row.sens_last_verified),
    sens_score_avg: parseNumber(row.sens_score_avg) ?? computeOverallScore({
      sens_noise_1to5: parseNumber(row.sens_noise_1to5),
      sens_light_1to5: parseNumber(row.sens_light_1to5),
      sens_crowd_1to5: parseNumber(row.sens_crowd_1to5),
      sens_quiet_room: parseBoolean(row.sens_quiet_room),
      sens_headphones: parseBoolean(row.sens_headphones),
      sens_staff_trained: parseBoolean(row.sens_staff_trained),
      sens_certification: parseCertification(row.sens_certification),
      near_water: null,
      fenced: null,
    }),
    ai_accessibility_summary: parseString(row['AI Sensory Accessibility Summary'] || row.sens_accessibility_summary),
    
    // Accessibility fields (defaults for now, can be populated from CSV)
    accessible: null,
    fenced: null,
    near_water: null,
    equipment_height: undefined,
    
    // Community fields
    upvotes: 0,
    downvotes: 0,
    notes_count: 0,
  };
}

/**
 * Load all venues from the CSV file
 * Cached for performance
 */
export function loadVenues(): Venue[] {
  if (venuesCache) {
    return venuesCache;
  }

  try {
    const csvPath = join(process.cwd(), 'data', 'venues.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as RawVenueRow[];
    
    venuesCache = records.map(parseVenueRow);
    
    return venuesCache;
  } catch (error) {
    console.error('Error loading venues CSV:', error);
    return [];
  }
}

/**
 * Get a single venue by slug
 */
export function getVenueBySlug(slug: string): Venue | null {
  const venues = loadVenues();
  return venues.find(v => v.slug === slug) || null;
}

/**
 * Get all unique categories from venues
 */
export function getCategories(): string[] {
  const venues = loadVenues();
  const categories = new Set(venues.map(v => v.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique cities from venues
 */
export function getCities(): string[] {
  const venues = loadVenues();
  const cities = new Set(venues.filter(v => v.city).map(v => v.city));
  return Array.from(cities).sort();
}

export { filterVenues, sortVenues } from './venue-filters';

/**
 * Get sensory level label for display
 */
export function getSensoryLevelLabel(value: number | null): string {
  if (value === null) return 'Unknown';
  if (value <= 1) return 'Very Low';
  if (value <= 2) return 'Low';
  if (value === 3) return 'Moderate';
  if (value <= 4) return 'High';
  return 'Very High';
}

/**
 * Get sensory level description for noise
 */
export function getNoiseDescription(value: number | null): string {
  if (value === null) return 'Noise level unknown';
  if (value <= 1) return 'Very quiet - minimal sound';
  if (value <= 2) return 'Quiet - calm environment';
  if (value === 3) return 'Moderate - typical noise levels';
  if (value <= 4) return 'Busy - noticeable noise';
  return 'Loud - high noise environment';
}

/**
 * Get sensory level description for light
 */
export function getLightDescription(value: number | null): string {
  if (value === null) return 'Lighting unknown';
  if (value <= 1) return 'Dim lighting - low stimulation';
  if (value <= 2) return 'Soft lighting - comfortable';
  if (value === 3) return 'Moderate lighting - standard';
  if (value <= 4) return 'Bright lighting - well-lit';
  return 'Very bright - high illumination';
}

/**
 * Get sensory level description for crowd
 */
export function getCrowdDescription(value: number | null): string {
  if (value === null) return 'Crowd level unknown';
  if (value <= 1) return 'Usually empty';
  if (value <= 2) return 'Light crowds';
  if (value === 3) return 'Moderate crowds';
  if (value <= 4) return 'Often crowded';
  return 'Very crowded - high traffic';
}
