import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = '@orthodox/learning-progress';
const MAX_ENTRIES = 12;

export type LearningProgressEntry = {
  /** Doctrine subtopic slug — the lesson route segment. */
  slug: string;
  title: string;
  /** Collection / series the lesson belongs to (shown as the card subtitle). */
  subtitle?: string;
  /** Furthest fraction read, 0..1. */
  progress: number;
  updatedAt: number;
};

// Module-level cache + pub/sub so the lesson reader and the Learn tab stay in sync.
let cache: LearningProgressEntry[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isValidEntry(value: unknown): value is LearningProgressEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return typeof e.slug === 'string' && typeof e.title === 'string';
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
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
    // Best-effort persistence; in-memory state already updated.
  }
}

/** Synchronously read the current progress for a lesson (0 when unseen). */
export function getLearningProgress(slug: string): LearningProgressEntry | undefined {
  return cache.find((e) => e.slug === slug);
}

/**
 * Upsert a lesson's read position and move it to the front. Progress never
 * regresses — we keep the furthest point reached for a given lesson.
 */
export async function recordLearningProgress(entry: LearningProgressEntry): Promise<void> {
  await ensureLoaded();
  const existing = cache.find((e) => e.slug === entry.slug);
  const merged: LearningProgressEntry = {
    ...entry,
    progress: Math.max(entry.progress, existing?.progress ?? 0),
  };
  const rest = cache.filter((e) => e.slug !== entry.slug);
  cache = [merged, ...rest].slice(0, MAX_ENTRIES);
  emit();
  await persist();
}

/** Remove a lesson from the Continue Learning list. */
export async function removeLearningProgress(slug: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((e) => e.slug !== slug);
  emit();
  await persist();
}

export function useLearningProgress() {
  const [entries, setEntries] = useState<LearningProgressEntry[]>(cache);
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
