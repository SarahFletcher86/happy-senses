import Airtable from 'airtable';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { AIRTABLE_FIELD_MAP, type ScreeningResult } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANDIDATES_CSV = path.resolve(__dirname, 'checkpoints/phase2-candidates.csv');
const SCREENING_JSON = path.resolve(__dirname, 'checkpoints/phase4-screening.json');
const SIGNALS_JSON = path.resolve(__dirname, 'checkpoints/phase3-signals.json');
const PUSH_LOG_PATH = path.resolve(__dirname, 'checkpoints/phase5-push-log.json');

interface PushLog {
  inserted: string[];
  updated: string[];
  skipped: string[];
  errors: string[];
}

interface CandidateRow {
  name: string;
  category: string;
  city: string;
  website: string;
  address: string;
  province: string;
  country: string;
  latitude: string;
  longitude: string;
  phone: string;
  source: string;
  osm_id: string;
}

function resolveEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function loadPushLog(): PushLog {
  if (!existsSync(PUSH_LOG_PATH)) {
    return { inserted: [], updated: [], skipped: [], errors: [] };
  }

  return JSON.parse(readFileSync(PUSH_LOG_PATH, 'utf8')) as PushLog;
}

function savePushLog(pushLog: PushLog): void {
  writeFileSync(PUSH_LOG_PATH, JSON.stringify(pushLog, null, 2));
}

function generateSlug(name: string, city: string): string {
  return `${name} ${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function mapCategory(osmCategory: string): string {
  const map: Record<string, string> = {
    cafe: 'Cafe',
    indoor_play: 'Indoor Play',
    hairdresser_dentist: 'Hairdresser / Dentist',
    museum: 'Museum',
    attraction: 'Attraction',
    library: 'Library',
    community_centre: 'Community Centre',
    park: 'Park',
  };
  return map[osmCategory] ?? osmCategory;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const pat = resolveEnv('AIRTABLE_API_KEY', 'AIRTABLE_PAT');
  const baseId = resolveEnv('AIRTABLE_BASE_ID') ?? 'appHcNkYj60ku5j1d';
  const tableId =
    resolveEnv('AIRTABLE_TABLE_ID', 'AIRTABLE_VENUES_TABLE_ID') ?? 'tblChLJtCmN2HW7LQ';

  if (!pat) {
    console.error('AIRTABLE_API_KEY or AIRTABLE_PAT not set. Abort.');
    process.exit(1);
  }

  const base = new Airtable({ apiKey: pat }).base(baseId);
  const pushLog = loadPushLog();

  const screening = JSON.parse(readFileSync(SCREENING_JSON, 'utf8')) as {
    results: Record<string, ScreeningResult>;
  };
  const signals = JSON.parse(readFileSync(SIGNALS_JSON, 'utf8')) as Record<
    string,
    { success: boolean; snippets?: string[]; flags?: string[] }
  >;

  const candidates = parse(readFileSync(CANDIDATES_CSV, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
  }) as CandidateRow[];

  const existingNames = new Set<string>();
  const existingSlugs = new Set<string>();
  await base(tableId)
    .select({ fields: ['name', 'slug', 'city'] })
    .eachPage((page, fetchNext) => {
      for (const record of page) {
        const name = String(record.fields.name ?? '').trim().toLowerCase();
        const slug = String(record.fields.slug ?? '').trim();
        const city = String(record.fields.city ?? '').trim().toLowerCase();

        if (name) existingNames.add(`${name}|${city}`);
        if (slug) existingSlugs.add(slug);
      }
      fetchNext();
    });

  console.log(`Existing Airtable names loaded: ${existingNames.size}`);

  const toInsert: Array<{ fields: Record<string, unknown> }> = [];

  for (const candidate of candidates) {
    const key = `${candidate.name}|${candidate.city}`;
    const nameKey = `${candidate.name.toLowerCase()}|${candidate.city.toLowerCase()}`;

    if (pushLog.inserted.includes(key) || pushLog.skipped.includes(key)) continue;

    if (existingNames.has(nameKey)) {
      pushLog.skipped.push(key);
      continue;
    }

    const screeningResult = screening.results[key];
    if (!screeningResult || screeningResult.score < 50) {
      pushLog.skipped.push(key);
      continue;
    }

    const signalData = signals[candidate.website ?? ''];
    const snippets = signalData?.snippets ?? [];

    let slugBase = generateSlug(candidate.name, candidate.city);
    let slug = slugBase;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }
    existingSlugs.add(slug);

    const sensorySignalsText =
      snippets.length > 0
        ? `AI screened. Web signals found:\n\n${snippets.join('\n\n---\n\n')}`
        : 'AI screened. No sensory signals found on website.';

    const fields: Record<string, unknown> = {
      [AIRTABLE_FIELD_MAP.name]: candidate.name,
      [AIRTABLE_FIELD_MAP.slug]: slug,
      [AIRTABLE_FIELD_MAP.category]: mapCategory(candidate.category),
      [AIRTABLE_FIELD_MAP.address]: candidate.address,
      [AIRTABLE_FIELD_MAP.city]: candidate.city,
      [AIRTABLE_FIELD_MAP.province]: candidate.province,
      [AIRTABLE_FIELD_MAP.country]: candidate.country,
      [AIRTABLE_FIELD_MAP.latitude]: Number.parseFloat(candidate.latitude),
      [AIRTABLE_FIELD_MAP.longitude]: Number.parseFloat(candidate.longitude),
      [AIRTABLE_FIELD_MAP.website]: candidate.website || undefined,
      [AIRTABLE_FIELD_MAP.phone]: candidate.phone || undefined,
      [AIRTABLE_FIELD_MAP.tier]: screeningResult.tier,
      [AIRTABLE_FIELD_MAP.confidenceScore]: screeningResult.score,
      [AIRTABLE_FIELD_MAP.source]: 'osm_crawl4ai_screened',
      [AIRTABLE_FIELD_MAP.sensorySignals]: sensorySignalsText,
      [AIRTABLE_FIELD_MAP.published]: false,
      [AIRTABLE_FIELD_MAP.sensNoise]: screeningResult.sensNoiseScore ?? undefined,
      [AIRTABLE_FIELD_MAP.sensLight]: screeningResult.sensLightScore ?? undefined,
      [AIRTABLE_FIELD_MAP.sensCrowd]: screeningResult.sensCrowdScore ?? undefined,
      [AIRTABLE_FIELD_MAP.accFenced]: screeningResult.accFenced,
      [AIRTABLE_FIELD_MAP.accNearWater]: screeningResult.accNearWater,
      [AIRTABLE_FIELD_MAP.accAccessible]: screeningResult.accAccessible,
      [AIRTABLE_FIELD_MAP.sensQuietRoom]: screeningResult.sensQuietRoom,
      [AIRTABLE_FIELD_MAP.sensHeadphones]: screeningResult.sensHeadphones,
      [AIRTABLE_FIELD_MAP.sensStaffTrained]: screeningResult.sensStaffTrained,
      [AIRTABLE_FIELD_MAP.sensFragranceFree]: screeningResult.sensFragranceFree,
    };

    for (const keyName of Object.keys(fields)) {
      if (fields[keyName] === null || fields[keyName] === undefined || Number.isNaN(fields[keyName])) {
        delete fields[keyName];
      }
    }

    toInsert.push({ fields });
    pushLog.inserted.push(key);
  }

  console.log(`Inserting ${toInsert.length} net-new venues...`);

  for (let index = 0; index < toInsert.length; index += 10) {
    const batch = toInsert.slice(index, index + 10);
    try {
      await base(tableId).create(batch as never);
      console.log(`Inserted batch ${Math.floor(index / 10) + 1}/${Math.ceil(toInsert.length / 10)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[phase5] Insert batch failed: ${message}`);
      pushLog.errors.push(message);
    }

    savePushLog(pushLog);
    await sleep(300);
  }

  savePushLog(pushLog);
  console.log(
    `Phase 5 complete. Inserted: ${pushLog.inserted.length}. Skipped: ${pushLog.skipped.length}. Errors: ${pushLog.errors.length}.`
  );
}

main().catch((err) => {
  console.error('[phase5] Fatal error:', err);
  process.exit(1);
});
