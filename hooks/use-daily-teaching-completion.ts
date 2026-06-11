import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { toDateKey } from '@/lib/daily-teaching';

const STORAGE_KEY = '@orthodox/daily-teaching-completions';

let cache = new Set<string>();
let loaded = false;
let loadPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  for (const subscriber of subscribers) subscriber();
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []);
    } catch {
      cache = new Set();
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...cache]));
  } catch {
    // Best-effort persistence.
  }
}

export async function markDailyTeachingCompleted(dateKey: string): Promise<void> {
  await ensureLoaded();
  cache.add(dateKey);
  emit();
  await persist();
}

export async function unmarkDailyTeachingCompleted(dateKey: string): Promise<void> {
  await ensureLoaded();
  cache.delete(dateKey);
  emit();
  await persist();
}

export async function toggleDailyTeachingCompleted(dateKey: string): Promise<boolean> {
  await ensureLoaded();
  if (cache.has(dateKey)) {
    cache.delete(dateKey);
    emit();
    await persist();
    return false;
  }
  cache.add(dateKey);
  emit();
  await persist();
  return true;
}

export function isDailyTeachingCompleted(dateKey: string): boolean {
  return cache.has(dateKey);
}

export function useDailyTeachingCompletion(dateKey: string) {
  const [completed, setCompleted] = useState(isDailyTeachingCompleted(dateKey));
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setCompleted(isDailyTeachingCompleted(dateKey));
      setReady(loaded);
    };
    subscribers.add(sync);
    void ensureLoaded().then(sync);
    sync();
    return () => {
      mounted = false;
      subscribers.delete(sync);
    };
  }, [dateKey]);

  const toggle = useCallback(async () => {
    const nowCompleted = await toggleDailyTeachingCompleted(dateKey);
    return nowCompleted;
  }, [dateKey]);

  const mark = useCallback(async () => {
    await markDailyTeachingCompleted(dateKey);
  }, [dateKey]);

  return { completed, ready, toggle, mark };
}

export function useTodayDailyTeachingCompleted() {
  return useDailyTeachingCompletion(toDateKey(new Date()));
}
