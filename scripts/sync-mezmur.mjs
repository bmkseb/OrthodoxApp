/**
 * Pulls videos from trusted EOTC channels, filters out shorts/livestreams/talks,
 * and writes clean mezmur candidates to Google Sheet for review.
 *
 * Run: node scripts/sync-mezmur.mjs
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

const YOUTUBE_API_KEY           = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID                  = '1Gt_rSQlEd6R4EpZv3fR1KW6gx5-gJqSFpyj87zaUFpE';

const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/service-account.json'), 'utf8'));

if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars'); process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Trusted EOTC channels (pending review in sheet) ───────────────────────
const TRUSTED_CHANNELS = [
  { id: 'UCSFABckAjCYlYym2ByrkrRg', name: 'EOTC Channel 2', language: 'english' },
  { id: 'UCWOJoa6AObS9tW4WUCdZbrg', name: 'Zehohite Birhan', language: 'english' },
];

// ── Curated playlists (auto-approved) ────────────────────────────────────
const APPROVED_PLAYLISTS = [
  { id: 'PLAmAvdJWeyRkxL4KfpQjqk3yya9_Ii8cY', artist: 'Ahadu Studios',    album: 'English Mezmurs',     language: 'english', type: 'praise'  },
  { id: 'PLAmAvdJWeyRmu-XYavrop60RuqcYYx08x', artist: 'Ahadu Studios',    album: 'Nisiha Mezmurs',       language: 'english', type: 'nisiha'  },
  { id: 'PLAmAvdJWeyRlBbSkoELc2WbfmgdkDk7cT', artist: 'Ahadu Studios',    album: 'Instrumental Mezmurs', language: 'english', type: 'praise'  },
  { id: 'PLAmAvdJWeyRk5K5yDUeRxcHsV9Vuv7uzD', artist: 'Ahadu Studios',    album: 'Cana: Wedding Album',  language: 'english', type: 'praise'  },
  { id: 'PLAmAvdJWeyRlxmn3mpLyInUJDoUumNKYT', artist: 'Ahadu Studios',    album: 'The Walk',             language: 'english', type: 'praise'  },
  { id: 'PLAmAvdJWeyRmsbWk3_kQvqGn2GXW0d4aD', artist: 'Ahadu Studios',    album: 'Praise Night',         language: 'english', type: 'praise'  },
  // Mezmur Debter Zetewahedo (YouTube channel UCQOlCKlhhIMSF4le-VQ8D7Q) — these three playlists only
  { id: 'PLtM9z7_JBWFf-9RX1TKaez9ZxLUrxzI8s', artist: 'Mezmur Debter Zetewahedo', album: 'የዐቢይ ጾም መዝሙራት', language: 'english', type: 'fasting' },
  { id: 'PLtM9z7_JBWFftK6rHAJSogMRISdxrf3MP', artist: 'Mezmur Debter Zetewahedo', album: 'የዓመቱ ያሬዳዊ መዝሙራት || Mezmur Collection', language: 'english', type: 'praise' },
  { id: 'PLtM9z7_JBWFe3lwJM8ZuGLVhkiuI4ZhZS', artist: 'Mezmur Debter Zetewahedo', album: 'English Hymns', language: 'english', type: 'praise' },
];

// Egeziharya Yilma — channel uploads only (8 English mezmur videos, no playlists)
const AUTO_APPROVED_CHANNELS = [
  { id: 'UCvhur3Y1KOmVBDDrTRXi2Ng', artist: 'Egeziharya Yilma', album: '', language: 'english', type: 'praise' },
];

const MEZMUR_DEBTER_ARTIST = 'Mezmur Debter Zetewahedo';
const EGEZIHARYA_ARTIST = 'Egeziharya Yilma';

// ── Keywords that indicate non-mezmur content ─────────────────────────────
const EXCLUDE_TITLE_KEYWORDS = [
  'sermon', 'sermons', 'interview', 'talk', 'podcast', 'discussion',
  'lecture', 'teaching', 'lesson', 'documentary', 'vlog', 'reaction',
  'live service', 'church service', 'liturgy recording', 'full service',
  'debre', 'kidase', 'qidasse', 'timket celebration', 'full liturgy',
  '#shorts', 'short', 'clip',
];

function isMezmur(title, durationSeconds, isLive) {
  if (isLive) return false;
  if (durationSeconds < 60) return false;
  if (durationSeconds > 7200) return false;
  const lower = title.toLowerCase();
  for (const kw of EXCLUDE_TITLE_KEYWORDS) {
    if (lower.includes(kw)) return false;
  }
  return true;
}

function parseDuration(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1]||0)*3600) + (parseInt(match[2]||0)*60) + parseInt(match[3]||0);
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

async function fetchVideoDetails(videoIds) {
  const details = new Map();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await ytFetch('videos', {
      part: 'contentDetails,snippet',
      id: batch.join(','),
    });
    for (const item of data.items ?? []) {
      const duration = parseDuration(item.contentDetails?.duration);
      const isLive   = item.snippet?.liveBroadcastContent === 'live' ||
                       item.contentDetails?.duration === 'P0D';
      details.set(item.id, { duration, isLive });
    }
  }
  return details;
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
        videoId,
        title: s.title,
        channelTitle: s.videoOwnerChannelTitle || '',
        thumbnail: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '',
        publishedAt: s.publishedAt,
      });
    }
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);
  return videos;
}

async function fetchChannelVideos(channelId) {
  const data = await ytFetch('channels', { part: 'contentDetails', id: channelId });
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error(`No uploads playlist for ${channelId}`);
  return fetchPlaylistVideos(uploadsId);
}

async function filterMezmur(videos) {
  const details = await fetchVideoDetails(videos.map(v => v.videoId));
  return videos.filter(v => {
    const d = details.get(v.videoId);
    if (!d) return false;
    return isMezmur(v.title, d.duration, d.isLive);
  });
}

// ── Supabase helpers ──────────────────────────────────────────────────────
async function upsertApproved(rows) {
  const unique = new Map();
  for (const r of rows) unique.set(r.video_id, r);
  const { error } = await sb.from('mezmur')
    .upsert([...unique.values()], { onConflict: 'video_id' });
  if (error) throw new Error(error.message);
  return unique.size;
}

async function getExistingVideoIds() {
  const { data } = await sb.from('mezmur').select('video_id');
  return new Set((data ?? []).map(r => r.video_id));
}

/** Drop Supabase rows for an artist that are no longer in the curated allow-list. */
async function pruneArtistCatalog(artist, allowedVideoIds) {
  const { data, error } = await sb.from('mezmur').select('video_id').eq('artist', artist);
  if (error) throw new Error(error.message);

  const stale = (data ?? []).map((r) => r.video_id).filter((id) => !allowedVideoIds.has(id));
  if (stale.length === 0) return 0;

  const { error: delError } = await sb.from('mezmur').delete().in('video_id', stale);
  if (delError) throw new Error(delError.message);
  return stale.length;
}

// ── Google Sheets helpers ─────────────────────────────────────────────────
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function getSheetVideoIds(sheets) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Mezmur Catalog!H2:H',
    });
    return new Set((res.data.values ?? []).map(r => r[0]).filter(Boolean));
  } catch { return new Set(); }
}

async function appendToSheet(sheets, rows) {
  if (rows.length === 0) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Mezmur Catalog!A:J',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎵 EOTC Mezmur Sync Starting...\n');
  const sheets = await getSheetsClient();

  // Phase 1a: Curated playlists → Supabase (auto-approved)
  console.log('📋 Phase 1a: Syncing curated playlists (auto-approved)...');
  let totalApproved = 0;
  const debterVideoIds = new Set();
  const egeziharyaVideoIds = new Set();

  for (const pl of APPROVED_PLAYLISTS) {
    process.stdout.write(`  [${pl.language}] ${pl.artist} — ${pl.album}...`);
    try {
      const videos = await fetchPlaylistVideos(pl.id);
      for (const v of videos) {
        if (pl.artist === MEZMUR_DEBTER_ARTIST) debterVideoIds.add(v.videoId);
      }
      const count = await upsertApproved(videos.map(v => ({
        video_id: v.videoId, title: v.title, artist: pl.artist,
        album: pl.album, playlist_id: pl.id, thumbnail_url: v.thumbnail,
        published_at: v.publishedAt, language: pl.language,
        type: pl.type, status: 'approved',
      })));
      totalApproved += count;
      const listed = videos.length;
      const label = listed === count ? `${count}` : `${count} unique (${listed} listed)`;
      console.log(` ${label} ✓`);
    } catch (err) { console.log(` FAILED: ${err.message}`); }
  }

  // Phase 1b: Egeziharya Yilma channel uploads only (no playlists on that channel)
  console.log('\n📋 Phase 1b: Syncing Egeziharya Yilma channel uploads...');
  for (const ch of AUTO_APPROVED_CHANNELS) {
    process.stdout.write(`  [${ch.language}] ${ch.artist} — channel uploads...`);
    try {
      const all      = await fetchChannelVideos(ch.id);
      const filtered = await filterMezmur(all);
      for (const v of filtered) egeziharyaVideoIds.add(v.videoId);
      const count    = await upsertApproved(filtered.map(v => ({
        video_id: v.videoId, title: v.title, artist: ch.artist,
        album: ch.album, thumbnail_url: v.thumbnail,
        published_at: v.publishedAt, language: ch.language,
        type: ch.type, status: 'approved',
      })));
      totalApproved += count;
      console.log(` ${count} ✓`);
    } catch (err) { console.log(` FAILED: ${err.message}`); }
  }

  console.log('\n🧹 Pruning stale catalog rows...');
  try {
    const debterRemoved = await pruneArtistCatalog(MEZMUR_DEBTER_ARTIST, debterVideoIds);
    const egeRemoved    = await pruneArtistCatalog(EGEZIHARYA_ARTIST, egeziharyaVideoIds);
    console.log(`  ${MEZMUR_DEBTER_ARTIST}: removed ${debterRemoved} stale`);
    console.log(`  ${EGEZIHARYA_ARTIST}: removed ${egeRemoved} stale`);
  } catch (err) {
    console.log(`  Prune FAILED: ${err.message}`);
  }

  console.log(`\n  ✓ ${totalApproved} total approved videos in Supabase.\n`);

  // Phase 2: Trusted channels → filter → Google Sheet (pending review)
  console.log('🔍 Phase 2: Pulling & filtering trusted channels → Google Sheet...');
  console.log('   (Filtering: no shorts <1min, no livestreams, no sermons/talks)\n');

  const existingSupabase = await getExistingVideoIds();
  const existingSheet    = await getSheetVideoIds(sheets);
  const alreadySeen      = new Set([...existingSupabase, ...existingSheet]);

  let totalNew = 0;
  let totalFiltered = 0;

  for (const channel of TRUSTED_CHANNELS) {
    process.stdout.write(`  ${channel.name}...`);
    try {
      const allVideos  = await fetchChannelVideos(channel.id);
      const newVideos  = allVideos.filter(v => !alreadySeen.has(v.videoId));
      if (newVideos.length === 0) { console.log(' 0 new'); continue; }

      const mezmurOnly = await filterMezmur(newVideos);
      const filtered   = newVideos.length - mezmurOnly.length;
      totalFiltered   += filtered;

      if (mezmurOnly.length > 0) {
        const rows = mezmurOnly.map(v => [
          v.title, v.channelTitle, channel.name,
          `https://youtube.com/watch?v=${v.videoId}`,
          v.thumbnail, '', channel.language,
          v.videoId, 'pending', '',
        ]);
        await appendToSheet(sheets, rows);
        mezmurOnly.forEach(v => alreadySeen.add(v.videoId));
        totalNew += mezmurOnly.length;
      }
      console.log(` ${mezmurOnly.length} added (${filtered} filtered out)`);
    } catch (err) { console.log(` FAILED: ${err.message}`); }
  }

  console.log(`\n  ✓ ${totalNew} candidates added to sheet.`);
  console.log(`  ✗ ${totalFiltered} non-mezmur filtered out.`);
  console.log(`\nhttps://docs.google.com/spreadsheets/d/${SHEET_ID}`);
}

main().catch(err => { console.error(err); process.exit(1); });
