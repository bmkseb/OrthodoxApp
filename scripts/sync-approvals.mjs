/**
 * Reads approved rows from Google Sheet → pushes to Supabase.
 * Run: node scripts/sync-approvals.mjs
 * Auto-runs every 6 hours via GitHub Actions.
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

  // Columns: title(A) artist(B) channel(C) youtube_link(D) thumbnail(E)
  //          type(F) language(G) video_id(H) status(I) notes(J)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Mezmur Catalog!A2:J',
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) { console.log('No rows in sheet.'); return; }

  const approved = [];
  const rejected = [];

  for (const row of rows) {
    const [title, artist, channel, , thumbnail, type, language, videoId, status] = row;
    if (!videoId || !status) continue;
    const s = status.trim().toLowerCase();
    const t = (type || '').trim().toLowerCase();
    const lang = (language || 'english').trim().toLowerCase();

    if (s === 'approved') {
      const channelName = (channel || '').trim();
      const artistName = (artist || '').trim();
      const isEgeziharya = /egeziharya/i.test(channelName) || /egeziharya/i.test(artistName);
      const isMezmurDebter = /mezmur debter|debter zetewahedo/i.test(channelName) ||
        /mezmur debter|debter zetewahedo/i.test(artistName);
      const isYotcChoir = /\by\.?\s*o\.?\s*t\.?\s*c\b/i.test(channelName) ||
        /\by\.?\s*o\.?\s*t\.?\s*c\b/i.test(artistName) ||
        /young orthodox tewahedo/i.test(channelName) ||
        /young orthodox tewahedo/i.test(artistName);
      let resolvedArtist = artistName || channelName || 'Unknown';
      let resolvedAlbum = (channelName || artistName || 'Discovered').trim();
      if (isEgeziharya) {
        resolvedArtist = 'Egeziharya Yilma';
        resolvedAlbum = '';
      } else if (isMezmurDebter) {
        resolvedArtist = 'Mezmur Debter Zetewahedo';
      } else if (isYotcChoir) {
        resolvedArtist = 'Y.O.T.C. Choir';
        resolvedAlbum = '';
      }
      approved.push({
        video_id:      videoId,
        title:         title || '',
        artist:        resolvedArtist,
        album:         resolvedAlbum,
        thumbnail_url: thumbnail || '',
        language:      lang,
        type:          ['nisiha','praise','maryam','fasting','other'].includes(t) ? t : 'other',
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
