import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import type { ScriptureLang } from '@/types/scripture';

const STORAGE_KEY = '@orthodox/bookmarks';

export type Bookmark = {
  bookId: string;
  chapter: number;
  lang: ScriptureLang;
  bookTitle: string;
  createdAt: number;
};

export type BookmarkSeed = Omit<Bookmark, 'createdAt'>;

/** Identity for a bookmarked page. */
export function makeBookmarkId(bookId: string, chapter: number): string {
  return `${bookId}:${chapter}`;
}

// Module-level cache + pub/sub so the reader and the Saved screen stay in sync.
let cache: Bookmark[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isValid(value: unknown): value is Bookmark {
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
      cache = Array.isArray(parsed) ? parsed.filter(isValid) : [];
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
    // Best-effort; in-memory state already updated.
  }
}

/** Toggle a page bookmark on/off. Returns the new bookmarked state. */
export async function toggleBookmark(seed: BookmarkSeed): Promise<boolean> {
  await ensureLoaded();
  const id = makeBookmarkId(seed.bookId, seed.chapter);
  const exists = cache.some((b) => makeBookmarkId(b.bookId, b.chapter) === id);
  if (exists) {
    cache = cache.filter((b) => makeBookmarkId(b.bookId, b.chapter) !== id);
  } else {
    cache = [{ ...seed, createdAt: Date.now() }, ...cache];
  }
  emit();
  await persist();
  return !exists;
}

/** Remove a bookmark by its id. */
export async function removeBookmark(id: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((b) => makeBookmarkId(b.bookId, b.chapter) !== id);
  emit();
  await persist();
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setBookmarks([...cache]);
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

  return { bookmarks, ready };
}

/** Whether a specific page is currently bookmarked (reactive). */
export function useIsBookmarked(bookId: string, chapter: number): boolean {
  const { bookmarks } = useBookmarks();
  const id = makeBookmarkId(bookId, chapter);
  return bookmarks.some((b) => makeBookmarkId(b.bookId, b.chapter) === id);
}
