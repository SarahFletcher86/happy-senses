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
  VenueFilters,
  SortOption,
  EquipmentHeight,
  SensoryCertification,
} from './types';

let venuesCache: Venue[] | null = null;

function parseString(value: string | null | undefined): string {
  if (!value || value.trim() === '' || value === 'NaN') return '';
  return value.trim();
}

function parseNumber(value: string | null | undefined): number | null {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return null;
  const num = parseFloat(value);
  return Number.isNaN(num) ? null : num;
}

function parseBoolean(value: string | null | undefined): boolean | null {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return null;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === 'yes' || lower === '1' || lower === '✅';
}

function parseEquipmentHeight(value: string | null | undefined): EquipmentHeight {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return undefined;
  const lower = value.toLowerCase().trim();
  if (['toddler', 'low', 'medium', 'high', 'various'].includes(lower)) return lower as EquipmentHeight;
  return undefined;
}

function parseCertification(value: string | null | undefined): SensoryCertification {
  if (!value || value.trim() === '' || value === 'NaN' || value === 'undefined') return undefined;
  const lower = value.toLowerCase().trim();
  if (['autism-friendly', 'sensory-friendly', 'inclusive', 'accessibility-certified', 'verified'].includes(lower)) {
    return lower as SensoryCertification;
  }
  return undefined;
}

function normalizeCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  const categoryMap: Record<string, string> = {
    'community centre': 'Community Centre',
    'community center': 'Community Centre',
    park: 'Park',
    parks: 'Park',
    museum: 'Museum',
    library: 'Library',
    cafe: 'Café',
    restaurant: 'Restaurant',
    playground: 'Playground',
    'indoor playground': 'Indoor Playground',
    'nature reserve': 'Nature Reserve',
    trail: 'Trail',
    beach: 'Beach',
    pool: 'Pool',
    'recreation centre': 'Recreation Centre',
    school: 'School',
    church: 'Church',
  };
  return categoryMap[normalized] || category;
}

export function computeOverallScore(venue: Partial<Venue>): number {
  const noise = venue.sens_noise_1to5 ?? 3;
  const light = venue.sens_light_1to5 ?? 3;
  const crowd = venue.sens_crowd_1to5 ?? 3;
  const sensoryAvg = (noise + light + crowd) / 3;
  const baseScore = ((5 - sensoryAvg) / 4) * 60;

  let bonus = 0;
  if (venue.sens_quiet_room === true) bonus += 10;
  if (venue.sens_headphones === true) bonus += 8;
  if (venue.sens_staff_trained === true) bonus += 12;
  if (venue.sens_certification) bonus += 10;

  let penalty = 0;
  const nearWater = venue.near_water ?? null;
  const fenced = venue.fenced ?? null;
  if (nearWater === true && fenced !== true) penalty -= 10;
  if (nearWater === true && fenced === true) penalty -= 3;

  const score = Math.round(baseScore + bonus + penalty);
  return Math.max(0, Math.min(100, score));
}

function parseVenueRow(row: RawVenueRow): Venue {
  return {
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
    sens_noise_1to5: parseNumber(row.sens_noise_1to5),
    sens_light_1to5: parseNumber(row.sens_light_1to5),
    sens_crowd_1to5: parseNumber(row.sens_crowd_1to5),
    sens_quiet_room: parseBoolean(row.sens_quiet_room),
    sens_headphones: parseBoolean(row.sens_headphones),
    sens_staff_trained: parseBoolean(row.sens_staff_trained),
    sens_certification: parseCertification(row.sens_certification),
    sens_last_verified: parseString(row.sens_last_verified),
    sens_score_avg:
      parseNumber(row.sens_score_avg) ??
      computeOverallScore({
        sens_noise_1to5: parseNumber(row.sens_noise_1to5),
        sens_light_1to5: parseNumber(row.sens_light_1to5),
        sens_crowd_1to5: parseNumber(row.sens_crowd_1to5),
        sens_quiet_room: parseBoolean(row.sens_quiet_room),
        sens_headphones: parseBoolean(row.sens_headphones),
        sens_staff_trained: parseBoolean(row.sens_staff_trained),
        sens_certification: parseCertification(row.sens_certification),
        near_water: parseBoolean((row as any).near_water),
        fenced: parseBoolean((row as any).fenced),
      }),
    ai_accessibility_summary: parseString(row['AI Sensory Accessibility Summary'] || row.sens_accessibility_summary),
    accessible: parseBoolean((row as any).accessible),
    fenced: parseBoolean((row as any).fenced),
    near_water: parseBoolean((row as any).near_water),
    equipment_height: parseEquipmentHeight((row as any).equipment_height),
    upvotes: 0,
    downvotes: 0,
    notes_count: 0,
  };
}

function parseCsvToVenues(csvContent: string): Venue[] {
  const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true }) as RawVenueRow[];
  return records.map(parseVenueRow);
}

function loadLocalCsv(): Venue[] {
  const csvPath = join(process.cwd(), 'data', 'venues.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  return parseCsvToVenues(csvContent);
}

export async function loadVenues(): Promise<Venue[]> {
  if (venuesCache) return venuesCache;

  const sheetsUrl = process.env.GOOGLE_SHEETS_CSV_URL;
  if (sheetsUrl) {
    try {
      const response = await fetch(sheetsUrl, { next: { revalidate: 300 } });
      if (!response.ok) throw new Error(`Google Sheets CSV fetch failed (${response.status})`);
      const csvContent = await response.text();
      venuesCache = parseCsvToVenues(csvContent);
      return venuesCache;
    } catch (error) {
      console.error('Failed to load Google Sheets CSV, using local fallback:', error);
    }
  }

  try {
    venuesCache = loadLocalCsv();
    return venuesCache;
  } catch (error) {
    console.error('Error loading local venues CSV:', error);
    return [];
  }
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const venues = await loadVenues();
  return venues.find((v) => v.slug === slug) || null;
}

export function getCategories(venues: Venue[]): string[] {
  return Array.from(new Set(venues.map((v) => v.category).filter(Boolean))).sort();
}

export function getCities(venues: Venue[]): string[] {
  return Array.from(new Set(venues.filter((v) => v.city).map((v) => v.city))).sort();
}

export function filterVenues(venues: Venue[], filters: VenueFilters): Venue[] {
  return venues.filter((venue) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        venue.name.toLowerCase().includes(searchLower) ||
        venue.city.toLowerCase().includes(searchLower) ||
        venue.address.toLowerCase().includes(searchLower) ||
        venue.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.category && filters.category !== 'All' && venue.category !== filters.category) return false;
    if (filters.city && filters.city !== 'All' && venue.city !== filters.city) return false;
    if (filters.sensory_friendly === true) {
      if (!(venue.sens_quiet_room === true || venue.sens_headphones === true || venue.sens_staff_trained === true)) {
        return false;
      }
    }
    if (filters.quiet_room === true && venue.sens_quiet_room !== true) return false;
    if (filters.headphones === true && venue.sens_headphones !== true) return false;
    if (filters.staff_trained === true && venue.sens_staff_trained !== true) return false;
    if (filters.accessible === true && venue.accessible !== true) return false;
    if (filters.fenced === true && venue.fenced !== true) return false;
    if (filters.not_near_water === true && venue.near_water === true) return false;
    return true;
  });
}

export function sortVenues(venues: Venue[], sortBy: SortOption): Venue[] {
  const sorted = [...venues];
  switch (sortBy) {
    case 'sensory_score':
      return sorted.sort((a, b) => (b.sens_score_avg ?? 0) - (a.sens_score_avg ?? 0));
    case 'most_upvoted':
      return sorted.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    case 'recently_verified':
      return sorted.sort(
        (a, b) =>
          (b.sens_last_verified ? new Date(b.sens_last_verified).getTime() : 0) -
          (a.sens_last_verified ? new Date(a.sens_last_verified).getTime() : 0),
      );
    case 'closest_match':
    default:
      return sorted;
  }
}

export function getSensoryLevelLabel(value: number | null): string {
  if (value === null) return 'Unknown';
  if (value <= 1) return 'Very Low';
  if (value <= 2) return 'Low';
  if (value === 3) return 'Moderate';
  if (value <= 4) return 'High';
  return 'Very High';
}

export function getNoiseDescription(value: number | null): string {
  if (value === null) return 'Noise level unknown';
  if (value <= 1) return 'Very quiet - minimal sound';
  if (value <= 2) return 'Quiet - calm environment';
  if (value === 3) return 'Moderate - typical noise levels';
  if (value <= 4) return 'Busy - noticeable noise';
  return 'Loud - high noise environment';
}

export function getLightDescription(value: number | null): string {
  if (value === null) return 'Lighting unknown';
  if (value <= 1) return 'Dim lighting - low stimulation';
  if (value <= 2) return 'Soft lighting - comfortable';
  if (value === 3) return 'Moderate lighting - standard';
  if (value <= 4) return 'Bright lighting - well-lit';
  return 'Very bright - high illumination';
}

export function getCrowdDescription(value: number | null): string {
  if (value === null) return 'Crowd level unknown';
  if (value <= 1) return 'Usually empty';
  if (value <= 2) return 'Light crowds';
  if (value === 3) return 'Moderate crowds';
  if (value <= 4) return 'Often crowded';
  return 'Very crowded - high traffic';
}
