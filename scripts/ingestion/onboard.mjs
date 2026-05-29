/**
 * Verify Supabase is reachable, schema exists, and seed the 81-book canon catalog.
 *
 * Prerequisites:
 *   1. Run scripts/ingestion/onboard.sql in the Supabase SQL Editor
 *   2. Copy .env.example → .env with your project URL + keys
 *
 * Usage:
 *   npm run onboard:db
 *   npm run onboard:db -- --kjv   # also seed English KJV verses (slow, ~31k rows)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return false;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  return true;
}

function runNodeScript(relativePath, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(ROOT, relativePath);
    const child = spawn(process.execPath, [scriptPath, ...extraArgs], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${relativePath} exited with code ${code}`));
    });
  });
}

async function main() {
  const wantsKjv = process.argv.includes('--kjv');

  if (!loadEnvFile()) {
    console.error('Missing .env — copy .env.example → .env and fill in your Supabase keys.');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const expoUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  if (!expoUrl || !anonKey) {
    console.warn('Tip: add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY so the app can read scripture.');
  }

  const supabase = createClient(url, serviceKey);

  console.log('Checking Supabase connection…');
  const { error: booksError } = await supabase.from('books').select('book_id', { count: 'exact', head: true });
  if (booksError) {
    console.error('\nCould not query public.books:', booksError.message);
    console.error('\nRun scripts/ingestion/onboard.sql in the Supabase SQL Editor first, then retry.');
    process.exit(1);
  }

  const { error: versesError } = await supabase.from('verses').select('verse_id', { count: 'exact', head: true });
  if (versesError) {
    console.error('\nCould not query public.verses:', versesError.message);
    console.error('\nRun scripts/ingestion/onboard.sql in the Supabase SQL Editor first, then retry.');
    process.exit(1);
  }

  console.log('Schema OK. Seeding 81-book canon catalog…');
  await runNodeScript('scripts/ingestion/seed.mjs', ['--books']);

  const { count: verseCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  if (wantsKjv) {
    console.log('\nSeeding KJV English text (this may take a few minutes)…');
    await runNodeScript('scripts/ingestion/seed-kjv.mjs');
  } else if (!verseCount) {
    console.log('\nNo verses yet. Options:');
    console.log('  npm run onboard:db -- --kjv');
    console.log('  npm run ingest:seed -- --file extracted_output/<book>.json');
  } else {
    console.log(`\nVerses already present (${verseCount} rows). Skipping KJV seed.`);
  }

  console.log('\nOnboarding complete. Restart Expo so .env changes load in the app.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
