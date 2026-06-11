/**
 * Downloads WEBBE (World English Bible British Edition) from eBible.org
 * and seeds all books into Supabase, matching your exact bibleCanon.json IDs.
 *
 * Run: node scripts/ingestion/seed-webbe.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CACHE_DIR = path.join(ROOT, 'data', 'webbe-cache');
const ZIP_PATH = path.join(CACHE_DIR, 'eng-webbe_usfm.zip');
const EXTRACT_DIR = path.join(CACHE_DIR, 'usfm');
const ZIP_URL = 'https://ebible.org/Scriptures/eng-webbe_usfm.zip';
const BATCH_SIZE = 200;

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// USFM code → your exact book_ids from bibleCanon.json
const BOOK_MAP = {
  // Standard OT
  GEN: 'genesis',
  EXO: 'exodus',
  LEV: 'leviticus',
  NUM: 'numbers',
  DEU: 'deuteronomy',
  JOS: 'joshua',
  JDG: 'judges',
  RUT: 'ruth',
  '1SA': 'samuel',        // your canon combines 1+2 Samuel
  '2SA': null,            // skip — combined into 'samuel' via 1SA
  '1KI': 'kings',         // your canon combines 1+2 Kings
  '2KI': null,            // skip — combined into 'kings' via 1KI
  '1CH': '1_chronicles',
  '2CH': '2_chronicles',
  EZR: 'ezra_nehemiah',   // your canon combines Ezra+Nehemiah
  NEH: null,              // skip — combined into 'ezra_nehemiah' via EZR
  EST: 'esther',
  JOB: 'job',
  PSA: 'psalms',
  PRO: 'proverbs',
  ECC: 'ecclesiastes',
  SNG: 'song_of_songs',
  ISA: 'isaiah',
  JER: 'jeremiah',
  LAM: null,              // Lamentations — not a separate entry in your canon (part of Jeremiah?)
  EZK: 'ezekiel',
  DAN: 'daniel',
  HOS: 'hosea',
  JOL: 'joel',
  AMO: 'amos',
  OBA: 'obadiah',
  JON: 'jonah',
  MIC: 'micah',
  NAM: 'nahum',
  HAB: 'habakkuk',
  ZEP: 'zephaniah',
  HAG: 'haggai',
  ZEC: 'zechariah',
  MAL: 'malachi',
  // Deuterocanon
  TOB: 'tobit',
  JDT: 'judith',
  ESG: null,              // Greek Esther additions — fold into 'esther' or skip
  DAG: null,              // Greek Daniel additions — fold into 'daniel' or skip
  WIS: 'wisdom',
  SIR: 'sirach',
  BAR: null,              // Baruch not in your 81 book list separately
  '1MA': null,            // 1 Maccabees — not in your list (you have meqabyan_1)
  '2MA': null,            // 2 Maccabees — not in your list (you have meqabyan_2_3)
  '3MA': null,            // 3 Maccabees — not in your list
  '1ES': 'ezra_sutu_el',  // 1 Esdras = Ezra Sutuel in EOTC
  '2ES': null,            // 2 Esdras — not in your list
  MAN: null,              // Prayer of Manasses — not in your list
  PS2: null,              // Psalm 151 — fold into psalms or skip
  // NT standard 27
  MAT: 'matthew',
  MRK: 'mark',
  LUK: 'luke',
  JHN: 'john',
  ACT: 'acts',
  ROM: 'romans',
  '1CO': '1_corinthians',
  '2CO': '2_corinthians',
  GAL: 'galatians',
  EPH: 'ephesians',
  PHP: 'philippians',
  COL: 'colossians',
  '1TH': '1_thessalonians',
  '2TH': '2_thessalonians',
  '1TI': '1_timothy',
  '2TI': '2_timothy',
  TIT: 'titus',
  PHM: 'philemon',
  HEB: 'hebrews',
  JAS: 'james',
  '1PE': '1_peter',
  '2PE': '2_peter',
  '1JN': '1_john',
  '2JN': '2_john',
  '3JN': '3_john',
  JUD: 'jude',
  REV: 'revelation',
};

// Books that need their chapters APPENDED after another book
// e.g. 2 Samuel appended after 1 Samuel into 'samuel'
const APPEND_MAP = {
  '2SA': { target: 'samuel',       offsetChapters: 31 }, // 1 Sam has 31 chapters
  '2KI': { target: 'kings',        offsetChapters: 22 }, // 1 Kings has 22 chapters
  NEH:   { target: 'ezra_nehemiah',offsetChapters: 10 }, // Ezra has 10 chapters
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const follow = (u) => {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) return follow(res.headers.location);
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        let mb = 0;
        res.on('data', c => { mb += c.length; process.stdout.write(`\r  Downloading... ${(mb/1024/1024).toFixed(1)} MB`); });
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log(); resolve(); });
      }).on('error', reject);
    };
    follow(url);
  });
}

/** Strip residual USFM character markers, keeping plain readable text (and any † markers). */
function cleanText(raw) {
  return raw
    .replace(/\\w\*/g, '').replace(/\\w\s/g, '')
    .replace(/\|strong="[^"]*"\|?/g, '').replace(/strong="[^"]*"/g, '')
    .replace(/\\[a-z0-9+\-*]+\*/g, '').replace(/\\[a-z0-9+\-]+(\s|$)/g, ' ')
    .replace(/[|]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * USFM footnotes are inline within the verse, e.g.
 *   In the beginning, God\f + \fr 1:1 \ft The Hebrew word ... \f* created ...
 * Replace each \f ... \f* with a single † marker (kept at the same position) and
 * return the extracted footnotes separately as { ref, text } objects.
 */
function parseVerseWithFootnotes(raw) {
  const footnotes = [];

  const withMarkers = raw.replace(/\\f\s*[+\-]?\s*([\s\S]*?)\\f\*/g, (_match, body) => {
    const frMatch = body.match(/\\fr\s+([^\\]+)/);
    const ref = frMatch ? frMatch[1].trim().replace(/[:\s]+$/, '') : '';
    const noteText = body
      .replace(/\\fr\s+[^\\]*/, '')        // remove the \fr <ref> chunk
      .replace(/\\f[a-z]+\*/g, '')         // closing inline markers: \fq* \fqa* \ft* ...
      .replace(/\\\+?[a-z]+\s*/g, ' ')     // opening markers: \ft \fq \fqa \+w ...
      .replace(/\|strong="[^"]*"/g, '')
      .replace(/[|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    footnotes.push({ ref, text: noteText });
    return '\u2020'; // †
  });

  const text = cleanText(withMarkers);
  return { text, footnotes };
}

function parseUSFM(usfmText, book_id, chapterOffset = 0) {
  const verses = [];
  let chapter = 0;
  let verseNum = 0;
  let verseRaw = '';

  const saveVerse = () => {
    if (verseNum > 0 && chapter > 0 && verseRaw.trim()) {
      const { text, footnotes } = parseVerseWithFootnotes(verseRaw);
      if (text) {
        const realChapter = chapter + chapterOffset;
        const ch = String(realChapter).padStart(3, '0');
        const v = String(verseNum).padStart(3, '0');
        verses.push({
          verse_id: `${book_id}_${ch}_${v}`,
          book_id,
          chapter: realChapter,
          verse: verseNum,
          text_english: text,
          ...(footnotes.length > 0 ? { footnote: JSON.stringify(footnotes) } : {}),
        });
      }
    }
    verseRaw = '';
  };

  for (const rawLine of usfmText.split('\n')) {
    const line = rawLine.trim();

    const cMatch = line.match(/^\\c\s+(\d+)/);
    if (cMatch) { saveVerse(); chapter = parseInt(cMatch[1], 10); verseNum = 0; continue; }

    const vMatch = line.match(/^\\v\s+(\d+)\s*(.*)/);
    if (vMatch) { saveVerse(); verseNum = parseInt(vMatch[1], 10); verseRaw = vMatch[2] || ''; continue; }

    if (/^\\(id|ide|h|toc|mt|ms|s|r|p|q|b|d|cl|sp|esb|cat|nb|li|pi)\b/.test(line)) continue;

    // Continuation of the current verse (footnotes may span onto wrapped lines).
    if (verseNum > 0) verseRaw += ' ' + line;
  }
  saveVerse();
  return verses;
}

async function seedVerses(verses, label) {
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('verses').upsert(batch, { onConflict: 'verse_id' });
    if (error) throw new Error(`DB error (${label}): ${error.message}`);
  }
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars'); process.exit(1);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.mkdirSync(EXTRACT_DIR, { recursive: true });

  if (!fs.existsSync(ZIP_PATH)) {
    console.log('Downloading WEBBE USFM zip...');
    await download(ZIP_URL, ZIP_PATH);
  } else {
    console.log('Using cached WEBBE zip.');
  }

  console.log('Extracting...');
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(ZIP_PATH);
  zip.extractAllTo(EXTRACT_DIR, true);

  const files = fs.readdirSync(EXTRACT_DIR).filter(f => f.toLowerCase().endsWith('.usfm')).sort();
  console.log(`Found ${files.length} USFM files.\n`);

  let totalVerses = 0;
  let totalBooks = 0;
  const skipped = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(EXTRACT_DIR, file), 'utf8');
    const idMatch = content.match(/^\\id\s+([A-Z0-9]+)/m);
    if (!idMatch) { skipped.push(file); continue; }
    const usfmCode = idMatch[1].trim();

    // Handle append (2 Samuel, 2 Kings, Nehemiah)
    if (APPEND_MAP[usfmCode]) {
      const { target, offsetChapters } = APPEND_MAP[usfmCode];
      process.stdout.write(`  ${usfmCode} → ${target} (appended, ch+${offsetChapters})...`);
      const verses = parseUSFM(content, target, offsetChapters);
      await seedVerses(verses, target);
      totalVerses += verses.length;
      console.log(` ${verses.length} verses ✓`);
      continue;
    }

    const book_id = BOOK_MAP[usfmCode];
    if (book_id === null) { skipped.push(`${usfmCode} (intentionally skipped)`); continue; }
    if (!book_id) { skipped.push(`${usfmCode} (no mapping)`); continue; }

    process.stdout.write(`  ${usfmCode} → ${book_id}...`);
    const verses = parseUSFM(content, book_id, 0);
    if (!verses.length) { console.log(' 0 verses, skipped'); skipped.push(`${usfmCode} — 0 verses`); continue; }
    await seedVerses(verses, book_id);
    totalVerses += verses.length;
    totalBooks++;
    console.log(` ${verses.length} verses ✓`);
  }

  console.log(`\n✓ Seeded ${totalVerses} verses across ${totalBooks} books.`);
  if (skipped.length) {
    console.log('\nSkipped:');
    skipped.forEach(s => console.log(`  - ${s}`));
  }
  console.log('\nRestart Expo to see updated English text.');
}

main().catch(err => { console.error(err); process.exit(1); });
