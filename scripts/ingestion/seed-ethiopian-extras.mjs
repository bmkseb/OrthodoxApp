/**
 * Seeds Ethiopian-specific books into Supabase.
 * 1 Enoch and Jubilees are read from local .md files.
 * Run: node scripts/ingestion/seed-ethiopian-extras.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const BATCH = 200;

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars'); process.exit(1);
}
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function upsert(rows, label) {
  let n = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await sb.from('verses').upsert(rows.slice(i, i + BATCH), { onConflict: 'verse_id' });
    if (error) throw new Error(`DB (${label}): ${error.message}`);
    n += Math.min(BATCH, rows.length - i);
  }
  return n;
}

// Parse **[chapter:verse]** markdown format
// Verses may span multiple paragraphs until the next [x:y] marker
function parseMdVerses(text, book_id) {
  const rows = [];
  // Match all verse markers and their positions
  const regex = /\*\*\[(\d+):(\d+)\]\*\*\s*/g;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push({ ch: parseInt(m[1]), v: parseInt(m[2]), start: m.index + m[0].length });
  }

  for (let i = 0; i < matches.length; i++) {
    const { ch, v, start } = matches[i];
    const end = i + 1 < matches.length ? matches[i + 1].start - matches[i + 1][0]?.length : text.length;
    // Actually just use the start of the next match index
    const nextMatchIndex = i + 1 < matches.length
      ? text.lastIndexOf('**[', matches[i + 1].start)
      : text.length;

    const raw = text.slice(start, nextMatchIndex)
      .replace(/\*\*/g, '')           // remove bold markers
      .replace(/#{1,6}\s+.*/g, '')    // remove headings
      .replace(/\n+/g, ' ')           // collapse newlines
      .replace(/\s+/g, ' ')
      .trim();

    if (!raw) continue;
    rows.push({
      verse_id: `${book_id}_${String(ch).padStart(3,'0')}_${String(v).padStart(3,'0')}`,
      book_id,
      chapter: ch,
      verse: v,
      text_english: raw,
    });
  }
  return rows;
}

async function seedFromMd(book_id, label, filePath) {
  process.stdout.write(`  ${label}...`);
  if (!fs.existsSync(filePath)) {
    console.log(` ✗ file not found: ${filePath}`);
    return;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const rowMap = new Map();
  for (const r of parseMdVerses(text, book_id)) rowMap.set(r.verse_id, r);
  const rows = [...rowMap.values()];
  if (rows.length < 5) {
    console.log(` ✗ only ${rows.length} verses parsed — check file format`);
    return;
  }
  const n = await upsert(rows, book_id);
  console.log(` ${n} verses ✓`);
}

async function seedPlaceholder(book_id, name) {
  const rows = [{
    verse_id: `${book_id}_001_001`,
    book_id, chapter: 1, verse: 1,
    text_english: `${name} has not yet been translated into English. This book is part of the Ethiopian Orthodox Tewahedo Church canon and is preserved in Ge'ez and Amharic. An English translation is not currently available in digital form.`,
  }];
  await upsert(rows, book_id);
  console.log(`  ✓ ${name}: placeholder added`);
}

async function main() {
  console.log('Seeding Ethiopian-specific books...\n');

  // 1 Enoch and Jubilees from local .md files
  // Place the files in your data/ folder before running
  await seedFromMd('enoch',    '1 Enoch (R.H. Charles)',         path.join(ROOT, 'data', '1-enoch.md'));
  await seedFromMd('jubilees', 'Jubilees / Kufale (R.H. Charles)', path.join(ROOT, 'data', 'book-of-jubilees.md'));

  // No English translations available — placeholders
  console.log('\nAdding placeholders for books without English translations...');
  const noEng = [
    { id: 'meqabyan_1',        name: '1 Meqabyan' },
    { id: 'meqabyan_2_3',      name: '2 & 3 Meqabyan' },
    { id: 'tegsats',           name: 'Tegsats (Book of Reproof)' },
    { id: 'teezaz',            name: 'Tizaz (Teezaz)' },
    { id: 'gitsew',            name: 'Gitsew' },
    { id: 'abtilis',           name: 'Abtilis' },
    { id: 'serate_tsion',      name: 'Sirate Tsion (Sinodos)' },
    { id: 'covenant_1',        name: 'Book of the Covenant Part 1' },
    { id: 'covenant_2',        name: 'Book of the Covenant Part 2' },
    { id: 'joseph_ben_gurion', name: 'Josippon (Joseph ben Gurion)' },
    { id: 'clement',           name: 'Book of Clement (Qalementos)' },
    { id: 'didascalia',        name: 'Didascalia Apostolorum' },
  ];

  for (const { id, name } of noEng) {
    try { await seedPlaceholder(id, name); }
    catch (e) { console.log(`  ✗ ${name}: ${e.message}`); }
  }

  console.log('\n✓ Done! Restart Expo to see the updated books.');
}

main().catch(e => { console.error(e); process.exit(1); });
