import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { PRAYER_LANGUAGES, type PrayerLanguage } from '@/lib/prayer';

const STORAGE_KEY = '@orthodox/prayer-language';
const DEFAULT_LANGUAGE: PrayerLanguage = 'english';

// Module-level cache + pub/sub so every prayer screen shares one preference and
// stays in sync the moment the picker changes.
let cache: PrayerLanguage = DEFAULT_LANGUAGE;
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isPrayerLanguage(value: unknown): value is PrayerLanguage {
  return PRAYER_LANGUAGES.includes(value as PrayerLanguage);
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (isPrayerLanguage(raw)) cache = raw;
    } catch {
      cache = DEFAULT_LANGUAGE;
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

/** Synchronously read the current preference (default English until loaded). */
export function getPrayerLanguage(): PrayerLanguage {
  return cache;
}

/** Persist the chosen prayer language as a global user preference. */
export async function setPrayerLanguagePreference(lang: PrayerLanguage): Promise<void> {
  if (!isPrayerLanguage(lang) || lang === cache) return;
  cache = lang;
  emit();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Best-effort persistence; in-memory state already updated.
  }
}

/** Persisted prayer-language preference, shared across all prayer screens. */
export function usePrayerLanguagePreference() {
  const [language, setLanguageState] = useState<PrayerLanguage>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setLanguageState(cache);
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

  return { language, setLanguage: setPrayerLanguagePreference, ready };
}
