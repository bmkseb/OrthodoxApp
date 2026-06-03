import {
  AHADU_ALBUMS,
  AHADU_CHANNEL_ID,
  AHADU_GLORY_FULL_ALBUM_VIDEOS,
  AHADU_TITLE_ALIASES,
  AHADU_TRACK_OVERRIDES,
} from './ahadu-albums.mjs';

export function normTitle(value) {
  return value
    .toLowerCase()
    .replace(/\s*\(instrumental\)\s*/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function englishTitleFromYouTube(title) {
  return (title.split('||')[0] ?? title).replace(/\s*\(instrumental\)\s*/gi, '').trim();
}

function titleVariants(canonical) {
  return [canonical, ...(AHADU_TITLE_ALIASES[canonical] ?? [])];
}

export async function fetchAhaduChannelIndex(ytFetch) {
  const data = await ytFetch('channels', { part: 'contentDetails', id: AHADU_CHANNEL_ID });
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error('Ahadu uploads playlist missing');

  let pageToken = '';
  const byNorm = new Map();

  do {
    const page = await ytFetch('playlistItems', {
      part: 'snippet',
      playlistId: uploadsId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of page.items ?? []) {
      const title = item.snippet?.title;
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId || !title) continue;
      const en = englishTitleFromYouTube(title);
      const n = normTitle(en);
      if (n.length < 3) continue;
      if (!byNorm.has(n)) {
        byNorm.set(n, {
          videoId,
          title,
          en,
          thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            '',
          publishedAt: item.snippet.publishedAt,
        });
      }
    }
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);

  return byNorm;
}

export function resolveCanonicalTitle(title, index) {
  for (const variant of titleVariants(title)) {
    const n = normTitle(variant);
    if (n.length < 3) continue;
    if (index.has(n)) return index.get(n);
    for (const [key, value] of index) {
      if (key === n) return value;
      if (key.startsWith(`${n} `) || (key.startsWith(n) && key.length <= n.length + 4)) return value;
      if (n.startsWith(`${key} `) || (n.startsWith(key) && n.length <= key.length + 4)) return value;
    }
  }
  return null;
}

async function fetchVideoById(ytFetch, videoId) {
  const data = await ytFetch('videos', { part: 'snippet', id: videoId });
  const item = data.items?.[0];
  if (!item) return null;
  const title = item.snippet?.title ?? '';
  return {
    videoId,
    title,
    en: englishTitleFromYouTube(title),
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
    publishedAt: item.snippet.publishedAt,
  };
}

/** YouTube search fallback when the upload index has no match. */
export async function searchAhaduVideo(ytFetch, title) {
  const overrideId = AHADU_TRACK_OVERRIDES[title];
  if (overrideId) {
    const direct = await fetchVideoById(ytFetch, overrideId);
    if (direct) return direct;
  }

  const data = await ytFetch('search', {
    part: 'snippet',
    type: 'video',
    maxResults: 10,
    q: `"${title}" Ahadu Studios`,
  });
  const want = normTitle(title);
  for (const item of data.items ?? []) {
    const ch = item.snippet?.channelTitle ?? '';
    if (!/ahadu|egeziharya/i.test(ch)) continue;
    const t = item.snippet?.title ?? '';
    const en = englishTitleFromYouTube(t);
    const n = normTitle(en);
    if (n === want || n.startsWith(`${want} `) || want.startsWith(`${n} `)) {
      return {
        videoId: item.id.videoId,
        title: t,
        en,
        thumbnail:
          item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        publishedAt: item.snippet.publishedAt,
      };
    }
  }
  return null;
}

/** Build Supabase rows + report missing tracks. */
export async function buildAhaduCatalogRows(index, ytFetch) {
  const rowByVideo = new Map();
  const hitCache = new Map();
  const missing = [];

  async function resolveHit(songTitle) {
    if (hitCache.has(songTitle)) return hitCache.get(songTitle);

    let hit = null;
    const overrideId = AHADU_TRACK_OVERRIDES[songTitle];
    const overrideOnly =
      Boolean(AHADU_GLORY_FULL_ALBUM_VIDEOS[songTitle]) || songTitle === 'God of Creation';

    if (overrideId && ytFetch) {
      hit = await fetchVideoById(ytFetch, overrideId);
      if (overrideOnly) {
        if (!hit) missing.push({ album: songTitle, song: songTitle });
        hitCache.set(songTitle, hit);
        return hit;
      }
    }

    if (!hit && !overrideOnly) hit = resolveCanonicalTitle(songTitle, index);
    if (!hit && !overrideOnly && ytFetch) hit = await searchAhaduVideo(ytFetch, songTitle);

    hitCache.set(songTitle, hit);
    return hit;
  }

  // Later albums win on duplicate video_id (closer to Spotify grouping for singles / events).
  for (const albumDef of AHADU_ALBUMS) {
    for (const songTitle of albumDef.songs) {
      const hit = await resolveHit(songTitle);
      if (!hit) {
        missing.push({ album: albumDef.album, song: songTitle });
        continue;
      }
      rowByVideo.set(hit.videoId, {
        video_id: hit.videoId,
        title: hit.title,
        artist: 'Ahadu Studios',
        album: albumDef.album,
        thumbnail_url: hit.thumbnail,
        published_at: hit.publishedAt,
        language: albumDef.language,
        type: albumDef.type,
        status: 'approved',
      });
    }
  }

  const rows = [...rowByVideo.values()];
  return { rows, missing, videoIds: new Set(rows.map((r) => r.video_id)) };
}
