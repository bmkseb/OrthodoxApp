import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = '@orthodox/saved-teachings';

export type SavedTeaching = {
  slug: string;
  title: string;
  subtitle?: string;
  savedAt: number;
};

let cache: SavedTeaching[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  for (const subscriber of subscribers) subscriber();
}

function isValidEntry(value: unknown): value is SavedTeaching {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.slug === 'string' && typeof entry.title === 'string';
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed)
        ? parsed.filter(isValidEntry).sort((a, b) => b.savedAt - a.savedAt)
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

/** Toggle saved state; returns true if now saved. */
export async function toggleSavedTeaching(
  entry: Omit<SavedTeaching, 'savedAt'>
): Promise<boolean> {
  await ensureLoaded();
  const exists = cache.some((item) => item.slug === entry.slug);
  if (exists) {
    cache = cache.filter((item) => item.slug !== entry.slug);
    emit();
    await persist();
    return false;
  }

  cache = [{ ...entry, savedAt: Date.now() }, ...cache];
  emit();
  await persist();
  return true;
}

export async function removeSavedTeaching(slug: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((item) => item.slug !== slug);
  emit();
  await persist();
}

export function useSavedTeachings() {
  const [entries, setEntries] = useState<SavedTeaching[]>(cache);
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

  const isSaved = (slug: string | undefined) =>
    Boolean(slug && entries.some((entry) => entry.slug === slug));

  return { entries, ready, isSaved };
}
