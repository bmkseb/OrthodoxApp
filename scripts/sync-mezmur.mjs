/**
 * Pulls videos from trusted EOTC channels, filters out shorts/livestreams/talks,
 * and writes clean mezmur candidates to Google Sheet for review.
 * Run: node scripts/sync-mezmur.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AHADU_ALBUMS, AHADU_GLORY_FULL_ALBUM_VIDEOS, AHADU_TRACK_OVERRIDES } from './ahadu-albums.mjs';
import { buildAhaduCatalogRows, fetchAhaduChannelIndex } from './ahadu-resolve.mjs';
import { EGEZIHARYA_TRACK_OVERRIDES } from './egeziharya-albums.mjs';
import {
  MEZMUR_DEBTER_ARTIST,
  MEZMUR_DEBTER_PURGE_ALBUMS,
  MEZMUR_DEBTER_YT_CHANNEL_ID,
  classifyDebterLanguage,
  classifyDebterType,
  debterAlbumForLanguage,
  isDebterMezmurTitle,
} from './debter-channel.mjs';

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
  { id: 'UCWOJoa6AObS9tW4WUCdZbrg', name: 'Zehohite Birhan', language: 'english' },
];

// ── Auto-approved channels (straight to Supabase, no sheet) ──────────────
const AUTO_APPROVED_CHANNELS = [
  { id: 'UCvhur3Y1KOmVBDDrTRXi2Ng', artist: 'Egeziharya Yilma', language: 'english', type: 'praise', album: 'Singles' },
  { id: 'UCSFABckAjCYlYym2ByrkrRg', artist: 'Y.O.T.C. Choir', language: 'english', type: 'praise', album: 'Nation of the Cross' },
];

// ── Curated playlists (auto-approved) ────────────────────────────────────
const APPROVED_PLAYLISTS = [
  { id: 'PLtM9z7_JBWFf-9RX1TKaez9ZxLUrxzI8s', artist: 'Egeziharya Yilma', album: 'English Hymns',        language: 'english', type: 'praise'  },
  { id: 'PLtM9z7_JBWFe3lwJM8ZuGLVhkiuI4ZhZS', artist: 'Egeziharya Yilma', album: 'Great Lent Mezmurs',   language: 'english', type: 'fasting' },
  { id: 'PLcPG070ZCoi6CzbWwIix7ByO5T7W4DA9a', artist: 'Egeziharya Yilma', album: 'Tewahedo I',  language: 'english', type: 'praise', includeIntroEnd: true },
  { id: 'PLVQcEO-g_x0PpVgMGncyxkRuI0Wuc-E29', artist: 'Egeziharya Yilma', album: 'Tewahedo II', language: 'english', type: 'praise', includeIntroEnd: true },
  { id: 'OLAK5uy_mXqjbCG-abWey_No91qJyVzal72ioFZPU', artist: 'Mahibere Kidusan', album: 'Proclaim His Name', language: 'english', type: 'praise' },
];

const PLAYLIST_SKIP_TITLES = new Set([
  'introduction',
  'end',
  'opening',
  'private video',
  'deleted video',
]);

function filterPlaylistEntries(videos, { includeIntroEnd = false } = {}) {
  const skip = includeIntroEnd
    ? new Set(['private video', 'deleted video'])
    : PLAYLIST_SKIP_TITLES;
  return videos.filter((v) => {
    const english = (v.title ?? '').split('||')[0].trim().toLowerCase();
    return !skip.has(english);
  });
}

// ── Filter keywords ───────────────────────────────────────────────────────
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
    const data = await ytFetch('videos', { part: 'contentDetails,snippet', id: batch.join(',') });
    for (const item of data.items ?? []) {
      const duration = parseDuration(item.contentDetails?.duration);
      const isLive   = item.snippet?.liveBroadcastContent === 'live' ||
                       item.contentDetails?.duration === 'P0D';
      details.set(item.id, { duration, isLive });
    }
  }
  return details;
}

function englishTrackTitle(title) {
  return (title.split('||')[0] ?? title).trim();
}

async function fetchVideoSnippets(videoIds) {
  const map = new Map();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await ytFetch('videos', { part: 'snippet', id: batch.join(',') });
    for (const item of data.items ?? []) {
      const sn = item.snippet;
      map.set(item.id, {
        title: sn?.title ?? '',
        thumbnail: sn?.thumbnails?.medium?.url || sn?.thumbnails?.high?.url || '',
        publishedAt: sn?.publishedAt ?? null,
      });
    }
  }
  return map;
}

/** Build playlist rows, applying per-track video overrides and dropping replaced entries. */
async function buildPlaylistRows(pl, videos) {
  const overrides = EGEZIHARYA_TRACK_OVERRIDES[pl.album] ?? {};
  const overrideTracks = new Set(Object.keys(overrides));
  const rows = [];
  const replacedVideoIds = [];

  for (const v of videos) {
    const track = englishTrackTitle(v.title);
    if (overrideTracks.has(track)) {
      replacedVideoIds.push(v.videoId);
      continue;
    }
    rows.push({
      video_id: v.videoId,
      title: v.title,
      artist: pl.artist,
      album: pl.album,
      playlist_id: pl.id,
      thumbnail_url: v.thumbnail,
      published_at: v.publishedAt,
      language: pl.language,
      type: pl.type,
      status: 'approved',
    });
  }

  const overrideIds = Object.values(overrides);
  if (overrideIds.length > 0) {
    const snippets = await fetchVideoSnippets(overrideIds);
    for (const [track, videoId] of Object.entries(overrides)) {
      const sn = snippets.get(videoId);
      rows.push({
        video_id: videoId,
        title: sn?.title ?? track,
        artist: pl.artist,
        album: pl.album,
        playlist_id: pl.id,
        thumbnail_url: sn?.thumbnail ?? '',
        published_at: sn?.publishedAt ?? null,
        language: pl.language,
        type: pl.type,
        status: 'approved',
      });
    }
    if (replacedVideoIds.length > 0) {
      const { error } = await sb.from('mezmur').delete().in('video_id', replacedVideoIds);
      if (error) throw new Error(error.message);
    }

    // Remove any other rows for this album + track (e.g. fuzzy duplicate titles).
    for (const [track, videoId] of Object.entries(overrides)) {
      const { data, error } = await sb
        .from('mezmur')
        .select('video_id, title')
        .eq('artist', pl.artist)
        .eq('album', pl.album);
      if (error) throw new Error(error.message);
      const remove = (data ?? [])
        .filter((row) => row.video_id !== videoId)
        .filter((row) => englishTrackTitle(row.title).toLowerCase() === track.toLowerCase());
      if (remove.length > 0) {
        const { error: delError } = await sb
          .from('mezmur')
          .delete()
          .in(
            'video_id',
            remove.map((r) => r.video_id)
          );
        if (delError) throw new Error(delError.message);
      }
    }
  }

  return rows;
}

async function fetchPlaylistVideos(playlistId) {
  const videos = [];
  let pageToken = '';
  do {
    const data = await ytFetch('playlistItems', {
      part: 'snippet', playlistId, maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of data.items ?? []) {
      const s = item.snippet;
      const videoId = s?.resourceId?.videoId;
      const title = s?.title ?? '';
      if (!videoId || title === 'Private video' || title === 'Deleted video') continue;
      videos.push({
        videoId, title,
        channelTitle: s.videoOwnerChannelTitle || '',
        thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.high?.url || '',
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
  const { error } = await sb.from('mezmur').upsert([...unique.values()], { onConflict: 'video_id' });
  if (error) throw new Error(error.message);
  return unique.size;
}

async function getExistingVideoIds() {
  const { data } = await sb.from('mezmur').select('video_id');
  return new Set((data ?? []).map(r => r.video_id));
}

async function purgeAllAhaduStudios() {
  const { data, error } = await sb.from('mezmur').select('video_id').eq('artist', 'Ahadu Studios');
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((row) => row.video_id);
  if (ids.length === 0) return 0;
  const { error: delError } = await sb.from('mezmur').delete().in('video_id', ids);
  if (delError) throw new Error(delError.message);
  return ids.length;
}

/** Drop stale rows so pinned albums keep only the intended video. */
async function purgeAlbum(artist, album) {
  const { data, error } = await sb.from('mezmur').select('video_id').eq('artist', artist).eq('album', album);
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((r) => r.video_id);
  if (ids.length === 0) return 0;
  const { error: delError } = await sb.from('mezmur').delete().in('video_id', ids);
  if (delError) throw new Error(delError.message);
  return ids.length;
}

async function purgeMezmurDebterCatalog(keepVideoIds) {
  const { data, error } = await sb.from('mezmur').select('video_id').eq('artist', MEZMUR_DEBTER_ARTIST);
  if (error) throw new Error(error.message);

  const stale = (data ?? []).map((r) => r.video_id).filter((id) => !keepVideoIds.has(id));
  if (stale.length > 0) {
    const { error: delError } = await sb.from('mezmur').delete().in('video_id', stale);
    if (delError) throw new Error(delError.message);
  }

  const { error: albumError } = await sb
    .from('mezmur')
    .delete()
    .eq('artist', MEZMUR_DEBTER_ARTIST)
    .in('album', MEZMUR_DEBTER_PURGE_ALBUMS);
  if (albumError) throw new Error(albumError.message);

  return stale.length;
}

async function purgeStaleAhaduPinnedRows(keepVideoIds) {
  for (const [album, keepId] of keepVideoIds) {
    if (!keepId) continue;
    const { data, error } = await sb
      .from('mezmur')
      .select('video_id')
      .eq('artist', 'Ahadu Studios')
      .eq('album', album);
    if (error) throw new Error(error.message);
    const remove = (data ?? []).map((r) => r.video_id).filter((id) => id !== keepId);
    if (remove.length === 0) continue;
    const { error: delError } = await sb.from('mezmur').delete().in('video_id', remove);
    if (delError) throw new Error(delError.message);
  }
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
      range: 'Mezmur Catalog!I2:I', // video_id is now col I
    });
    return new Set((res.data.values ?? []).map(r => r[0]).filter(Boolean));
  } catch { return new Set(); }
}

async function appendToSheet(sheets, rows) {
  if (rows.length === 0) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Mezmur Catalog!A:K',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎵 EOTC Mezmur Sync Starting...\n');
  const sheets = await getSheetsClient();

  // Phase 1a: Ahadu Studios curated albums → Supabase
  console.log('📋 Phase 1a: Syncing Ahadu Studios albums...');
  let totalApproved = 0;
  let ahaduVideoIds = new Set();
  try {
    const purged = await purgeAllAhaduStudios();
    console.log(`  Removed ${purged} existing Ahadu Studios rows.`);
    const index = await fetchAhaduChannelIndex(ytFetch);
    const { rows, missing, videoIds } = await buildAhaduCatalogRows(index, ytFetch);
    ahaduVideoIds = videoIds;
    if (missing.length > 0) {
      console.warn(`  ⚠ ${missing.length} tracks not found on YouTube:`);
      for (const m of missing) console.warn(`    - [${m.album}] ${m.song}`);
    }
    const count = await upsertApproved(rows);
    const pinnedKeep = new Map(
      Object.entries(AHADU_GLORY_FULL_ALBUM_VIDEOS).map(([album, videoId]) => [album, videoId])
    );
    pinnedKeep.set('God of Creation', AHADU_TRACK_OVERRIDES['God of Creation']);
    await purgeStaleAhaduPinnedRows(pinnedKeep);
    totalApproved += count;
    console.log(`  ✓ ${count} songs across ${AHADU_ALBUMS.length} albums.`);
  } catch (err) {
    console.log(`  FAILED: ${err.message}`);
  }

  // Phase 1b: Remove retired playlists from Supabase
  try {
    const removed = await purgeAlbum('Egeziharya Yilma', 'Annual Collection');
    if (removed > 0) console.log(`\n  Removed ${removed} songs from retired album "Annual Collection".`);
  } catch (err) {
    console.warn(`\n  Could not purge Annual Collection: ${err.message}`);
  }

  // Phase 1c: Curated playlists → Supabase (auto-approved)
  console.log('\n📋 Phase 1c: Syncing curated playlists (auto-approved)...');
  for (const pl of APPROVED_PLAYLISTS) {
    process.stdout.write(`  [${pl.language}] ${pl.artist} — ${pl.album}...`);
    try {
      const videos = filterPlaylistEntries(await fetchPlaylistVideos(pl.id), {
        includeIntroEnd: Boolean(pl.includeIntroEnd),
      });
      const rows = await buildPlaylistRows(pl, videos);
      const count  = await upsertApproved(rows);
      totalApproved += count;
      console.log(` ${count} ✓`);
    } catch (err) { console.log(` FAILED: ${err.message}`); }
  }

  // Phase 1d: Mezmur Debter Zetewahedo — all uploads → English / Amharic albums
  console.log('\n📋 Phase 1d: Syncing Mezmur Debter Zetewahedo (English + Amharic)...');
  try {
    const all = await fetchChannelVideos(MEZMUR_DEBTER_YT_CHANNEL_ID);
    const filtered = (await filterMezmur(all)).filter((v) => isDebterMezmurTitle(v.title));
    let english = 0;
    let amharic = 0;
    const rows = filtered.map((v) => {
      const language = classifyDebterLanguage(v.title);
      if (language === 'english') english += 1;
      else amharic += 1;
      return {
        video_id: v.videoId,
        title: v.title,
        artist: MEZMUR_DEBTER_ARTIST,
        album: debterAlbumForLanguage(language),
        thumbnail_url: v.thumbnail,
        published_at: v.publishedAt,
        language,
        type: classifyDebterType(v.title),
        status: 'approved',
      };
    });
    const keepIds = new Set(rows.map((r) => r.video_id));
    const purged = await purgeMezmurDebterCatalog(keepIds);
    const count = await upsertApproved(rows);
    totalApproved += count;
    console.log(`  ✓ ${count} songs (${english} English, ${amharic} Amharic), removed ${purged} stale.`);
  } catch (err) {
    console.log(`  FAILED: ${err.message}`);
  }

  // Phase 1e: Other auto-approved channels → Supabase
  console.log('\n📋 Phase 1e: Syncing auto-approved channels...');
  for (const ch of AUTO_APPROVED_CHANNELS) {
    process.stdout.write(`  [${ch.language}] ${ch.artist} — all videos...`);
    try {
      const all      = await fetchChannelVideos(ch.id);
      const filtered = await filterMezmur(all);
      const album = ch.album ?? '';
      const count    = await upsertApproved(filtered.map(v => ({
        video_id: v.videoId, title: v.title, artist: ch.artist,
        album, thumbnail_url: v.thumbnail,
        published_at: v.publishedAt, language: ch.language,
        type: ch.type, status: 'approved',
      })));
      totalApproved += count;
      console.log(` ${count} ✓`);
    } catch (err) { console.log(` FAILED: ${err.message}`); }
  }
  console.log(`\n  ✓ ${totalApproved} total approved in Supabase.\n`);

  // Phase 2: Trusted channels → filter → Google Sheet
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
        // New column order: title|artist|channel|link|status|type|playlist|language|video_id|thumbnail|notes
        const rows = mezmurOnly.map(v => [
          v.title,                                       // A: title
          v.channelTitle,                                // B: artist
          channel.name,                                  // C: channel
          `https://youtube.com/watch?v=${v.videoId}`,   // D: youtube_link
          'pending',                                     // E: status (dropdown)
          '',                                            // F: type (dropdown — human fills)
          '',                                            // G: playlist (human fills, blank = Other)
          channel.language,                              // H: language
          v.videoId,                                     // I: video_id (hidden)
          v.thumbnail,                                   // J: thumbnail (hidden)
          '',                                            // K: notes
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
