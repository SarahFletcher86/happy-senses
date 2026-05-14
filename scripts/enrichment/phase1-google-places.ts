import Airtable from 'airtable';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AIRTABLE_FIELD_MAP, type GooglePlacesData } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKPOINT_PATH = path.resolve(__dirname, 'checkpoints/phase1-results.json');
const PLACES_API_BASE = 'https://places.googleapis.com/v1';
const THROTTLE_MS = 300;
const MAX_API_CALLS = 3000;

let apiCallCount = 0;

type AirtableRecord = Airtable.Record<Airtable.FieldSet>;

interface GooglePlacesAPIResponse {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: Array<{
    text?: { text?: string };
    originalText?: { text?: string };
  }>;
  photos?: Array<{ name: string }>;
  regularOpeningHours?: unknown;
}

interface Phase1Checkpoint {
  lastProcessedRecordId: string | null;
  results: Record<string, GooglePlacesData>;
  errors: Record<string, string>;
  completedAt: string | null;
}

function resolveEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function trackApiCall(): void {
  apiCallCount += 1;
  if (apiCallCount > MAX_API_CALLS) {
    throw new Error(`API call ceiling reached (${MAX_API_CALLS} calls). Stopping to protect budget.`);
  }
}

function loadCheckpoint(): Phase1Checkpoint {
  mkdirSync(path.dirname(CHECKPOINT_PATH), { recursive: true });

  if (!existsSync(CHECKPOINT_PATH)) {
    return {
      lastProcessedRecordId: null,
      results: {},
      errors: {},
      completedAt: null,
    };
  }

  return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8')) as Phase1Checkpoint;
}

function saveCheckpoint(checkpoint: Phase1Checkpoint): void {
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

async function resolveGooglePlaceId(
  name: string,
  address: string,
  city: string,
  apiKey: string
): Promise<string | null> {
  const query = `${name} ${address} ${city}`.trim();
  if (!query) return null;

  trackApiCall();
  const res = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
  });

  if (!res.ok) {
    throw new Error(`Text search failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { places?: Array<{ id: string }> };
  return data.places?.[0]?.id ?? null;
}

async function fetchPlaceDetails(placeId: string, apiKey: string): Promise<GooglePlacesData> {
  const fieldMask = ['id', 'rating', 'userRatingCount', 'reviews', 'photos', 'regularOpeningHours'].join(',');

  trackApiCall();
  const res = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!res.ok) {
    throw new Error(`Place details failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as GooglePlacesAPIResponse;

  const topReviews = (data.reviews ?? [])
    .slice(0, 3)
    .map((review) => review.text?.text ?? review.originalText?.text ?? '')
    .map((text) => text.trim())
    .filter(Boolean);

  const photosUrls = (data.photos ?? [])
    .slice(0, 5)
    .map((photo) => `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${apiKey}`);

  return {
    placeId: data.id ?? placeId,
    rating: data.rating ?? null,
    reviewCount: data.userRatingCount ?? null,
    topReviews,
    photosUrls,
    currentHours: data.regularOpeningHours ? JSON.stringify(data.regularOpeningHours) : null,
  };
}

async function enrichVenue(
  name: string,
  address: string,
  city: string,
  existingPlaceId: string | undefined,
  apiKey: string
): Promise<GooglePlacesData> {
  let placeId = existingPlaceId ?? null;

  if (!placeId) {
    placeId = await resolveGooglePlaceId(name, address, city, apiKey);
  }

  if (!placeId) {
    return {
      placeId: null,
      rating: null,
      reviewCount: null,
      topReviews: [],
      photosUrls: [],
      currentHours: null,
    };
  }

  return fetchPlaceDetails(placeId, apiKey);
}

function buildAirtableFields(data: GooglePlacesData): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  if (data.placeId) fields[AIRTABLE_FIELD_MAP.googlePlaceId] = data.placeId;
  if (data.rating !== null) fields[AIRTABLE_FIELD_MAP.googleRating] = data.rating;
  if (data.reviewCount !== null) fields[AIRTABLE_FIELD_MAP.googleReviewCount] = data.reviewCount;
  if (data.topReviews.length > 0) {
    fields[AIRTABLE_FIELD_MAP.googleTopReviews] = data.topReviews.join('\n\n---\n\n');
  }

  return fields;
}

async function flushBatch(
  base: Airtable.Base,
  tableId: string,
  batch: Array<{ id: string; fields: Record<string, unknown> }>
): Promise<void> {
  if (batch.length === 0) return;
  await base(tableId).update(batch as never);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const apiKey = resolveEnv('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not set in environment. Abort.');
    process.exit(1);
  }

  const pat = resolveEnv('AIRTABLE_API_KEY', 'AIRTABLE_PAT');
  const baseId = resolveEnv('AIRTABLE_BASE_ID') ?? 'appHcNkYj60ku5j1d';
  const tableId =
    resolveEnv('AIRTABLE_TABLE_ID', 'AIRTABLE_VENUES_TABLE_ID') ?? 'tblChLJtCmN2HW7LQ';

  if (!pat) {
    console.error('AIRTABLE_API_KEY or AIRTABLE_PAT not set. Abort.');
    process.exit(1);
  }

  const checkpoint = loadCheckpoint();
  if (checkpoint.completedAt) {
    console.log(`Phase 1 already completed at ${checkpoint.completedAt}. Skipping.`);
    return;
  }

  const base = new Airtable({ apiKey: pat }).base(baseId);
  const records: AirtableRecord[] = [];
  await base(tableId)
    .select({ fields: ['name', 'address', 'city', 'province', 'google_place_id'] })
    .eachPage((page, fetchNext) => {
      records.push(...page);
      fetchNext();
    });

  console.log(`Fetched ${records.length} records from Airtable.`);

  let processedSinceSave = 0;
  const batch: Array<{ id: string; fields: Record<string, unknown> }> = [];

  for (const record of records) {
    const recordId = record.id;
    if (checkpoint.results[recordId] || checkpoint.errors[recordId]) {
      continue;
    }

    const name = String(record.fields.name ?? '').trim();
    const address = String(record.fields.address ?? '').trim();
    const city = String(record.fields.city ?? '').trim();
    const existingPlaceId =
      typeof record.fields.google_place_id === 'string' ? record.fields.google_place_id : undefined;

    try {
      const data = await enrichVenue(name, address, city, existingPlaceId, apiKey);
      checkpoint.results[recordId] = data;
      checkpoint.lastProcessedRecordId = recordId;

      const fields = buildAirtableFields(data);
      if (Object.keys(fields).length > 0) {
        batch.push({ id: recordId, fields });
      }

      processedSinceSave += 1;

      if (batch.length >= 10) {
        await flushBatch(base, tableId, batch);
        batch.length = 0;
      }

      if (processedSinceSave >= 10) {
        saveCheckpoint(checkpoint);
        console.log(`Checkpoint saved. Total processed: ${Object.keys(checkpoint.results).length}`);
        processedSinceSave = 0;
      }
    } catch (err) {
      checkpoint.errors[recordId] = err instanceof Error ? err.message : String(err);
      checkpoint.lastProcessedRecordId = recordId;
      console.warn(`[phase1] Error for record ${recordId}: ${checkpoint.errors[recordId]}`);
      saveCheckpoint(checkpoint);
    }

    await sleep(THROTTLE_MS);
  }

  if (batch.length > 0) {
    await flushBatch(base, tableId, batch);
  }

  checkpoint.completedAt = new Date().toISOString();
  saveCheckpoint(checkpoint);

  console.log(
    `Phase 1 complete. Enriched: ${Object.keys(checkpoint.results).length}. Errors: ${Object.keys(checkpoint.errors).length}.`
  );
}

main().catch((err) => {
  console.error('[phase1] Fatal error:', err);
  process.exit(1);
});
