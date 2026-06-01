import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = '@orthodox/listening-progress';
const MAX_ENTRIES = 15;

export type ListeningProgressEntry = {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
  positionSeconds?: number;
  updatedAt: number;
};

let cache: ListeningProgressEntry[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isValidEntry(value: unknown): value is ListeningProgressEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.videoId === 'string' &&
    typeof e.title === 'string' &&
    typeof e.artist === 'string' &&
    typeof e.album === 'string'
  );
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const valid = Array.isArray(parsed)
        ? parsed
            .filter(isValidEntry)
            .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        : [];
      cache = valid.slice(0, MAX_ENTRIES);
      if (valid.length > MAX_ENTRIES) await persist();
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

/** Upsert a recently played mezmur and move it to the front. */
export async function recordListeningProgress(
  entry: Omit<ListeningProgressEntry, 'updatedAt'>
): Promise<void> {
  await ensureLoaded();
  const existing = cache.find((e) => e.videoId === entry.videoId);
  const next: ListeningProgressEntry = {
    ...existing,
    ...entry,
    positionSeconds: entry.positionSeconds ?? existing?.positionSeconds,
    updatedAt: Date.now(),
  };
  const rest = cache.filter((e) => e.videoId !== entry.videoId);
  cache = [next, ...rest].slice(0, MAX_ENTRIES);
  emit();
  await persist();
}

/** Last playback position for a mezmur, if saved. */
export async function getListeningPosition(videoId: string): Promise<number> {
  await ensureLoaded();
  const entry = cache.find((e) => e.videoId === videoId);
  return entry?.positionSeconds ?? 0;
}

/** Remove a mezmur from Continue Listening. */
export async function removeListeningProgress(videoId: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((e) => e.videoId !== videoId);
  emit();
  await persist();
}

export function useListeningProgress() {
  const [entries, setEntries] = useState<ListeningProgressEntry[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setEntries(cache);
      setReady(loaded);
    };
    listeners.add(sync);
    void ensureLoaded().then(sync);
    sync();
    return () => {
      mounted = false;
      listeners.delete(sync);
    };
  }, []);

  return { entries, ready };
}
