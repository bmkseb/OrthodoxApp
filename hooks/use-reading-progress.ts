import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import type { ScriptureLang } from '@/types/scripture';

const STORAGE_KEY = '@orthodox/reading-progress';
const MAX_ENTRIES = 12;

export type ReadingProgressEntry = {
  bookId: string;
  chapter: number;
  totalChapters: number;
  lang: ScriptureLang;
  updatedAt: number;
  /** Display title for non-scripture catalog books (e.g. prayer books). */
  title?: string;
  /** Secondary line for non-scripture catalog books (e.g. the section name). */
  subtitle?: string;
};

/** Catalog books other than the Bible store progress under a namespaced id. */
export const PRAYER_BOOK_PREFIX = 'prayer:';

export function makePrayerBookId(slug: string): string {
  return `${PRAYER_BOOK_PREFIX}${slug}`;
}

export function isPrayerBookId(bookId: string): boolean {
  return bookId.startsWith(PRAYER_BOOK_PREFIX);
}

export function prayerSlugFromBookId(bookId: string): string {
  return bookId.slice(PRAYER_BOOK_PREFIX.length);
}

// Module-level cache + pub/sub so the chapter reader and the Read tab stay in sync.
let cache: ReadingProgressEntry[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isValidEntry(value: unknown): value is ReadingProgressEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return typeof e.bookId === 'string' && typeof e.chapter === 'number';
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

/** Upsert the latest read position for a book and move it to the front of the list. */
export async function recordReadingProgress(entry: ReadingProgressEntry): Promise<void> {
  await ensureLoaded();
  const rest = cache.filter((e) => e.bookId !== entry.bookId);
  cache = [entry, ...rest].slice(0, MAX_ENTRIES);
  emit();
  await persist();
}

/** Remove a book from the Continue Reading list. */
export async function removeReadingProgress(bookId: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((e) => e.bookId !== bookId);
  emit();
  await persist();
}

export function useReadingProgress() {
  const [entries, setEntries] = useState<ReadingProgressEntry[]>(cache);
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
