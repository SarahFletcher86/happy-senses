/**
 * Happy Senses - Venue Data Loader
 * Server-side CSV parsing and venue data management
 */

import Papa from 'papaparse';
import 'server-only';
import type { Venue, EquipmentHeight, SensoryCertification } from './types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

const VENUES_CSV_URL =
  process.env.VENUES_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZRmCwJEGzut93nuw3XA9cbBN6WXXvPYQ9fENg1n5GWvDHdSZ9gzWhr1Dy6Yb3I34MEsQzTAHsG_Ye/pub?output=csv';

// Cache for loaded venues (avoids re-parsing on every request)
let venuesCache: Venue[] | null = null;
let venuesPromise: Promise<Venue[]> | null = null;

const sensoryCertificationValues = [
  'autism-friendly',
  'sensory-friendly',
  'inclusive',
  'accessibility-certified',
  'verified',
] as const;

const equipmentHeightValues = ['toddler', 'low', 'medium', 'high', 'various'] as const;

const toStr = (value: unknown): string => {
  const str = String(value ?? '').trim();
  if (!str || str === 'NaN' || str === 'undefined') return '';
  return str;
};

const toBool = (value: unknown): boolean | null => {
  const str = String(value ?? '').trim().toLowerCase();
  if (!str || str === 'nan' || str === 'undefined') return null;
  return str === 'true' || str === '1' || str === 'yes' || str === 'y' || str === '✅';
};

const toNum = (value: unknown): number | null => {
  const str = String(value ?? '').trim();
  if (!str || str === 'NaN' || str === 'undefined') return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
};

const toNumDefault = (fallback: number) => (value: unknown) => {
  const num = toNum(value);
  return num === null ? fallback : num;
};

const toCertification = (value: unknown): SensoryCertification | undefined => {
  const lower = toStr(value).toLowerCase();
  if (!lower) return undefined;
  if (sensoryCertificationValues.includes(lower as SensoryCertification)) {
    return lower as SensoryCertification;
  }
  return undefined;
};

const toEquipmentHeight = (value: unknown): EquipmentHeight => {
  const lower = toStr(value).toLowerCase();
  if (!lower) return undefined;
  if (equipmentHeightValues.includes(lower as EquipmentHeight)) {
    return lower as EquipmentHeight;
  }
  return undefined;
};

const toCategory = (value: unknown): string => normalizeCategory(toStr(value));

const VenueSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.preprocess(toCategory, z.string()),
  description: z.preprocess(toStr, z.string()),
  city: z.preprocess(toStr, z.string()),
  address: z.preprocess(toStr, z.string()),
  website: z.preprocess(toStr, z.string()),
  phone: z.preprocess(toStr, z.string()),
  email: z.preprocess(toStr, z.string()),
  image_url: z.preprocess(toStr, z.string()),
  lat: z.preprocess(toNum, z.number().nullable()),
  lng: z.preprocess(toNum, z.number().nullable()),
  sens_noise_1to5: z.preprocess(toNum, z.number().min(1).max(5).nullable()),
  sens_light_1to5: z.preprocess(toNum, z.number().min(1).max(5).nullable()),
  sens_crowd_1to5: z.preprocess(toNum, z.number().min(1).max(5).nullable()),
  sens_quiet_room: z.preprocess(toBool, z.boolean().nullable()),
  sens_headphones: z.preprocess(toBool, z.boolean().nullable()),
  sens_staff_trained: z.preprocess(toBool, z.boolean().nullable()),
  sens_certification: z.preprocess(toCertification, z.enum(sensoryCertificationValues).optional()),
  sens_last_verified: z.preprocess(toStr, z.string().nullable()),
  sens_score_avg: z.preprocess(toNum, z.number().min(0).max(100).nullable()),
  ai_accessibility_summary: z.preprocess(toStr, z.string().nullable()),
  accessible: z.preprocess(toBool, z.boolean().nullable()),
  fenced: z.preprocess(toBool, z.boolean().nullable()),
  near_water: z.preprocess(toBool, z.boolean().nullable()),
  equipment_height: z.preprocess(toEquipmentHeight, z.enum(equipmentHeightValues).optional()),
  upvotes: z.preprocess(toNumDefault(0), z.number().min(0)),
  downvotes: z.preprocess(toNumDefault(0), z.number().min(0)),
  notes_count: z.preprocess(toNumDefault(0), z.number().min(0)),
});

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

async function loadCsvContent(): Promise<string> {
  try {
    const response = await fetch(VENUES_CSV_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch venues CSV: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.warn('[venues] Failed to fetch remote CSV, falling back to local file.', error);
    const csvPath = join(process.cwd(), 'data', 'venues.csv');
    return readFileSync(csvPath, 'utf-8');
  }
}

function parseCsvVenues(csvText: string): {
  venues: Venue[];
  totalRows: number;
  validRows: number;
} {
  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = Array.isArray(parsed.data) ? parsed.data : [];
  const venues: Venue[] = [];

  for (const row of rows) {
    const normalizedRow = {
      name: row.name,
      slug: row.slug,
      category: row.category,
      description: row.description,
      city: row.city,
      address: row.address,
      website: row.website,
      phone: row.phone,
      email: row.email,
      image_url: row.image_url,
      lat: row.lat,
      lng: row.lng,
      sens_noise_1to5: row.sens_noise_1to5,
      sens_light_1to5: row.sens_light_1to5,
      sens_crowd_1to5: row.sens_crowd_1to5,
      sens_quiet_room: row.sens_quiet_room,
      sens_headphones: row.sens_headphones,
      sens_staff_trained: row.sens_staff_trained,
      sens_certification: row.sens_certification,
      sens_last_verified: row.sens_last_verified,
      sens_score_avg: row.sens_score_avg,
      ai_accessibility_summary:
        row['AI Sensory Accessibility Summary'] ??
        row.sens_accessibility_summary ??
        row.ai_accessibility_summary,
      accessible: row.accessible_playground ?? row.accessible,
      fenced: row.fenced_in ?? row.fenced,
      near_water: row.near_water,
      equipment_height: row.equipment_height,
      upvotes: row.upvotes ?? 0,
      downvotes: row.downvotes ?? 0,
      notes_count: row.notes_count ?? 0,
    };

    const result = VenueSchema.safeParse(normalizedRow);
    if (result.success) {
      const venue = result.data;
      if (venue.sens_score_avg === null) {
        venue.sens_score_avg = computeOverallScore(venue);
      }
      venues.push(venue);
    }
  }

  return {
    venues,
    totalRows: rows.length,
    validRows: venues.length,
  };
}

/**
 * Load all venues from the CSV file
 * Cached for performance
 */
export async function loadVenues(): Promise<Venue[]> {
  if (venuesCache) {
    return venuesCache;
  }

  if (!venuesPromise) {
    venuesPromise = (async () => {
      try {
        const csvContent = await loadCsvContent();
        const { venues, totalRows, validRows } = parseCsvVenues(csvContent);
        const skipped = Math.max(0, totalRows - validRows);
        venuesCache = venues;
        console.info(`[venues] Loaded ${validRows} venues. Skipped ${skipped} invalid rows.`);
        return venuesCache;
      } catch (error) {
        console.error('Error loading venues CSV:', error);
        venuesCache = [];
        return venuesCache;
      }
    })();
  }

  return venuesPromise;
}

/**
 * Get a single venue by slug
 */
export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const venues = await loadVenues();
  return venues.find(v => v.slug === slug) || null;
}

/**
 * Get all unique categories from venues
 */
export async function getCategories(): Promise<string[]> {
  const venues = await loadVenues();
  const categories = new Set(venues.map(v => v.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique cities from venues
 */
export async function getCities(): Promise<string[]> {
  const venues = await loadVenues();
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
