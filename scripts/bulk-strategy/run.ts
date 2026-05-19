/**
 * Bulk default-tier pass for Happy Senses venues.
 *
 * Usage:
 *   pnpm bulk-strategy --dry-run   # count what would change, write nothing
 *   pnpm bulk-strategy             # execute the updates
 *
 * Reads AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_VENUES_TABLE_ID from .env.local.
 */

import { config as loadEnv } from 'dotenv';
import Airtable from 'airtable';

loadEnv({ path: '.env.local' });

const PAT = process.env.AIRTABLE_PAT?.trim();
const BASE_ID = process.env.AIRTABLE_BASE_ID?.trim() || 'appHcNkYj60ku5j1d';
const TABLE_ID = process.env.AIRTABLE_VENUES_TABLE_ID?.trim() || 'tblChLJtCmN2HW7LQ';

if (!PAT) {
  console.error('Missing AIRTABLE_PAT in environment. Add it to .env.local.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

// Exact tier strings - must match the Airtable SingleSelect enum.
const TIER_VERIFIED = 'Tier 1 - Verified';
const TIER_LIKELY = 'Tier 2 - Likely';
const TIER_NEEDS_VERIFICATION = 'Tier 3 - Needs Verification';
const TIER_HIDDEN = 'Hidden';

const ATMOSPHERIC_CATEGORIES = new Set(['Park', 'Museum', 'Community Centre']);
const HIGHRISK_CATEGORIES = new Set([
  'Café',
  'Restaurant',
  'Hairdresser',
  'Dentist',
  'Movie Theatre',
  'Movie Theatre ',
  'Indoor Play',
  'Attraction',
  'Other',
]);

type VenueRecord = {
  id: string;
  category?: string;
  tier?: string;
  published?: boolean;
  community_upvotes?: number;
  community_downvotes?: number;
  community_notes_count?: number;
  parked_for_later?: boolean;
  name?: string;
};

type Bucket = 'library' | 'atmospheric' | 'highrisk' | 'excluded' | 'no_change';

type WritableFields = Partial<Pick<VenueRecord, 'tier' | 'published' | 'parked_for_later'>>;

type BatchUpdate = {
  id: string;
  fields: WritableFields;
  name?: string;
};

function shouldExclude(record: VenueRecord): boolean {
  if (record.tier === TIER_VERIFIED) return true;
  if ((record.community_upvotes ?? 0) > 0) return true;
  if ((record.community_downvotes ?? 0) > 0) return true;
  if ((record.community_notes_count ?? 0) > 0) return true;
  if (record.parked_for_later === true) return true;
  if (record.published !== true) return true;
  return false;
}

function classify(record: VenueRecord): { bucket: Bucket; patch?: WritableFields } {
  if (shouldExclude(record)) return { bucket: 'excluded' };

  const category = record.category ?? '';

  if (category === 'Library') {
    if (record.tier === TIER_LIKELY) return { bucket: 'no_change' };
    return { bucket: 'library', patch: { tier: TIER_LIKELY } };
  }

  if (ATMOSPHERIC_CATEGORIES.has(category)) {
    if (record.tier === TIER_NEEDS_VERIFICATION) return { bucket: 'no_change' };
    return { bucket: 'atmospheric', patch: { tier: TIER_NEEDS_VERIFICATION } };
  }

  if (category === '' || HIGHRISK_CATEGORIES.has(category)) {
    if (
      record.tier === TIER_HIDDEN &&
      record.published === false &&
      record.parked_for_later === true
    ) {
      return { bucket: 'no_change' };
    }

    return {
      bucket: 'highrisk',
      patch: { tier: TIER_HIDDEN, published: false, parked_for_later: true },
    };
  }

  console.warn(
    `Unrecognised category "${category}" on record ${record.id} (${record.name ?? '?'}). Skipping.`
  );
  return { bucket: 'excluded' };
}

async function paginateAll(table: Airtable.Table<Airtable.FieldSet>): Promise<VenueRecord[]> {
  const out: VenueRecord[] = [];

  await table
    .select({
      pageSize: 100,
      fields: [
        'name',
        'category',
        'tier',
        'published',
        'community_upvotes',
        'community_downvotes',
        'community_notes_count',
        'parked_for_later',
      ],
    })
    .eachPage((records, fetchNextPage) => {
      for (const record of records) {
        const fields = record.fields as Partial<VenueRecord>;
        out.push({
          id: record.id,
          name: fields.name,
          category: fields.category,
          tier: fields.tier,
          published: fields.published,
          community_upvotes: fields.community_upvotes,
          community_downvotes: fields.community_downvotes,
          community_notes_count: fields.community_notes_count,
          parked_for_later: fields.parked_for_later,
        });
      }

      console.log(`  fetched ${out.length} records so far...`);
      fetchNextPage();
    });

  return out;
}

async function updateBatched(
  table: Airtable.Table<Airtable.FieldSet>,
  updates: BatchUpdate[],
  label: string
): Promise<void> {
  console.log(`\n${label}: updating ${updates.length} records...`);

  const BATCH_SIZE = 10;
  const RATE_LIMIT_MS = 250;

  for (let index = 0; index < updates.length; index += BATCH_SIZE) {
    const chunk = updates.slice(index, index + BATCH_SIZE);
    await table.update(
      chunk.map(({ id, fields }) => ({ id, fields })) as Array<{
        id: string;
        fields: Airtable.FieldSet;
      }>
    );

    const done = Math.min(index + BATCH_SIZE, updates.length);
    if (done % 50 === 0 || done === updates.length) {
      console.log(`  ${done}/${updates.length} done`);
    }

    if (index + BATCH_SIZE < updates.length) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
    }
  }

  console.log(`${label}: complete.`);
}

async function main(): Promise<void> {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will write to Airtable)'}\n`);

  Airtable.configure({ apiKey: PAT });
  const base = Airtable.base(BASE_ID);
  const table = base(TABLE_ID);

  console.log('Paginating all venues...');
  const all = await paginateAll(table);
  console.log(`Total records: ${all.length}\n`);

  const buckets: globalThis.Record<Bucket, BatchUpdate[]> = {
    library: [],
    atmospheric: [],
    highrisk: [],
    excluded: [],
    no_change: [],
  };

  for (const record of all) {
    const { bucket, patch } = classify(record);

    if (bucket === 'library' || bucket === 'atmospheric' || bucket === 'highrisk') {
      buckets[bucket].push({ id: record.id, fields: patch ?? {}, name: record.name });
      continue;
    }

    buckets[bucket].push({ id: record.id, fields: {}, name: record.name });
  }

  console.log('Classification summary:');
  console.log(`  Library     (-> Tier 2 - Likely):              ${buckets.library.length}`);
  console.log(
    `  Atmospheric (-> Tier 3 - Needs Verification):  ${buckets.atmospheric.length}`
  );
  console.log(`  Highrisk    (-> Hidden + parked):              ${buckets.highrisk.length}`);
  console.log(`  Excluded    (Tier 1 / community / parked):     ${buckets.excluded.length}`);
  console.log(`  No change   (already at target):               ${buckets.no_change.length}`);
  console.log();

  const totalWrites =
    buckets.library.length + buckets.atmospheric.length + buckets.highrisk.length;

  if (totalWrites === 0) {
    console.log('Nothing to do. Exiting.');
    return;
  }

  if (DRY_RUN) {
    console.log(`DRY RUN: would write ${totalWrites} records. No changes made.`);
    return;
  }

  console.log(`Writing ${totalWrites} records to Airtable...`);
  await updateBatched(table, buckets.library, 'Library pass');
  await updateBatched(table, buckets.atmospheric, 'Atmospheric pass');
  await updateBatched(table, buckets.highrisk, 'Highrisk pass');

  console.log('\nAll passes complete.');
}

main().catch((error: unknown) => {
  console.error('Bulk strategy failed:', error);
  process.exit(1);
});
