import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import type { Category, RawCandidate } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const OUTPUT_PATH = path.resolve(__dirname, 'checkpoints/phase2-candidates.csv');
const BLOCKLIST_CSV = path.resolve(__dirname, '../../data/venues.cleaned.csv');

const BBOXES = {
  toronto: '43.5810,-79.6392,43.8555,-79.1152',
  ottawa: '45.2473,-75.9195,45.5376,-75.2480',
  gta_east: '43.7000,-79.1000,44.0000,-78.7000',
  gta_west: '43.4500,-80.0000,43.7000,-79.5000',
  kwg: '43.3500,-80.6000,43.7000,-80.1000',
} as const;

const WEDGE_BBOX = '43.3500,-80.6000,45.5376,-75.2480';

const OSM_QUERIES: Record<string, (bbox: string) => string> = {
  cafe: (bbox) => `
    [out:json][timeout:60];
    (
      node["amenity"="cafe"](${bbox});
      way["amenity"="cafe"](${bbox});
    );
    out center tags;
  `,
  indoor_play: (bbox) => `
    [out:json][timeout:60];
    (
      node["amenity"="indoor_playground"](${bbox});
      way["amenity"="indoor_playground"](${bbox});
      node["shop"="children"](${bbox});
      way["shop"="children"](${bbox});
      node["leisure"="indoor_play"](${bbox});
      way["leisure"="indoor_play"](${bbox});
    );
    out center tags;
  `,
  hairdresser: (bbox) => `
    [out:json][timeout:60];
    (
      node["shop"="hairdresser"](${bbox});
      way["shop"="hairdresser"](${bbox});
    );
    out center tags;
  `,
  dentist: (bbox) => `
    [out:json][timeout:60];
    (
      node["amenity"="dentist"](${bbox});
      way["amenity"="dentist"](${bbox});
    );
    out center tags;
  `,
  museum: (bbox) => `
    [out:json][timeout:60];
    (
      node["tourism"="museum"](${bbox});
      way["tourism"="museum"](${bbox});
    );
    out center tags;
  `,
  attraction: (bbox) => `
    [out:json][timeout:60];
    (
      node["tourism"="attraction"](${bbox});
      way["tourism"="attraction"](${bbox});
      node["leisure"="water_park"](${bbox});
      way["leisure"="water_park"](${bbox});
      node["leisure"="amusement_arcade"](${bbox});
    );
    out center tags;
  `,
  library: (bbox) => `
    [out:json][timeout:60];
    (
      node["amenity"="library"](${bbox});
      way["amenity"="library"](${bbox});
    );
    out center tags;
  `,
  community_centre: (bbox) => `
    [out:json][timeout:60];
    (
      node["amenity"="community_centre"](${bbox});
      way["amenity"="community_centre"](${bbox});
      node["amenity"="social_centre"](${bbox});
    );
    out center tags;
  `,
};

const OSM_CATEGORY_MAP: Record<string, Category> = {
  cafe: 'cafe',
  indoor_play: 'indoor_play',
  hairdresser: 'hairdresser_dentist',
  dentist: 'hairdresser_dentist',
  museum: 'museum',
  attraction: 'attraction',
  library: 'library',
  community_centre: 'community_centre',
};

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function loadExistingNames(csvPath: string): Set<string> {
  const names = new Set<string>();
  if (!existsSync(csvPath)) return names;

  const content = readFileSync(csvPath, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>;
  for (const row of records) {
    const name = String(row.name ?? '').trim().toLowerCase();
    const city = String(row.city ?? '').trim().toLowerCase();
    if (name) names.add(`${name}|${city}`);
  }

  return names;
}

async function runOverpassQuery(query: string): Promise<OverpassElement[]> {
  const res = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass returned ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { elements?: OverpassElement[] };
  return data.elements ?? [];
}

function buildAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  return parts.join(' ').trim() || tags['addr:full'] || '';
}

function normalizeWebsite(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function inferCity(lat: number, lon: number): string {
  if (lat > 45.2 && lat < 45.6) return 'Ottawa';
  if (lat > 43.6 && lat < 43.9 && lon > -79.65 && lon < -79.1) return 'Toronto';
  if (lat > 43.3 && lat < 43.7 && lon > -80.6 && lon < -80.1) return 'Kitchener';
  if (lat > 43.6 && lat < 43.95 && lon > -79.9 && lon < -79.45) return 'Mississauga';
  return 'Ontario';
}

function writeCsv(candidates: RawCandidate[], outputPath: string): void {
  const records = candidates.map((candidate) => ({
    name: candidate.name,
    category: candidate.category,
    address: candidate.address,
    city: candidate.city,
    province: candidate.province,
    country: candidate.country,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    website: candidate.website ?? '',
    phone: candidate.phone ?? '',
    source: candidate.source,
    osm_id: candidate.osmId ?? '',
  }));

  const csv = stringify(records, {
    header: true,
    columns: [
      'name',
      'category',
      'address',
      'city',
      'province',
      'country',
      'latitude',
      'longitude',
      'website',
      'phone',
      'source',
      'osm_id',
    ],
  });

  writeFileSync(outputPath, csv);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const existingNames = loadExistingNames(BLOCKLIST_CSV);
  console.log(`Blocklist loaded: ${existingNames.size} existing venue names.`);

  const allCandidates: RawCandidate[] = [];
  const seen = new Set<string>();

  for (const [categoryKey, queryFn] of Object.entries(OSM_QUERIES)) {
    const category = OSM_CATEGORY_MAP[categoryKey];
    console.log(`Querying OSM for category: ${categoryKey} (${category})...`);

    try {
      const query = queryFn(WEDGE_BBOX);
      const elements = await runOverpassQuery(query);
      console.log(`  -> ${elements.length} raw results`);

      for (const element of elements) {
        const tags = element.tags ?? {};
        const name = tags.name ?? tags['name:en'] ?? '';
        if (!name.trim()) continue;

        const website = tags.website ?? tags['contact:website'] ?? '';
        if (!website.trim()) continue;

        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        if (typeof lat !== 'number' || typeof lon !== 'number') continue;

        const normalizedName = name.trim().toLowerCase();
        const dedupKey = `${normalizedName}|${Math.round(lat * 10000)}|${Math.round(lon * 10000)}`;
        if (seen.has(dedupKey)) continue;

        const city = String(tags['addr:city'] ?? tags.city ?? inferCity(lat, lon)).trim();
        const blocklistKey = `${normalizedName}|${city.toLowerCase()}`;
        if (existingNames.has(blocklistKey)) continue;

        seen.add(dedupKey);

        allCandidates.push({
          name: name.trim(),
          category,
          address: buildAddress(tags),
          city,
          province: String(tags['addr:province'] ?? tags['addr:state'] ?? 'ON').trim(),
          country: 'CA',
          latitude: lat,
          longitude: lon,
          website: normalizeWebsite(website),
          phone: String(tags.phone ?? tags['contact:phone'] ?? '').trim() || null,
          source: 'osm',
          osmId: String(element.id),
        });
      }

      await sleep(1500);
    } catch (err) {
      console.warn(`[phase2] Error querying ${categoryKey}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`Total candidates after filtering: ${allCandidates.length}`);
  writeCsv(allCandidates, OUTPUT_PATH);
  console.log(`Phase 2 complete. Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[phase2] Fatal error:', err);
  process.exit(1);
});
