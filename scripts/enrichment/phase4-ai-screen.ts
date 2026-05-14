import Anthropic from '@anthropic-ai/sdk';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import type { ScreeningResult, Tier } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKPOINT_PATH = path.resolve(__dirname, 'checkpoints/phase4-screening.json');
const CANDIDATES_CSV = path.resolve(__dirname, 'checkpoints/phase2-candidates.csv');
const SIGNALS_JSON = path.resolve(__dirname, 'checkpoints/phase3-signals.json');
const PHASE1_RESULTS = path.resolve(__dirname, 'checkpoints/phase1-results.json');

const MAX_SCREENING_CALLS = 6000;
const THROTTLE_MS = 200;

let screeningCallCount = 0;

interface Phase4Checkpoint {
  results: Record<string, ScreeningResult>;
  errors: Record<string, string>;
  completedAt: string | null;
}

interface SignalResult {
  success: boolean;
  snippets?: string[];
  flags?: string[];
}

interface Phase1Data {
  results: Record<string, GoogleDataEntry>;
}

interface GoogleDataEntry {
  placeId: string | null;
  rating: number | null;
  reviewCount: number | null;
  topReviews: string[];
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

function loadCheckpoint(): Phase4Checkpoint {
  mkdirSync(path.dirname(CHECKPOINT_PATH), { recursive: true });

  if (!existsSync(CHECKPOINT_PATH)) {
    return { results: {}, errors: {}, completedAt: null };
  }

  return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8')) as Phase4Checkpoint;
}

function saveCheckpoint(checkpoint: Phase4Checkpoint): void {
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

function buildScreeningPrompt(
  name: string,
  category: string,
  city: string,
  googleRating: number | null,
  googleReviewCount: number | null,
  topReviews: string[],
  sensorySnippets: string[],
  sensoryFlags: string[]
): string {
  return `You are screening venues for a sensory-friendly directory for neurodivergent people and families.

VENUE:
Name: ${name}
Category: ${category}
City: ${city}
Google Rating: ${googleRating ?? 'not available'} (${googleReviewCount ?? 0} reviews)

SENSORY SIGNALS FOUND ON WEBSITE:
${sensorySnippets.length > 0 ? sensorySnippets.join('\n\n') : 'None found.'}

SENSORY FLAGS DETECTED: ${sensoryFlags.length > 0 ? sensoryFlags.join(', ') : 'none'}

TOP GOOGLE REVIEWS (if available):
${topReviews.length > 0 ? topReviews.join('\n\n') : 'None available.'}

TASK:
Score this venue 0-100 on sensory-friendliness. Consider:
- Explicit sensory accommodation signals (quiet hours, sensory hours, fragrance-free, quiet rooms, trained staff) -> strong positive signals
- Calm physical environment (calm lighting, low-crowd design, fenced outdoor areas) -> moderate positive
- Professional services known to attract sensory-sensitive families (hairdressers with known quiet approach, pediatric dentists, OT-integrated play spaces) -> moderate positive if signals present
- Generic "family-friendly" with no sensory language -> low positive, score <=40
- No website content, no signals -> score 20-30 (unknown, not negative)
- Reviews mentioning overwhelming noise, crowding, bright lights -> negative signals

Respond with valid JSON only, no explanation outside the JSON:
{
  "score": <integer 0-100>,
  "tier": <"Promising" if score 80-100, "Help us verify" if score 50-79>,
  "reasoning": "<2-3 sentences max>",
  "sensorySummary": "<1-2 sentence description for the venue directory - what makes it sensory-friendly or worth verifying, written in brand voice: warm, direct, no clinical language>",
  "sensNoiseScore": <1-5 or null>,
  "sensLightScore": <1-5 or null>,
  "sensCrowdScore": <1-5 or null>,
  "accFenced": <true or false>,
  "accNearWater": <true or false>,
  "accAccessible": <true or false>,
  "sensQuietRoom": <true or false>,
  "sensHeadphones": <true or false>,
  "sensStaffTrained": <true or false>,
  "sensFragranceFree": <true or false>
}

Omit "tier" from the JSON if score is below 50. Include it for score 50+.
Respond with valid JSON only.`;
}

function parseScreeningResponse(text: string): ScreeningResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const score = Math.max(0, Math.min(100, Number(parsed.score ?? 0)));
    const tier: Tier =
      score >= 80 ? 'Promising' : score >= 50 ? 'Help us verify' : 'Help us verify';

    return {
      score,
      tier,
      reasoning: String(parsed.reasoning ?? ''),
      sensorySummary: String(parsed.sensorySummary ?? ''),
      sensNoiseScore:
        typeof parsed.sensNoiseScore === 'number' ? parsed.sensNoiseScore : null,
      sensLightScore:
        typeof parsed.sensLightScore === 'number' ? parsed.sensLightScore : null,
      sensCrowdScore:
        typeof parsed.sensCrowdScore === 'number' ? parsed.sensCrowdScore : null,
      accFenced: Boolean(parsed.accFenced),
      accNearWater: Boolean(parsed.accNearWater),
      accAccessible: Boolean(parsed.accAccessible),
      sensQuietRoom: Boolean(parsed.sensQuietRoom),
      sensHeadphones: Boolean(parsed.sensHeadphones),
      sensStaffTrained: Boolean(parsed.sensStaffTrained),
      sensFragranceFree: Boolean(parsed.sensFragranceFree),
    };
  } catch (err) {
    console.warn('[phase4] Failed to parse screening response:', err);
    return {
      score: 0,
      tier: 'Help us verify',
      reasoning: 'Parse error - manual review needed.',
      sensorySummary: '',
      sensNoiseScore: null,
      sensLightScore: null,
      sensCrowdScore: null,
      accFenced: false,
      accNearWater: false,
      accAccessible: false,
      sensQuietRoom: false,
      sensHeadphones: false,
      sensStaffTrained: false,
      sensFragranceFree: false,
    };
  }
}

function findGoogleData(
  _results: Record<string, GoogleDataEntry>,
  _name: string,
  _city: string
): GoogleDataEntry | null {
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const anthropicKey = resolveEnv('ANTHROPIC_API_KEY');
  if (!anthropicKey) {
    console.error('ANTHROPIC_API_KEY not set. Abort.');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: anthropicKey });
  const checkpoint = loadCheckpoint();
  if (checkpoint.completedAt) {
    console.log(`Phase 4 already completed at ${checkpoint.completedAt}.`);
    return;
  }

  const signals: Record<string, { snippets: string[]; flags: string[] }> = {};
  if (existsSync(SIGNALS_JSON)) {
    const raw = JSON.parse(readFileSync(SIGNALS_JSON, 'utf8')) as Record<string, SignalResult>;
    for (const [url, result] of Object.entries(raw)) {
      if (result.success) {
        signals[url] = {
          snippets: result.snippets ?? [],
          flags: result.flags ?? [],
        };
      }
    }
  }

  let phase1: Phase1Data = { results: {} };
  if (existsSync(PHASE1_RESULTS)) {
    phase1 = JSON.parse(readFileSync(PHASE1_RESULTS, 'utf8')) as Phase1Data;
  }

  const csvContent = readFileSync(CANDIDATES_CSV, 'utf8');
  const candidates = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CandidateRow[];

  console.log(`Screening ${candidates.length} candidates...`);
  let processed = 0;

  for (const candidate of candidates) {
    const key = `${candidate.name}|${candidate.city}`;
    if (checkpoint.results[key] || checkpoint.errors[key]) continue;

    if (screeningCallCount >= MAX_SCREENING_CALLS) {
      console.warn(`Screening call ceiling reached (${MAX_SCREENING_CALLS}). Stopping.`);
      break;
    }

    const signalData = signals[candidate.website ?? ''] ?? { snippets: [], flags: [] };
    const googleData = findGoogleData(phase1.results, candidate.name, candidate.city);

    try {
      const prompt = buildScreeningPrompt(
        candidate.name,
        candidate.category,
        candidate.city,
        googleData?.rating ?? null,
        googleData?.reviewCount ?? null,
        googleData?.topReviews ?? [],
        signalData.snippets,
        signalData.flags
      );

      screeningCallCount += 1;
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('\n');

      checkpoint.results[key] = parseScreeningResponse(responseText);
    } catch (err) {
      checkpoint.errors[key] = err instanceof Error ? err.message : String(err);
      console.warn(`[phase4] Error screening ${candidate.name}: ${checkpoint.errors[key]}`);
    }

    processed += 1;
    if (processed % 50 === 0) {
      saveCheckpoint(checkpoint);
      console.log(`Progress: ${processed}/${candidates.length} screened.`);
    }

    await sleep(THROTTLE_MS);
  }

  checkpoint.completedAt = new Date().toISOString();
  saveCheckpoint(checkpoint);

  console.log(
    `Phase 4 complete. Screened: ${Object.keys(checkpoint.results).length}. Errors: ${Object.keys(checkpoint.errors).length}.`
  );

  const tiers = Object.values(checkpoint.results).reduce(
    (acc, result) => {
      const key = result.score >= 80 ? 'Promising' : result.score >= 50 ? 'Help us verify' : 'hidden';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('Tier distribution:', JSON.stringify(tiers, null, 2));
}

main().catch((err) => {
  console.error('[phase4] Fatal error:', err);
  process.exit(1);
});
