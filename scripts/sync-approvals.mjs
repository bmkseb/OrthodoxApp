/**
 * Reads approved/rejected rows from Google Sheet and syncs to Supabase.
 * Run: node scripts/sync-approvals.mjs
 * Auto-runs daily via GitHub Actions
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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID = '1DVezMntiTGyRw4lR5oZf4G-JqcKX42si54YPx9SvTPI';

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
  console.log('📋 Syncing approvals from Google Sheet to Supabase...\n');
  const sheets = await getSheetsClient();

  // Read all rows from sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:H',
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) {
    console.log('No rows found in sheet.');
    return;
  }

  // Columns: video_id(0), title(1), artist(2), album(3),
  //          youtube_link(4), thumbnail(5), published_at(6), status(7)
  const approved = [];
  const rejected = [];

  for (const row of rows) {
    const [videoId, title, artist, album, , thumbnail, publishedAt, status] = row;
    if (!videoId || !status) continue;
    const s = status.trim().toLowerCase();
    if (s === 'approved') {
      approved.push({
        video_id: videoId,
        title: title || '',
        artist: artist || 'Unknown',
        album: album || 'Discovered',
        thumbnail_url: thumbnail || '',
        published_at: publishedAt || null,
        language: 'english',
        status: 'approved',
      });
    } else if (s === 'rejected') {
      rejected.push(videoId);
    }
  }

  console.log(`  Found ${approved.length} approved, ${rejected.length} rejected in sheet.\n`);

  // Upsert approved into Supabase
  if (approved.length > 0) {
    const { error } = await sb
      .from('mezmur')
      .upsert(approved, { onConflict: 'video_id' });
    if (error) console.error('  Error upserting approved:', error.message);
    else console.log(`  ✓ ${approved.length} approved mezmur synced to Supabase.`);
  }

  // Mark rejected in Supabase
  if (rejected.length > 0) {
    const { error } = await sb
      .from('mezmur')
      .upsert(
        rejected.map(id => ({ video_id: id, status: 'rejected' })),
        { onConflict: 'video_id' }
      );
    if (error) console.error('  Error marking rejected:', error.message);
    else console.log(`  ✓ ${rejected.length} rejected mezmur updated in Supabase.`);
  }

  console.log('\nDone! Approved mezmur are now live in the app.');
}

main().catch(err => { console.error(err); process.exit(1); });
