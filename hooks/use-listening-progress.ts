import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { isBundledSermonChannel } from '@/lib/sermon-catalog';
import type { SavedListenKind } from '@/hooks/use-saved-hymns';

const STORAGE_KEY = '@orthodox/listening-progress';
const MAX_ENTRIES_PER_KIND = 15;

export type ListeningProgressEntry = {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
  positionSeconds?: number;
  updatedAt: number;
  kind: SavedListenKind;
};

let cache: ListeningProgressEntry[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function normalizeKind(raw: string | undefined): SavedListenKind {
  if (raw === 'sermon' || raw === 'melody') return raw;
  return 'hymn';
}

function isValidEntry(value: unknown): value is ListeningProgressEntry & { kind?: string } {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.videoId === 'string' &&
    typeof e.title === 'string' &&
    typeof e.artist === 'string' &&
    typeof e.album === 'string'
  );
}

function normalizeEntry(raw: ListeningProgressEntry & { kind?: string }): ListeningProgressEntry {
  let kind = normalizeKind(raw.kind);
  if (kind === 'hymn' && isBundledSermonChannel(raw.artist)) kind = 'sermon';
  return {
    videoId: raw.videoId,
    title: raw.title,
    artist: raw.artist,
    album: raw.album,
    thumbnailUrl: raw.thumbnailUrl ?? '',
    positionSeconds: raw.positionSeconds,
    updatedAt: raw.updatedAt ?? Date.now(),
    kind,
  };
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
            .map(normalizeEntry)
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : [];
      cache = trimByKind(valid);
    } catch {
      cache = [];
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

function trimByKind(entries: ListeningProgressEntry[]): ListeningProgressEntry[] {
  const kinds: SavedListenKind[] = ['hymn', 'sermon', 'melody'];
  const merged: ListeningProgressEntry[] = [];
  for (const kind of kinds) {
    merged.push(
      ...entries
        .filter((entry) => entry.kind === kind)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_ENTRIES_PER_KIND)
    );
  }
  return merged.sort((a, b) => b.updatedAt - a.updatedAt);
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
    kind: entry.kind ?? existing?.kind ?? 'hymn',
    positionSeconds: entry.positionSeconds ?? existing?.positionSeconds,
    updatedAt: Date.now(),
  };
  const rest = cache.filter((e) => e.videoId !== entry.videoId);
  cache = trimByKind([next, ...rest]);
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
