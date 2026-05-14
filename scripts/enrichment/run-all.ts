import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHECKPOINT_DIR = path.resolve(__dirname, 'checkpoints');

interface RunOptions {
  startPhase: number;
  dryRun: boolean;
}

function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const phaseFlag = args.indexOf('--phase');
  const startPhase = phaseFlag >= 0 ? Number.parseInt(args[phaseFlag + 1] ?? '1', 10) : 1;
  const dryRun = args.includes('--dry-run');
  return { startPhase, dryRun };
}

function hasEnv(...keys: string[]): boolean {
  return keys.some((key) => Boolean(process.env[key]?.trim()));
}

function checkEnvGroup(label: string, keys: string[]): void {
  if (!hasEnv(...keys)) {
    console.error(`Missing required env vars for ${label}: ${keys.join(' or ')}`);
    console.error('Set them in .env.local and reload your shell.');
    process.exit(1);
  }
}

function runTs(scriptName: string): void {
  const scriptPath = path.resolve(__dirname, scriptName);
  const result = spawnSync('npx', ['ts-node', '--esm', scriptPath], {
    stdio: 'inherit',
    env: { ...process.env },
    cwd: path.resolve(__dirname, '../..'),
  });

  if (result.status !== 0) {
    throw new Error(`${scriptName} exited with code ${result.status}`);
  }
}

function runPython(scriptName: string): void {
  const scriptPath = path.resolve(__dirname, scriptName);
  const result = spawnSync('python3', [scriptPath], {
    stdio: 'inherit',
    env: { ...process.env },
    cwd: path.resolve(__dirname, '../..'),
  });

  if (result.status !== 0) {
    throw new Error(`${scriptName} exited with code ${result.status}`);
  }
}

async function main(): Promise<void> {
  const { startPhase, dryRun } = parseArgs();

  checkEnvGroup('Airtable', ['AIRTABLE_API_KEY', 'AIRTABLE_PAT']);
  checkEnvGroup('Airtable base', ['AIRTABLE_BASE_ID']);
  checkEnvGroup('Airtable table', ['AIRTABLE_TABLE_ID', 'AIRTABLE_VENUES_TABLE_ID']);

  if (startPhase <= 1) {
    checkEnvGroup('Google Places', ['GOOGLE_PLACES_API_KEY']);
  }
  if (startPhase <= 4) {
    checkEnvGroup('Anthropic', ['ANTHROPIC_API_KEY']);
  }

  mkdirSync(CHECKPOINT_DIR, { recursive: true });

  console.log('\n=== Happy Senses Data Enrichment Pipeline ===');
  console.log(`Starting from Phase ${startPhase}. Dry run: ${dryRun}`);
  console.log(`Checkpoints dir: ${CHECKPOINT_DIR}\n`);

  if (dryRun) {
    console.log('[DRY RUN] Would run phases 1-5. No API calls made.');
    return;
  }

  if (startPhase <= 1) {
    console.log('\n--- Phase 1: Google Places Enrichment ---');
    runTs('phase1-google-places.ts');
  }

  if (startPhase <= 2) {
    console.log('\n--- Phase 2: OSM Overpass Re-scrape ---');
    runTs('phase2-osm-scrape.ts');
  }

  if (startPhase <= 3) {
    console.log('\n--- Phase 3: Crawl4AI Signal Extraction (Python) ---');
    runPython('phase3-crawl4ai.py');
  }

  if (startPhase <= 4) {
    console.log('\n--- Phase 4: AI Screening ---');
    runTs('phase4-ai-screen.ts');
  }

  if (startPhase <= 5) {
    console.log('\n--- Phase 5: Airtable Push ---');
    runTs('phase5-airtable-push.ts');
  }

  console.log('\n=== Pipeline complete. Review Airtable before publishing. ===\n');
}

main().catch((err) => {
  console.error('[run-all] Fatal error:', err);
  process.exit(1);
});
