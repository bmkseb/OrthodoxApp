import AsyncStorage from '@react-native-async-storage/async-storage';

import { POPULAR_HYMN_FALLBACK_IDS } from '@/data/popularHymns';
import { POPULAR_SERMON_FALLBACK_IDS } from '@/data/popularSermons';
import { incrementGlobalMezmurPlay } from '@/lib/mezmur-global-plays';
import type { Mezmur } from '@/lib/mezmur';
import { isSermonCatalogSong } from '@/lib/sermon-catalog';
import {
  youtubePopularityScore,
  type YoutubeVideoStatLite,
} from '@/lib/youtube-video-stats';

const STORAGE_KEY = '@orthodox/mezmur-play-stats';
const MAX_STATS = 250;

export type MezmurPlayStat = {
  videoId: string;
  playCount: number;
  lastPlayedAt: number;
};

let cache: MezmurPlayStat[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isValidStat(value: unknown): value is MezmurPlayStat {
  if (!value || typeof value !== 'object') return false;
  const stat = value as Record<string, unknown>;
  return (
    typeof stat.videoId === 'string' &&
    typeof stat.playCount === 'number' &&
    typeof stat.lastPlayedAt === 'number'
  );
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed)
        ? parsed
            .filter(isValidStat)
            .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
            .slice(0, MAX_STATS)
        : [];
    } catch {
      cache = [];
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Best-effort persistence.
  }
}

/** Increment local play count when a hymn starts playing. */
export async function recordMezmurPlay(videoId: string): Promise<void> {
  const id = videoId.trim();
  if (!id) return;
  await ensureLoaded();
  const existing = cache.find((stat) => stat.videoId === id);
  const next: MezmurPlayStat = {
    videoId: id,
    playCount: (existing?.playCount ?? 0) + 1,
    lastPlayedAt: Date.now(),
  };
  cache = [next, ...cache.filter((stat) => stat.videoId !== id)].slice(0, MAX_STATS);
  emit();
  await persist();
  void incrementGlobalMezmurPlay(id);
}

/** Prefer global Supabase counts; fall back to this device's local stats. */
export function resolvePopularMezmurPlayStats(
  globalStats: MezmurPlayStat[],
  localStats: MezmurPlayStat[]
): MezmurPlayStat[] {
  if (globalStats.some((stat) => stat.playCount > 0)) return globalStats;
  return localStats;
}

export function getMezmurPlayStats(): MezmurPlayStat[] {
  return cache;
}

export type RankedPopularMezmur = {
  rank: number;
  song: Mezmur;
  playCount: number;
};

export type RankedPopularMezmurByYoutube = {
  rank: number;
  song: Mezmur;
  viewCount: number;
  likeCount: number;
  score: number;
};

function comparePlayStats(a: MezmurPlayStat, b: MezmurPlayStat): number {
  if (b.playCount !== a.playCount) return b.playCount - a.playCount;
  return b.lastPlayedAt - a.lastPlayedAt;
}

/** Rank hymns by in-app listen frequency (local play counts). */
export function rankPopularMezmur(
  songs: Mezmur[],
  stats: MezmurPlayStat[],
  limit = 10
): RankedPopularMezmur[] {
  const hymns = songs.filter((song) => !isSermonCatalogSong(song));
  const byId = new Map(hymns.map((song) => [song.videoId, song]));

  const ranked: RankedPopularMezmur[] = stats
    .filter((stat) => stat.playCount > 0 && byId.has(stat.videoId))
    .sort(comparePlayStats)
    .slice(0, limit)
    .map((stat, index) => ({
      rank: index + 1,
      song: byId.get(stat.videoId)!,
      playCount: stat.playCount,
    }));

  if (ranked.length >= limit) return ranked;

  const seen = new Set(ranked.map((entry) => entry.song.videoId));
  for (const videoId of POPULAR_HYMN_FALLBACK_IDS) {
    if (ranked.length >= limit) break;
    const song = byId.get(videoId);
    if (!song || seen.has(videoId)) continue;
    ranked.push({
      rank: ranked.length + 1,
      song,
      playCount: 0,
    });
    seen.add(videoId);
  }

  return ranked;
}

/** Rank sermons by in-app listen frequency (local play counts). */
export function rankPopularSermons(
  songs: Mezmur[],
  stats: MezmurPlayStat[],
  limit = 10
): RankedPopularMezmur[] {
  const sermons = songs.filter((song) => isSermonCatalogSong(song));
  const byId = new Map(sermons.map((song) => [song.videoId, song]));

  const ranked: RankedPopularMezmur[] = stats
    .filter((stat) => stat.playCount > 0 && byId.has(stat.videoId))
    .sort(comparePlayStats)
    .slice(0, limit)
    .map((stat, index) => ({
      rank: index + 1,
      song: byId.get(stat.videoId)!,
      playCount: stat.playCount,
    }));

  if (ranked.length >= limit) return ranked;

  const seen = new Set(ranked.map((entry) => entry.song.videoId));
  for (const videoId of POPULAR_SERMON_FALLBACK_IDS) {
    if (ranked.length >= limit) break;
    const song = byId.get(videoId);
    if (!song || seen.has(videoId)) continue;
    ranked.push({
      rank: ranked.length + 1,
      song,
      playCount: 0,
    });
    seen.add(videoId);
  }

  return ranked;
}

/** Rank hymns by YouTube views + likes (higher score = more popular). */
export function rankPopularMezmurByYoutube(
  songs: Mezmur[],
  statsByVideoId: Map<string, YoutubeVideoStatLite>,
  limit = 10
): RankedPopularMezmurByYoutube[] {
  const hymns = songs.filter((song) => !isSermonCatalogSong(song));
  const byId = new Map(hymns.map((song) => [song.videoId, song]));

  const scored = hymns
    .map((song) => {
      const stat = statsByVideoId.get(song.videoId);
      const viewCount = stat?.viewCount ?? 0;
      const likeCount = stat?.likeCount ?? 0;
      const score = youtubePopularityScore({ viewCount, likeCount });
      return { song, viewCount, likeCount, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
      return b.viewCount - a.viewCount;
    });

  const ranked: RankedPopularMezmurByYoutube[] = scored.slice(0, limit).map((entry, index) => ({
    rank: index + 1,
    song: entry.song,
    viewCount: entry.viewCount,
    likeCount: entry.likeCount,
    score: entry.score,
  }));

  if (ranked.length >= limit) return ranked;

  const seen = new Set(ranked.map((entry) => entry.song.videoId));
  for (const videoId of POPULAR_HYMN_FALLBACK_IDS) {
    if (ranked.length >= limit) break;
    const song = byId.get(videoId);
    if (!song || seen.has(videoId)) continue;
    const stat = statsByVideoId.get(videoId);
    ranked.push({
      rank: ranked.length + 1,
      song,
      viewCount: stat?.viewCount ?? 0,
      likeCount: stat?.likeCount ?? 0,
      score: stat ? youtubePopularityScore(stat) : 0,
    });
    seen.add(videoId);
  }

  return ranked;
}

export function subscribeMezmurPlayStats(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function ensureMezmurPlayStatsLoaded(): Promise<void> {
  await ensureLoaded();
}
