import Papa from 'papaparse';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import {
  fetchApprovedNotes,
  isAirtableConfigured,
} from './airtable';
import {
  getCrowdDescription,
  getDisplaySensoryValue,
  getLightDescription,
  getNoiseDescription,
  getSensoryLevelLabel,
} from './sensory-utils';
import type {
  EquipmentHeight,
  SensoryCertification,
  Venue,
  VenueDataState,
  VenueNote,
  VenueTier,
} from './types';

const sensoryCertificationValues = [
  'autism-friendly',
  'sensory-friendly',
  'inclusive',
  'accessibility-certified',
  'verified',
] as const;

const equipmentHeightValues = ['toddler', 'low', 'medium', 'high', 'various'] as const;
const AIRTABLE_API = 'https://api.airtable.com/v0';

const venueSchema = z.object({
  recordId: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string(),
  description: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  website: z.string(),
  phone: z.string(),
  email: z.string(),
  image_url: z.string(),
  sens_noise_1to5: z.number().min(1).max(5).nullable(),
  sens_light_1to5: z.number().min(1).max(5).nullable(),
  sens_crowd_1to5: z.number().min(1).max(5).nullable(),
  sens_quiet_room: z.boolean().nullable(),
  sens_headphones: z.boolean().nullable(),
  sens_staff_trained: z.boolean().nullable(),
  sens_certification: z.enum(sensoryCertificationValues).optional(),
  sens_last_verified: z.string().nullable(),
  sens_score_avg: z.number().nullable(),
  sens_accessibility_summary: z.string().nullable(),
  ai_accessibility_summary: z.string().nullable(),
  sensory_signals: z.array(z.string()),
  accessible: z.boolean().nullable(),
  fenced: z.boolean().nullable(),
  near_water: z.boolean().nullable(),
  equipment_height: z.enum(equipmentHeightValues).optional(),
  community_upvotes: z.number().int().nonnegative(),
  community_downvotes: z.number().int().nonnegative(),
  community_notes_count: z.number().int().nonnegative(),
  tier: z.string(),
  confidence_score: z.number().nullable(),
  source: z.string(),
  published: z.boolean(),
  google_place_id: z.string(),
  google_rating: z.number().nullable(),
  google_review_count: z.number().nullable(),
  google_top_reviews: z.array(z.string()),
});

function toStr(value: unknown): string {
  const str = String(value ?? '').trim();
  if (!str || str === 'undefined' || str === 'null' || str === 'NaN') {
    return '';
  }
  return str;
}

function toNum(value: unknown): number | null {
  const str = toStr(value);
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function toBool(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  const str = toStr(value).toLowerCase();
  if (!str) return null;
  if (['true', '1', 'yes', 'y', 'checked', 'available'].includes(str)) return true;
  if (['false', '0', 'no', 'n'].includes(str)) return false;
  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toStr(item)).filter(Boolean);
  }

  const str = toStr(value);
  if (!str) return [];
  return str
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCertification(value: unknown): SensoryCertification {
  const lower = toStr(value).toLowerCase();
  if ((sensoryCertificationValues as readonly string[]).includes(lower)) {
    return lower as SensoryCertification;
  }
  return undefined;
}

function toEquipmentHeight(value: unknown): EquipmentHeight {
  const lower = toStr(value).toLowerCase();
  if ((equipmentHeightValues as readonly string[]).includes(lower)) {
    return lower as EquipmentHeight;
  }
  return undefined;
}

function getField(fields: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in fields && fields[key] !== undefined && fields[key] !== null && fields[key] !== '') {
      return fields[key];
    }
  }
  return undefined;
}

function normalizeTier(value: unknown): VenueTier {
  const tier = toStr(value);
  if (!tier) return 'Help us verify';

  const lower = tier.toLowerCase();
  if (lower.includes('trusted') || lower.includes('verified')) return '✓ Trusted';
  if (lower.includes('promising') || lower.includes('likely')) return 'Promising';
  return 'Help us verify';
}

export function computeOverallScore(venue: Partial<Venue>): number {
  const values = [
    getDisplaySensoryValue(venue.sens_noise_1to5 ?? null),
    getDisplaySensoryValue(venue.sens_light_1to5 ?? null),
    getDisplaySensoryValue(venue.sens_crowd_1to5 ?? null),
  ].filter((value): value is number => value !== null);

  if (values.length === 0) {
    return 0;
  }

  const sensoryScore = values.reduce((sum, value) => sum + value, 0) / values.length;
  let bonus = 0;
  if (venue.sens_quiet_room) bonus += 0.4;
  if (venue.sens_headphones) bonus += 0.25;
  if (venue.sens_staff_trained) bonus += 0.35;
  if (venue.sens_certification) bonus += 0.3;

  return Math.max(0, Math.min(100, Math.round(((sensoryScore + bonus) / 5.9) * 100)));
}

function normalizeVenue(input: Record<string, unknown> & { recordId?: string }): Venue {
  const parsed = venueSchema.parse({
    recordId: input.recordId,
    name: toStr(getField(input, ['name'])),
    slug: toStr(getField(input, ['slug'])),
    category: toStr(getField(input, ['category'])) || 'Community Space',
    description: toStr(getField(input, ['description'])),
    city: toStr(getField(input, ['city'])),
    address: toStr(getField(input, ['address'])),
    lat: toNum(getField(input, ['lat'])),
    lng: toNum(getField(input, ['lng'])),
    website: toStr(getField(input, ['website'])),
    phone: toStr(getField(input, ['phone'])),
    email: toStr(getField(input, ['email'])),
    image_url: toStr(getField(input, ['image_url', 'image'])),
    sens_noise_1to5: toNum(getField(input, ['sens_noise_1to5'])),
    sens_light_1to5: toNum(getField(input, ['sens_light_1to5'])),
    sens_crowd_1to5: toNum(getField(input, ['sens_crowd_1to5'])),
    sens_quiet_room: toBool(getField(input, ['sens_quiet_room'])),
    sens_headphones: toBool(getField(input, ['sens_headphones'])),
    sens_staff_trained: toBool(getField(input, ['sens_staff_trained'])),
    sens_certification: toCertification(getField(input, ['sens_certification'])),
    sens_last_verified: toStr(getField(input, ['sens_last_verified'])) || null,
    sens_score_avg: toNum(getField(input, ['sens_score_avg'])),
    sens_accessibility_summary:
      toStr(
        getField(input, [
          'sens_accessibility_summary',
          'ai_accessibility_summary',
          'AI Sensory Accessibility Summary',
        ])
      ) || null,
    ai_accessibility_summary:
      toStr(
        getField(input, [
          'ai_accessibility_summary',
          'sens_accessibility_summary',
          'AI Sensory Accessibility Summary',
        ])
      ) || null,
    sensory_signals: toStringArray(getField(input, ['sensory_signals'])),
    accessible: toBool(getField(input, ['accessible'])),
    fenced: toBool(getField(input, ['fenced'])),
    near_water: toBool(getField(input, ['near_water'])),
    equipment_height: toEquipmentHeight(getField(input, ['equipment_height'])),
    community_upvotes: toNum(getField(input, ['community_upvotes', 'upvotes'])) ?? 0,
    community_downvotes: toNum(getField(input, ['community_downvotes', 'downvotes'])) ?? 0,
    community_notes_count: toNum(getField(input, ['community_notes_count', 'notes_count'])) ?? 0,
    tier: normalizeTier(getField(input, ['tier'])),
    confidence_score: toNum(getField(input, ['confidence_score'])),
    source: toStr(getField(input, ['source'])) || 'Airtable',
    published: toBool(getField(input, ['published'])) ?? true,
    google_place_id: toStr(getField(input, ['google_place_id'])),
    google_rating: toNum(getField(input, ['google_rating'])),
    google_review_count: toNum(getField(input, ['google_review_count'])),
    google_top_reviews: toStringArray(getField(input, ['google_top_reviews'])),
  });

  return {
    recordId: parsed.recordId,
    name: parsed.name,
    slug: parsed.slug,
    category: parsed.category,
    description: parsed.description,
    city: parsed.city,
    address: parsed.address,
    lat: parsed.lat,
    lng: parsed.lng,
    website: parsed.website,
    phone: parsed.phone,
    email: parsed.email,
    image_url: parsed.image_url,
    sens_noise_1to5: parsed.sens_noise_1to5,
    sens_light_1to5: parsed.sens_light_1to5,
    sens_crowd_1to5: parsed.sens_crowd_1to5,
    sens_quiet_room: parsed.sens_quiet_room,
    sens_headphones: parsed.sens_headphones,
    sens_staff_trained: parsed.sens_staff_trained,
    sens_certification: parsed.sens_certification,
    sens_last_verified: parsed.sens_last_verified,
    sens_score_avg: parsed.sens_score_avg ?? computeOverallScore(parsed),
    sens_accessibility_summary: parsed.sens_accessibility_summary,
    ai_accessibility_summary: parsed.ai_accessibility_summary,
    sensory_signals: parsed.sensory_signals,
    accessible: parsed.accessible,
    fenced: parsed.fenced,
    near_water: parsed.near_water,
    equipment_height: parsed.equipment_height,
    community_upvotes: parsed.community_upvotes,
    community_downvotes: parsed.community_downvotes,
    community_notes_count: parsed.community_notes_count,
    tier: parsed.tier,
    confidence_score: parsed.confidence_score,
    source: parsed.source,
    published: parsed.published,
    google_place_id: parsed.google_place_id,
    google_rating: parsed.google_rating,
    google_review_count: parsed.google_review_count,
    google_top_reviews: parsed.google_top_reviews,
  };
}

function parseCsvVenues(): Venue[] {
  const csvPath = join(process.cwd(), 'data', 'venues.cleaned.csv');
  const csv = readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return (parsed.data as Record<string, unknown>[])
    .map((row: Record<string, unknown>) =>
      normalizeVenue({
        ...row,
        published: true,
        source: 'CSV fallback',
      })
    )
    .filter((venue: Venue) => venue.published);
}

function getAirtableConfig() {
  return {
    baseId: process.env.AIRTABLE_BASE_ID!,
    venuesTableId: process.env.AIRTABLE_VENUES_TABLE_ID!,
    pat: process.env.AIRTABLE_PAT!,
  };
}

function quoteFormulaValue(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function buildAirtableHeaders(pat: string) {
  return { Authorization: `Bearer ${pat}` };
}

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

function mapAirtableRecordToVenue(record: AirtableRecord): Venue {
  return normalizeVenue({
    ...record.fields,
    recordId: record.id,
    published: true,
  });
}

async function loadVenuesFromAirtable(): Promise<Venue[]> {
  const { baseId, venuesTableId, pat } = getAirtableConfig();
  const all: Venue[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${AIRTABLE_API}/${baseId}/${venuesTableId}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('filterByFormula', '{published}=TRUE()');
    url.searchParams.set('sort[0][field]', 'name');
    url.searchParams.set('sort[0][direction]', 'asc');
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const res = await fetch(url.toString(), {
      headers: buildAirtableHeaders(pat),
      next: { revalidate: 300, tags: ['venues'] },
    });

    if (!res.ok) {
      throw new Error(`Airtable venues request failed with ${res.status}`);
    }

    const data = (await res.json()) as { records?: AirtableRecord[]; offset?: string };
    all.push(...(data.records ?? []).map(mapAirtableRecordToVenue));
    offset = data.offset;
  } while (offset);

  return all;
}

export async function loadVenueDataState(): Promise<VenueDataState> {
  if (!isAirtableConfigured()) {
    return {
      venues: parseCsvVenues(),
      source: 'csv-fallback',
      warning: null,
    };
  }

  try {
    const venues = await loadVenuesFromAirtable();
    return {
      venues,
      source: 'airtable',
      warning: null,
    };
  } catch (error) {
    console.warn('[venues] Airtable failed, falling back to CSV.', error);
    return {
      venues: parseCsvVenues(),
      source: 'csv-fallback',
      warning: 'Showing cached venues',
    };
  }
}

export async function loadVenues(): Promise<Venue[]> {
  const { venues } = await loadVenueDataState();
  return venues;
}

export async function getAllVenues(): Promise<Venue[]> {
  return loadVenues();
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  if (isAirtableConfigured()) {
    try {
      const { baseId, venuesTableId, pat } = getAirtableConfig();
      const url = new URL(`${AIRTABLE_API}/${baseId}/${venuesTableId}`);
      url.searchParams.set(
        'filterByFormula',
        `AND({published}=TRUE(), {slug}=${quoteFormulaValue(slug)})`
      );
      url.searchParams.set('maxRecords', '1');

      const res = await fetch(url.toString(), {
        headers: buildAirtableHeaders(pat),
        next: { revalidate: 300, tags: [`venue:${slug}`] },
      });

      if (res.ok) {
        const data = (await res.json()) as { records?: AirtableRecord[] };
        const record = data.records?.[0];
        if (record) {
          return mapAirtableRecordToVenue(record);
        }
        return null;
      }
    } catch (error) {
      console.warn('[venues] Failed to load venue by slug from Airtable, using cached data.', error);
    }
  }

  const venues = await loadVenues();
  return venues.find((venue) => venue.slug === slug) ?? null;
}

export async function getCategories(): Promise<string[]> {
  const venues = await loadVenues();
  return Array.from(new Set(venues.map((venue) => venue.category))).sort();
}

export async function getCities(): Promise<string[]> {
  const venues = await loadVenues();
  return Array.from(new Set(venues.map((venue) => venue.city).filter(Boolean))).sort();
}

export async function getApprovedNotesBySlug(slug: string): Promise<VenueNote[]> {
  const venue = await getVenueBySlug(slug);
  if (!venue?.recordId || !isAirtableConfigured()) {
    return [];
  }

  try {
    return await fetchApprovedNotes(venue.recordId);
  } catch (error) {
    console.warn('[venues] Failed to load approved notes.', error);
    return [];
  }
}

export { filterVenues, sortVenues } from './venue-filters';

export {
  getCrowdDescription,
  getDisplaySensoryValue,
  getLightDescription,
  getNoiseDescription,
  getSensoryLevelLabel,
};
