/**
 * Batch-load extracted verse JSON into Supabase.
 *
 * Env (create .env from .env.example):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/ingestion/seed.mjs --file extracted_output/enoch.json
 *   node scripts/ingestion/seed.mjs --books   # seed books catalog only
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
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
}

loadEnvFile();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example → .env',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const BATCH_SIZE = 100;

function parseArgs() {
  const args = process.argv.slice(2);
  let file = null;
  let booksOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      file = args[++i];
    } else if (args[i] === '--books') {
      booksOnly = true;
    }
  }
  return { file, booksOnly };
}

async function seedBooks() {
  const catalogPath = path.join(ROOT, 'data', 'bibleCanon.json');
  const books = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  if (books.length !== 81) {
    console.warn(`Expected 81 canon books, found ${books.length}.`);
  }
  const { error } = await supabase.from('books').upsert(books, { onConflict: 'book_id' });
  if (error) throw error;
  console.log(`Upserted ${books.length} books (EOTC 81-book canon) from data/bibleCanon.json`);
}

async function seedVerses(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(ROOT, filePath);
  const versesArray = JSON.parse(fs.readFileSync(resolved, 'utf8'));

  console.log(`Starting ingestion of ${versesArray.length} records from ${resolved}…`);

  for (let i = 0; i < versesArray.length; i += BATCH_SIZE) {
    const batch = versesArray.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('verses').upsert(batch, { onConflict: 'verse_id' });

    if (error) {
      console.error(`Error inserting batch at offset ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`Ingested rows ${i}–${i + batch.length - 1}`);
  }

  console.log('Verse ingestion complete.');
}

async function main() {
  const { file, booksOnly } = parseArgs();

  if (booksOnly || !file) {
    await seedBooks();
  }
  if (booksOnly && !file) return;

  if (!file) {
    console.error('Pass --file extracted_output/<book>.json or use --books alone.');
    process.exit(1);
  }

  await seedVerses(file);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
