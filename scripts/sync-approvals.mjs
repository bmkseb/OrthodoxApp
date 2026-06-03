/**
 * Reads approved rows from Google Sheet → pushes to Supabase.
 * Columns: title(A) artist(B) channel(C) youtube_link(D) status(E)
 *          type(F) playlist(G) language(H) video_id(I) thumbnail(J) notes(K)
 *
 * playlist column: if filled → used as album name under channel shelf
 *                  if blank  → defaults to 'Other'
 *
 * Run: node scripts/sync-approvals.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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

const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID                  = '1Gt_rSQlEd6R4EpZv3fR1KW6gx5-gJqSFpyj87zaUFpE';

const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/service-account.json'), 'utf8'));

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function main() {
  console.log('📋 Syncing approvals from Google Sheet → Supabase...\n');
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Mezmur Catalog!A2:K',
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) { console.log('No rows in sheet.'); return; }

  const approved = [];
  const rejected = [];

  for (const row of rows) {
    // A:title B:artist C:channel D:link E:status F:type G:playlist H:language I:video_id J:thumbnail K:notes
    const [title, artist, channel, , status, type, playlist, language, videoId, thumbnail] = row;
    if (!videoId || !status) continue;

    const s    = status.trim().toLowerCase();
    const t    = (type || '').trim().toLowerCase();
    const lang = (language || 'english').trim().toLowerCase();

    let resolvedArtist = (artist || channel || 'Unknown').trim();
    if (/y\.?o\.?t\.?c|young orthodox tewahedo/i.test(`${resolvedArtist} ${channel || ''}`)) {
      resolvedArtist = 'Y.O.T.C. Choir';
    }

    // playlist column: if filled use it as album; Egeziharya Singles stay flat
    const songsOnly = resolvedArtist === 'Egeziharya Yilma';
    let album = songsOnly ? '' : ((playlist || '').trim() || 'Other');
    if (resolvedArtist === 'Y.O.T.C. Choir') {
      album = (playlist || '').trim() || 'Nation of the Cross';
    }
    if (/mezmur debter/i.test(`${resolvedArtist} ${channel || ''}`)) {
      resolvedArtist = 'Mezmur Debter Zetewahedo';
      const pl = (playlist || '').trim();
      if (pl) album = pl;
      else if (lang === 'amharic') album = 'Amharic Hymns';
      else if (lang === 'english') album = 'English Hymns';
    }

    if (s === 'approved') {
      approved.push({
        video_id:      videoId,
        title:         title || '',
        artist:        resolvedArtist,
        album,
        thumbnail_url: thumbnail || '',
        language:      lang,
        type:          ['nisiha','praise','maryam','fasting','sermon','other'].includes(t) ? t : 'other',
        status:        'approved',
      });
    } else if (s === 'rejected') {
      rejected.push(videoId);
    }
  }

  console.log(`Found ${approved.length} approved, ${rejected.length} rejected.\n`);

  if (approved.length > 0) {
    const unique = new Map();
    for (const r of approved) unique.set(r.video_id, r);
    const { error } = await sb.from('mezmur')
      .upsert([...unique.values()], { onConflict: 'video_id' });
    if (error) console.error('Upsert error:', error.message);
    else console.log(`✓ ${unique.size} approved mezmur live in Supabase.`);
  }

  if (rejected.length > 0) {
    for (const videoId of rejected) {
      await sb.from('mezmur')
        .upsert({ video_id: videoId, status: 'rejected' }, { onConflict: 'video_id' });
    }
    console.log(`✓ ${rejected.length} rejected.`);
  }

  console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
