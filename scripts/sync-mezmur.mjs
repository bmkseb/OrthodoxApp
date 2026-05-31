/**
 * Syncs mezmur from YouTube playlists into Supabase.
 * Run manually: node scripts/sync-mezmur.mjs
 * Or automatically via GitHub Actions (weekly).
 */
import { createClient } from '@supabase/supabase-js';
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

if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars: YOUTUBE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Playlist definitions ───────────────────────────────────────────────────
const PLAYLISTS = [
  // Ahadu Studios
  { id: 'PLAmAvdJWeyRkxL4KfpQjqk3yya9_Ii8cY', artist: 'Ahadu Studios', album: 'English Mezmurs' },
  { id: 'PLAmAvdJWeyRmu-XYavrop60RuqcYYx08x', artist: 'Ahadu Studios', album: 'Nisiha Mezmurs' },
  { id: 'PLAmAvdJWeyRlBbSkoELc2WbfmgdkDk7cT', artist: 'Ahadu Studios', album: 'Instrumental Mezmurs' },
  { id: 'PLAmAvdJWeyRk5K5yDUeRxcHsV9Vuv7uzD', artist: 'Ahadu Studios', album: 'Cana: Wedding Album' },
  { id: 'PLAmAvdJWeyRlxmn3mpLyInUJDoUumNKYT', artist: 'Ahadu Studios', album: 'The Walk' },
  { id: 'PLAmAvdJWeyRmsbWk3_kQvqGn2GXW0d4aD', artist: 'Ahadu Studios', album: 'Praise Night' },
  // Egeziharya Yilma
  { id: 'PLtM9z7_JBWFf-9RX1TKaez9ZxLUrxzI8s', artist: 'Egeziharya Yilma', album: 'English Hymns' },
  { id: 'PLtM9z7_JBWFe3lwJM8ZuGLVhkiuI4ZhZS', artist: 'Egeziharya Yilma', album: 'Great Lent Mezmurs' },
  { id: 'PLtM9z7_JBWFftK6rHAJSogMRISdxrf3MP', artist: 'Egeziharya Yilma', album: 'Annual Mezmur Collection' },
];

// ── Fetch all videos from a playlist (handles pagination) ─────────────────
async function fetchPlaylistVideos(playlistId) {
  const videos = [];
  let pageToken = '';

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', YOUTUBE_API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`YouTube API error: ${err.error?.message}`);
    }
    const data = await res.json();

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId || snippet?.title === 'Private video' || snippet?.title === 'Deleted video') continue;

      videos.push({
        videoId,
        title: snippet.title,
        thumbnail:
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          '',
        publishedAt: snippet.publishedAt,
      });
    }

    pageToken = data.nextPageToken ?? '';
  } while (pageToken);

  return videos;
}

// ── Upsert videos into Supabase ───────────────────────────────────────────
async function upsertVideos(videos, artist, album, playlistId) {
  const rows = videos.map((v) => ({
    video_id: v.videoId,
    title: v.title,
    artist,
    album,
    playlist_id: playlistId,
    thumbnail_url: v.thumbnail,
    published_at: v.publishedAt,
    language: 'english',
  }));

  const { error } = await sb
    .from('mezmur')
    .upsert(rows, { onConflict: 'video_id', ignoreDuplicates: false });

  if (error) throw new Error(`Supabase error (${artist} / ${album}): ${error.message}`);
  return rows.length;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎵 Syncing mezmur playlists...\n');
  let totalVideos = 0;
  let totalPlaylists = 0;

  for (const playlist of PLAYLISTS) {
    process.stdout.write(`  ${playlist.artist} — ${playlist.album}...`);
    try {
      const videos = await fetchPlaylistVideos(playlist.id);
      const count = await upsertVideos(videos, playlist.artist, playlist.album, playlist.id);
      totalVideos += count;
      totalPlaylists++;
      console.log(` ${count} videos ✓`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }

  console.log(`\n✓ Synced ${totalVideos} videos across ${totalPlaylists} playlists.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
