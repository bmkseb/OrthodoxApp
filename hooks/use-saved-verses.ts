import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import type { ScriptureLang } from '@/types/scripture';

const STORAGE_KEY = '@orthodox/saved-verses';

export type SavedVerse = {
  verseId: string;
  bookId: string;
  chapter: number;
  verse: number;
  lang: ScriptureLang;
  text: string;
  bookTitle: string;
  /** Highlight color (rgba string) or null when only a note is saved. */
  color: string | null;
  note: string | null;
  createdAt: number;
  updatedAt: number;
};

/** Identity for a saved verse, independent of any DB id padding scheme. */
export function makeVerseId(bookId: string, chapter: number, verse: number): string {
  return `${bookId}:${chapter}:${verse}`;
}

export type SavedVerseSeed = {
  bookId: string;
  chapter: number;
  verse: number;
  lang: ScriptureLang;
  text: string;
  bookTitle: string;
};

// Module-level cache + pub/sub so the reader and the Saved screen stay in sync.
let cache: SavedVerse[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isValid(value: unknown): value is SavedVerse {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return typeof e.verseId === 'string' && typeof e.bookId === 'string';
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

function upsert(seed: SavedVerseSeed, patch: Partial<SavedVerse>) {
  const verseId = makeVerseId(seed.bookId, seed.chapter, seed.verse);
  const now = Date.now();
  const existing = cache.find((v) => v.verseId === verseId);
  const next: SavedVerse = {
    verseId,
    bookId: seed.bookId,
    chapter: seed.chapter,
    verse: seed.verse,
    lang: seed.lang,
    text: seed.text,
    bookTitle: seed.bookTitle,
    color: existing?.color ?? null,
    note: existing?.note ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...patch,
  };

  // Drop the entry entirely when neither a highlight nor a note remains.
  if (!next.color && !next.note) {
    cache = cache.filter((v) => v.verseId !== verseId);
  } else {
    const rest = cache.filter((v) => v.verseId !== verseId);
    cache = [next, ...rest];
  }
  emit();
  void persist();
}

/** Set (or clear with null) the highlight color for a verse. */
export async function setVerseHighlight(seed: SavedVerseSeed, color: string | null): Promise<void> {
  await ensureLoaded();
  upsert(seed, { color });
}

/** Set (or clear with null/empty) the note for a verse. */
export async function setVerseNote(seed: SavedVerseSeed, note: string | null): Promise<void> {
  await ensureLoaded();
  const trimmed = note?.trim() ? note.trim() : null;
  upsert(seed, { note: trimmed });
}

/** Remove a saved verse (both highlight and note). */
export async function removeSavedVerse(verseId: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((v) => v.verseId !== verseId);
  emit();
  await persist();
}

export function useSavedVerses() {
  const [saved, setSaved] = useState<SavedVerse[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setSaved([...cache]);
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

  return { saved, ready };
}

/** Lookup map keyed by verseId for quick highlight/note rendering. */
export function useSavedVerseMap(): Record<string, SavedVerse> {
  const { saved } = useSavedVerses();
  const map: Record<string, SavedVerse> = {};
  for (const v of saved) map[v.verseId] = v;
  return map;
}
