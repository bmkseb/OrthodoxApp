import AsyncStorage from '@react-native-async-storage/async-storage';

import { MEZMUR_YOUTUBE_STATS } from '@/data/mezmurYoutubeStats';

const CACHE_KEY = '@orthodox/youtube-video-stats';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const BATCH_SIZE = 50;

export type YoutubeVideoStat = {
  videoId: string;
  viewCount: number;
  likeCount: number;
  fetchedAt: number;
};

export type YoutubeVideoStatLite = Pick<YoutubeVideoStat, 'viewCount' | 'likeCount'>;

function getApiKey(): string | null {
  return process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim() || null;
}

function parseCount(value: unknown): number {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function isValidCachedStat(value: unknown): value is YoutubeVideoStat {
  if (!value || typeof value !== 'object') return false;
  const stat = value as Record<string, unknown>;
  return (
    typeof stat.videoId === 'string' &&
    typeof stat.viewCount === 'number' &&
    typeof stat.likeCount === 'number' &&
    typeof stat.fetchedAt === 'number'
  );
}

async function loadCache(): Promise<Map<string, YoutubeVideoStat>> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return new Map();
    const map = new Map<string, YoutubeVideoStat>();
    for (const entry of parsed) {
      if (isValidCachedStat(entry)) map.set(entry.videoId, entry);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function saveCache(map: Map<string, YoutubeVideoStat>): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([...map.values()]));
  } catch {
    // Best-effort persistence.
  }
}

function bundledStats(): Map<string, YoutubeVideoStatLite> {
  const map = new Map<string, YoutubeVideoStatLite>();
  for (const [videoId, stat] of Object.entries(MEZMUR_YOUTUBE_STATS)) {
    map.set(videoId, {
      viewCount: stat.viewCount,
      likeCount: stat.likeCount,
    });
  }
  return map;
}

async function fetchYoutubeBatch(videoIds: string[], fetchedAt: number): Promise<YoutubeVideoStat[]> {
  const key = getApiKey();
  if (!key || videoIds.length === 0) return [];

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'statistics');
  url.searchParams.set('id', videoIds.join(','));
  url.searchParams.set('key', key);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = (await res.json()) as {
    items?: Array<{
      id?: string;
      statistics?: { viewCount?: string; likeCount?: string };
    }>;
  };

  const stats: YoutubeVideoStat[] = [];
  for (const item of data.items ?? []) {
    const videoId = item.id?.trim();
    if (!videoId) continue;
    stats.push({
      videoId,
      viewCount: parseCount(item.statistics?.viewCount),
      likeCount: parseCount(item.statistics?.likeCount),
      fetchedAt,
    });
  }
  return stats;
}

/** Combined views + likes score for ranking. */
export function youtubePopularityScore(stat: YoutubeVideoStatLite): number {
  return stat.viewCount + stat.likeCount;
}

/** Resolve YouTube stats from bundled data, cache, and optional live API refresh. */
export async function resolveYoutubeVideoStats(
  videoIds: string[]
): Promise<Map<string, YoutubeVideoStatLite>> {
  const unique = [...new Set(videoIds.map((id) => id.trim()).filter(Boolean))];
  const result = new Map<string, YoutubeVideoStatLite>();
  const bundled = bundledStats();
  const cache = await loadCache();
  const now = Date.now();
  const stale: string[] = [];

  for (const videoId of unique) {
    const cached = cache.get(videoId);
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      result.set(videoId, cached);
      continue;
    }
    const shipped = bundled.get(videoId);
    if (shipped && (shipped.viewCount > 0 || shipped.likeCount > 0)) {
      result.set(videoId, shipped);
      continue;
    }
    stale.push(videoId);
  }

  if (stale.length === 0) return result;

  for (let i = 0; i < stale.length; i += BATCH_SIZE) {
    const batch = stale.slice(i, i + BATCH_SIZE);
    const fetched = await fetchYoutubeBatch(batch, now);
    for (const stat of fetched) {
      result.set(stat.videoId, stat);
      cache.set(stat.videoId, stat);
    }
  }

  if (stale.length > 0) await saveCache(cache);
  return result;
}
