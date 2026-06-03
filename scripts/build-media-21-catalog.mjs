/**
 * Resolves 21 MEDIA mezmur titles → YouTube video IDs via YouTube Data API.
 * Run: node scripts/build-media-21-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MEDIA_21_LEGACY_TRACK, MEDIA_21_WISH_TITLES } from './media21-titles.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CHANNEL_ID = 'UCn0hmEGoyL_tgNAOB-myXPw';
const CHANNEL_NAME = '21 MEDIA ሃያ አንድ ሚዲያ';
const CHANNEL_HANDLE = '@21media27';

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('Missing YOUTUBE_API_KEY in .env');
  process.exit(1);
}

async function ytFetch(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`YouTube API: ${err.error?.message ?? res.status}`);
  }
  return res.json();
}

async function fetchChannelVideos() {
  const data = await ytFetch('channels', { part: 'contentDetails', id: CHANNEL_ID });
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error('Uploads playlist missing');

  const videos = [];
  let pageToken = '';
  do {
    const page = await ytFetch('playlistItems', {
      part: 'snippet',
      playlistId: uploadsId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of page.items ?? []) {
      const sn = item.snippet;
      const videoId = sn?.resourceId?.videoId;
      const title = sn?.title ?? '';
      if (!videoId || title === 'Private video' || title === 'Deleted video') continue;
      videos.push({ videoId, title });
    }
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);

  return videos;
}

function normalizeForMatch(value) {
  return value
    .toLowerCase()
    .replace(/@21media27/g, '')
    .replace(/[|｜—–-]/g, ' ')
    .replace(/["'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wishSearchKey(wish) {
  const dash = wish.split('—')[0] ?? wish;
  const beforePipe = dash.split('|')[0]?.trim() ?? dash.trim();
  return normalizeForMatch(beforePipe || wish);
}

function wishTokens(wish) {
  const key = wishSearchKey(wish);
  return key.split(' ').filter((t) => t.length >= 3);
}

function scoreMatch(wish, videoTitle) {
  const w = wishSearchKey(wish);
  const v = normalizeForMatch(videoTitle);
  if (!w || !v) return 0;
  if (v.includes(w) || w.includes(v)) return 100 + w.length;

  const tokens = wishTokens(wish);
  if (!tokens.length) return 0;
  let hit = 0;
  for (const token of tokens) {
    if (v.includes(token)) hit += 1;
  }
  return (hit / tokens.length) * 80;
}

function pickBest(wish, videos, usedIds) {
  let best = null;
  let bestScore = 0;
  for (const video of videos) {
    if (usedIds.has(video.videoId)) continue;
    const score = scoreMatch(wish, video.title);
    if (score > bestScore) {
      bestScore = score;
      best = video;
    }
  }
  return bestScore >= 45 ? best : null;
}

async function searchChannelVideo(wish) {
  const q = `${wishSearchKey(wish)} ${CHANNEL_HANDLE}`.trim();
  const data = await ytFetch('search', {
    part: 'snippet',
    channelId: CHANNEL_ID,
    q,
    type: 'video',
    maxResults: '8',
  });
  for (const item of data.items ?? []) {
    const videoId = item.id?.videoId;
    const title = item.snippet?.title ?? '';
    if (!videoId) continue;
    if (scoreMatch(wish, title) >= 40) return { videoId, title };
  }
  const first = data.items?.[0];
  if (first?.id?.videoId) {
    return { videoId: first.id.videoId, title: first.snippet?.title ?? wish };
  }
  return null;
}

function displayTitle(wish, youtubeTitle) {
  const cleaned = youtubeTitle.replace(/@21media27/gi, '').replace(/\s+/g, ' ').trim();
  const dash = wish.includes('—');
  if (dash) {
    const artist = wish.split('—').slice(1).join('—').trim();
    const song = wish.split('—')[0]?.trim() ?? wish;
    if (artist && !cleaned.toLowerCase().includes(artist.toLowerCase().slice(0, 8))) {
      return `${song} — ${artist}`;
    }
    return wish.trim();
  }
  return cleaned || wish.trim();
}

async function main() {
  console.log('Fetching channel uploads…');
  const channelVideos = await fetchChannelVideos();
  console.log(`Indexed ${channelVideos.length} uploads.`);

  const tracks = [];
  const usedIds = new Set();
  const missing = [];

  for (const wish of MEDIA_21_WISH_TITLES) {
    let hit = pickBest(wish, channelVideos, usedIds);
    if (!hit) {
      hit = await searchChannelVideo(wish);
      await new Promise((r) => setTimeout(r, 120));
    }
    if (!hit) {
      missing.push(wish);
      continue;
    }
    usedIds.add(hit.videoId);
    tracks.push({
      videoId: hit.videoId,
      title: displayTitle(wish, hit.title),
    });
  }

  if (!usedIds.has(MEDIA_21_LEGACY_TRACK.videoId)) {
    tracks.push({ ...MEDIA_21_LEGACY_TRACK });
  }

  const out = `/** Generated by scripts/build-media-21-catalog.mjs — do not edit by hand. */
export const MEDIA_21_CHANNEL = ${JSON.stringify(CHANNEL_NAME)} as const;

export const MEDIA_21_CHANNEL_HANDLE = ${JSON.stringify(CHANNEL_HANDLE)} as const;

export const MEDIA_21_CHANNEL_ID = ${JSON.stringify(CHANNEL_ID)} as const;

export type Media21Track = { videoId: string; title: string };

export const MEDIA_21_TRACKS: Media21Track[] = ${JSON.stringify(tracks, null, 2)};
`;

  fs.writeFileSync(path.join(ROOT, 'data/media21Catalog.ts'), out);

  console.log(`Resolved ${tracks.length} tracks (${MEDIA_21_WISH_TITLES.length} requested).`);
  if (missing.length) {
    console.log(`Missing ${missing.length}:`);
    for (const m of missing) console.log('  -', m);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
