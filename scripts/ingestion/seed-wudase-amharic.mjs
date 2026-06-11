/**
 * Load Amharic Wudase Mariam content for all seven days from wudase-amharic.json.
 *
 * Generate JSON first:
 *   python3 scripts/ingestion/extract-wudase-amharic.py "/Users/bmkseb/Downloads/widase mariam.pdf"
 *
 * Usage:
 *   node scripts/ingestion/seed-wudase-amharic.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JSON_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'wudase-amharic.json');
const BOOK_ID = '9cd0e0bd-c42d-4280-93a1-b6f7efab268d';

const SECTIONS = {
  Monday: '2e814fc3-d44e-4a98-a5a9-45bf97a453f3',
  Tuesday: '8cd345e9-9c66-4b15-a9ed-edd79c11f2bf',
  Wednesday: 'fd6f9213-97ec-490e-9929-55befa02651c',
  Thursday: 'e28dd4a7-9e47-4b95-b3da-e43fd41c866e',
  Friday: 'afe42bf6-76e6-4350-8e6f-c14d6e83584b',
  Saturday: '14f96f2f-dd09-40de-a527-d4a7c8318a9f',
  Sunday: 'cccc6416-007e-404f-9f73-eaa5969cd386',
};

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return false;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
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

async function main() {
  if (!loadEnvFile()) {
    console.error('Missing .env');
    process.exit(1);
  }

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Missing ${JSON_PATH}. Run extract-wudase-amharic.py first.`);
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sections = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const sb = createClient(url, key);
  let updated = 0;

  for (const [day, sectionId] of Object.entries(SECTIONS)) {
    const stanzas = sections[day];
    if (!stanzas) {
      console.warn(`No stanzas for ${day}, skipping`);
      continue;
    }

    for (const [positionRaw, textAmharic] of Object.entries(stanzas)) {
      const position = Number(positionRaw);
      const payload = {
        text_amharic: textAmharic,
        content_am: textAmharic,
      };
      const { error, count } = await sb
        .from('prayer_verses')
        .update(payload, { count: 'exact' })
        .eq('section_id', sectionId)
        .eq('position', position);
      if (error) throw error;
      if (count === 0) {
        console.warn(`${day} position ${position}: no matching verse row`);
        continue;
      }
      updated += 1;
      console.log(`${day} verse ${position} updated`);
    }
  }

  const { data: book, error: bookError } = await sb
    .from('prayer_books')
    .select('available_languages')
    .eq('id', BOOK_ID)
    .single();
  if (bookError) throw bookError;

  const langs = new Set(book?.available_languages ?? ['english']);
  langs.add('english');
  langs.add('amharic');

  const { error: langError } = await sb
    .from('prayer_books')
    .update({ available_languages: [...langs] })
    .eq('id', BOOK_ID);
  if (langError) throw langError;

  console.log(`Done — updated ${updated} Amharic verses.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
