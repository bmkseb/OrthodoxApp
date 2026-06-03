import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { isBundledSermonChannel } from '@/lib/sermon-catalog';

const STORAGE_KEY = '@orthodox/saved-hymns';
const LEGACY_STORAGE_KEY = '@orthodox/favorited-hymns';

export type SavedListenKind = 'hymn' | 'sermon' | 'melody';

export type SavedHymn = {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
  savedAt: number;
  kind: SavedListenKind;
};

let cache: SavedHymn[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  for (const subscriber of subscribers) subscriber();
}

function isValidEntry(value: unknown): value is SavedHymn & { favoritedAt?: number; kind?: string } {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.videoId === 'string' &&
    typeof e.title === 'string' &&
    typeof e.artist === 'string' &&
    typeof e.album === 'string'
  );
}

function normalizeKind(raw: string | undefined): SavedListenKind {
  if (raw === 'sermon' || raw === 'melody') return raw;
  return 'hymn';
}

function normalizeEntry(raw: SavedHymn & { favoritedAt?: number; kind?: string }): SavedHymn {
  let kind = normalizeKind(raw.kind);
  if (kind === 'hymn' && isBundledSermonChannel(raw.artist)) kind = 'sermon';
  return {
    videoId: raw.videoId,
    title: raw.title,
    artist: raw.artist,
    album: raw.album,
    thumbnailUrl: raw.thumbnailUrl ?? '',
    savedAt: raw.savedAt ?? raw.favoritedAt ?? Date.now(),
    kind,
  };
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      let raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      }
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed)
        ? parsed
            .filter(isValidEntry)
            .map(normalizeEntry)
            .sort((a, b) => b.savedAt - a.savedAt)
        : [];
      if (raw && !(await AsyncStorage.getItem(STORAGE_KEY))) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
      }
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

/** Toggle saved state; returns true if now saved. */
export async function toggleSavedHymn(
  entry: Omit<SavedHymn, 'savedAt'> & { kind?: SavedListenKind }
): Promise<boolean> {
  await ensureLoaded();
  const kind = entry.kind ?? 'hymn';
  const exists = cache.some((e) => e.videoId === entry.videoId);
  if (exists) {
    cache = cache.filter((e) => e.videoId !== entry.videoId);
    emit();
    await persist();
    return false;
  }

  cache = [{ ...entry, kind, savedAt: Date.now() }, ...cache];
  emit();
  await persist();
  return true;
}

export async function removeSavedHymn(videoId: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((e) => e.videoId !== videoId);
  emit();
  await persist();
}

export function useSavedHymns() {
  const [entries, setEntries] = useState<SavedHymn[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setEntries(cache);
      setReady(loaded);
    };
    subscribers.add(sync);
    void ensureLoaded().then(sync);
    sync();
    return () => {
      mounted = false;
      subscribers.delete(sync);
    };
  }, []);

  const isSaved = (videoId: string | undefined) =>
    Boolean(videoId && entries.some((entry) => entry.videoId === videoId));

  const entriesForKind = (kind: SavedListenKind) => entries.filter((entry) => entry.kind === kind);

  return { entries, ready, isSaved, entriesForKind };
}
