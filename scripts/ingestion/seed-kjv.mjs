/**
 * Downloads the public-domain KJV Bible (per-book files) and seeds into Supabase.
 * Run: node scripts/ingestion/seed-kjv.mjs
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
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = createClient(url, serviceKey);
const BATCH_SIZE = 200;
const BASE_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master';

const BOOKS = [
  { file: 'Genesis', id: 'genesis' },
  { file: 'Exodus', id: 'exodus' },
  { file: 'Leviticus', id: 'leviticus' },
  { file: 'Numbers', id: 'numbers' },
  { file: 'Deuteronomy', id: 'deuteronomy' },
  { file: 'Joshua', id: 'joshua' },
  { file: 'Judges', id: 'judges' },
  { file: 'Ruth', id: 'ruth' },
  { file: '1Samuel', id: '1_samuel' },
  { file: '2Samuel', id: '2_samuel' },
  { file: '1Kings', id: '1_kings' },
  { file: '2Kings', id: '2_kings' },
  { file: '1Chronicles', id: '1_chronicles' },
  { file: '2Chronicles', id: '2_chronicles' },
  { file: 'Ezra', id: 'ezra' },
  { file: 'Nehemiah', id: 'nehemiah' },
  { file: 'Esther', id: 'esther' },
  { file: 'Job', id: 'job' },
  { file: 'Psalms', id: 'psalms' },
  { file: 'Proverbs', id: 'proverbs' },
  { file: 'Ecclesiastes', id: 'ecclesiastes' },
  { file: 'SongofSolomon', id: 'song_of_solomon' },
  { file: 'Isaiah', id: 'isaiah' },
  { file: 'Jeremiah', id: 'jeremiah' },
  { file: 'Lamentations', id: 'lamentations' },
  { file: 'Ezekiel', id: 'ezekiel' },
  { file: 'Daniel', id: 'daniel' },
  { file: 'Hosea', id: 'hosea' },
  { file: 'Joel', id: 'joel' },
  { file: 'Amos', id: 'amos' },
  { file: 'Obadiah', id: 'obadiah' },
  { file: 'Jonah', id: 'jonah' },
  { file: 'Micah', id: 'micah' },
  { file: 'Nahum', id: 'nahum' },
  { file: 'Habakkuk', id: 'habakkuk' },
  { file: 'Zephaniah', id: 'zephaniah' },
  { file: 'Haggai', id: 'haggai' },
  { file: 'Zechariah', id: 'zechariah' },
  { file: 'Malachi', id: 'malachi' },
  { file: 'Matthew', id: 'matthew' },
  { file: 'Mark', id: 'mark' },
  { file: 'Luke', id: 'luke' },
  { file: 'John', id: 'john' },
  { file: 'Acts', id: 'acts' },
  { file: 'Romans', id: 'romans' },
  { file: '1Corinthians', id: '1_corinthians' },
  { file: '2Corinthians', id: '2_corinthians' },
  { file: 'Galatians', id: 'galatians' },
  { file: 'Ephesians', id: 'ephesians' },
  { file: 'Philippians', id: 'philippians' },
  { file: 'Colossians', id: 'colossians' },
  { file: '1Thessalonians', id: '1_thessalonians' },
  { file: '2Thessalonians', id: '2_thessalonians' },
  { file: '1Timothy', id: '1_timothy' },
  { file: '2Timothy', id: '2_timothy' },
  { file: 'Titus', id: 'titus' },
  { file: 'Philemon', id: 'philemon' },
  { file: 'Hebrews', id: 'hebrews' },
  { file: 'James', id: 'james' },
  { file: '1Peter', id: '1_peter' },
  { file: '2Peter', id: '2_peter' },
  { file: '1John', id: '1_john' },
  { file: '2John', id: '2_john' },
  { file: '3John', id: '3_john' },
  { file: 'Jude', id: 'jude' },
  { file: 'Revelation', id: 'revelation' },
];

async function fetchBook(fileName) {
  const cacheDir = path.join(ROOT, 'data', 'kjv-cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const cacheFile = path.join(cacheDir, `${fileName}.json`);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  const res = await fetch(`${BASE_URL}/${fileName}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${fileName}: ${res.status}`);
  const data = await res.json();
  fs.writeFileSync(cacheFile, JSON.stringify(data));
  return data;
}

async function seedBook(book_id, chapters) {
  const verses = [];
  for (const chapter of chapters) {
    const chapterNum = chapter.chapter;
    for (const v of chapter.verses) {
      const chStr = String(chapterNum).padStart(3, '0');
      const vStr = String(v.verse).padStart(3, '0');
      verses.push({
        verse_id: `${book_id}_${chStr}_${vStr}`,
        book_id,
        chapter: chapterNum,
        verse: v.verse,
        text_english: v.text.trim(),
      });
    }
  }
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('verses')
      .upsert(batch, { onConflict: 'verse_id' });
    if (error) throw new Error(`DB error for ${book_id}: ${error.message}`);
  }
  return verses.length;
}

async function main() {
  let totalVerses = 0;
  for (const { file, id } of BOOKS) {
    process.stdout.write(`  ${file}...`);
    try {
      const data = await fetchBook(file);
      const count = await seedBook(id, data.chapters);
      totalVerses += count;
      console.log(` ${count} verses ✓`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }
  console.log(`\nDone! ${totalVerses} total verses seeded.`);
  console.log('Restart Expo and tap any book to see real chapters and verses.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
