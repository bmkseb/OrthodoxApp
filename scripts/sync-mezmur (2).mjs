/**
 * Phase 1: Syncs curated playlists (auto-approved) to Supabase
 * Phase 2: Discovers new English + Amharic candidates → Google Sheet
 *
 * Run: node scripts/sync-mezmur.mjs
 * Auto-runs weekly via GitHub Actions
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

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID = '1DVezMntiTGyRw4lR5oZf4G-JqcKX42si54YPx9SvTPI';

const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/service-account.json'), 'utf8'));

if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars'); process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Curated playlists (auto-approved) ────────────────────────────────────
const PLAYLISTS = [
  // Ahadu Studios — English
  { id: 'PLAmAvdJWeyRkxL4KfpQjqk3yya9_Ii8cY', artist: 'Ahadu Studios', album: 'English Mezmurs',       language: 'english' },
  { id: 'PLAmAvdJWeyRmu-XYavrop60RuqcYYx08x', artist: 'Ahadu Studios', album: 'Nisiha Mezmurs',         language: 'english' },
  { id: 'PLAmAvdJWeyRlBbSkoELc2WbfmgdkDk7cT', artist: 'Ahadu Studios', album: 'Instrumental Mezmurs',   language: 'english' },
  { id: 'PLAmAvdJWeyRk5K5yDUeRxcHsV9Vuv7uzD', artist: 'Ahadu Studios', album: 'Cana: Wedding Album',    language: 'english' },
  { id: 'PLAmAvdJWeyRlxmn3mpLyInUJDoUumNKYT', artist: 'Ahadu Studios', album: 'The Walk',               language: 'english' },
  { id: 'PLAmAvdJWeyRmsbWk3_kQvqGn2GXW0d4aD', artist: 'Ahadu Studios', album: 'Praise Night',           language: 'english' },
  // Egeziharya Yilma — English
  { id: 'PLtM9z7_JBWFf-9RX1TKaez9ZxLUrxzI8s', artist: 'Egeziharya Yilma', album: 'English Hymns',            language: 'english' },
  { id: 'PLtM9z7_JBWFe3lwJM8ZuGLVhkiuI4ZhZS', artist: 'Egeziharya Yilma', album: 'Great Lent Mezmurs',       language: 'english' },
  { id: 'PLtM9z7_JBWFftK6rHAJSogMRISdxrf3MP', artist: 'Egeziharya Yilma', album: 'Annual Mezmur Collection', language: 'english' },
];

// ── Discovery queries with language tags ──────────────────────────────────
const DISCOVERY_QUERIES = [
  // English
  { q: 'Ethiopian Orthodox mezmur English',          language: 'english' },
  { q: 'EOTC English hymn Tewahedo',                 language: 'english' },
  { q: 'Ethiopian Orthodox English hymn new',        language: 'english' },
  { q: 'Tewahedo mezmur English praise',             language: 'english' },
  { q: 'Ethiopian Orthodox English worship mezmur',  language: 'english' },
  // Amharic
  { q: 'Ethiopian Orthodox mezmur Amharic',          language: 'amharic' },
  { q: 'EOTC Amharic mezmur Tewahedo',               language: 'amharic' },
  { q: 'Ethiopian Orthodox Amharic hymn new',        language: 'amharic' },
  { q: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ መዝሙር',                  language: 'amharic' },
  { q: 'Ethiopian Orthodox mezmur Amharic 2024',     language: 'amharic' },
  { q: 'Tewahedo Amharic mezmur praise',             language: 'amharic' },
  { q: 'Ethiopian Orthodox Amharic worship mezmur',  language: 'amharic' },
];

// ── Google Sheets auth ────────────────────────────────────────────────────
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// ── YouTube helpers ───────────────────────────────────────────────────────
async function ytFetch(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`YouTube API: ${err.error?.message}`);
  }
  return res.json();
}

async function fetchPlaylistVideos(playlistId) {
  const videos = [];
  let pageToken = '';
  do {
    const data = await ytFetch('playlistItems', {
      part: 'snippet',
      playlistId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of data.items ?? []) {
      const s = item.snippet;
      const videoId = s?.resourceId?.videoId;
      if (!videoId || s?.title === 'Private video' || s?.title === 'Deleted video') continue;
      videos.push({
        videoId, title: s.title,
        channelTitle: s.videoOwnerChannelTitle || '',
        thumbnail: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '',
        publishedAt: s.publishedAt,
      });
    }
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);
  return videos;
}

async function searchVideos(query) {
  const data = await ytFetch('search', {
    part: 'snippet', q: query, type: 'video',
    maxResults: '25', videoCategoryId: '10',
  });
  return (data.items ?? [])
    .filter(item => item.id?.videoId)
    .map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url || '',
      publishedAt: item.snippet.publishedAt,
    }));
}

// ── Supabase helpers ──────────────────────────────────────────────────────
async function upsertApproved(videos, artist, album, playlistId, language) {
  const unique = new Map();
  for (const v of videos) {
    unique.set(v.videoId, {
      video_id: v.videoId, title: v.title, artist, album,
      playlist_id: playlistId, thumbnail_url: v.thumbnail,
      published_at: v.publishedAt, language, status: 'approved',
    });
  }
  const { error } = await sb.from('mezmur').upsert([...unique.values()], { onConflict: 'video_id' });
  if (error) throw new Error(error.message);
  return unique.size;
}

async function getExistingVideoIds() {
  const { data } = await sb.from('mezmur').select('video_id');
  return new Set((data ?? []).map(r => r.video_id));
}

// ── Google Sheets helpers ─────────────────────────────────────────────────
async function ensureSheetHeaders(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A1:I1',
  });
  const headers = res.data.values?.[0];
  if (!headers || headers[0] !== 'video_id') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['video_id', 'title', 'artist', 'album', 'youtube_link', 'thumbnail', 'published_at', 'status', 'language']],
      },
    });
  }
}

async function getSheetVideoIds(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A2:A',
  });
  return new Set((res.data.values ?? []).map(r => r[0]).filter(Boolean));
}

async function appendToSheet(sheets, rows) {
  if (rows.length === 0) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎵 Mezmur Sync Starting...\n');
  const sheets = await getSheetsClient();
  await ensureSheetHeaders(sheets);

  // Phase 1: Curated playlists → Supabase (auto-approved)
  console.log('📋 Phase 1: Syncing curated playlists (auto-approved)...');
  let totalApproved = 0;
  for (const playlist of PLAYLISTS) {
    process.stdout.write(`  [${playlist.language}] ${playlist.artist} — ${playlist.album}...`);
    try {
      const videos = await fetchPlaylistVideos(playlist.id);
      const count = await upsertApproved(videos, playlist.artist, playlist.album, playlist.id, playlist.language);
      totalApproved += count;
      console.log(` ${count} ✓`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }
  console.log(`\n  ✓ ${totalApproved} approved videos synced.\n`);

  // Phase 2: Discover candidates → Google Sheet (pending review)
  console.log('🔍 Phase 2: Discovering new candidates → Google Sheet...');
  const existingSupabase = await getExistingVideoIds();
  const existingSheet = await getSheetVideoIds(sheets);
  const alreadySeen = new Set([...existingSupabase, ...existingSheet]);

  let totalNew = 0;
  for (const { q, language } of DISCOVERY_QUERIES) {
    process.stdout.write(`  [${language}] "${q}"...`);
    try {
      const videos = await searchVideos(q);
      const newVideos = videos.filter(v => !alreadySeen.has(v.videoId));
      if (newVideos.length > 0) {
        const sheetRows = newVideos.map(v => [
          v.videoId,
          v.title,
          v.channelTitle,
          'Discovered',
          `https://youtube.com/watch?v=${v.videoId}`,
          v.thumbnail,
          v.publishedAt,
          'pending',
          language,
        ]);
        await appendToSheet(sheets, sheetRows);
        newVideos.forEach(v => alreadySeen.add(v.videoId));
        totalNew += newVideos.length;
      }
      console.log(` ${newVideos.length} new`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }

  console.log(`\n  ✓ ${totalNew} new candidates added to Google Sheet.`);
  console.log('\nOpen your sheet to review:');
  console.log('https://docs.google.com/spreadsheets/d/1DVezMntiTGyRw4lR5oZf4G-JqcKX42si54YPx9SvTPI');
  console.log('Type "approved" or "rejected" in column H, then run sync-approvals.mjs');
}

main().catch(err => { console.error(err); process.exit(1); });
