import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = '@orthodox/reader-font-scale';

/** Discrete reading-text sizes, smallest → largest. 1.0 is the baseline. */
export const FONT_SCALE_LEVELS = [0.85, 1, 1.15, 1.3, 1.45, 1.6, 1.75] as const;
export const FONT_SCALE_MIN = FONT_SCALE_LEVELS[0];
export const FONT_SCALE_MAX = FONT_SCALE_LEVELS[FONT_SCALE_LEVELS.length - 1];
/** Baseline reading size when the user hasn't chosen one. */
export const FONT_SCALE_DEFAULT = 1;
const DEFAULT_SCALE = FONT_SCALE_DEFAULT;

/** Snap an arbitrary scale to the nearest supported level. */
export function snapFontScale(value: number): number {
  let nearest = FONT_SCALE_LEVELS[0] as number;
  for (const level of FONT_SCALE_LEVELS) {
    if (Math.abs(level - value) < Math.abs(nearest - value)) nearest = level;
  }
  return nearest;
}

// Module-level cache + pub/sub so every reader shares one font-size preference.
let cache: number = DEFAULT_SCALE;
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw != null ? Number(raw) : NaN;
      if (Number.isFinite(parsed)) cache = snapFontScale(parsed);
    } catch {
      cache = DEFAULT_SCALE;
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

/** Synchronously read the current font scale (default 1.0 until loaded). */
export function getFontScale(): number {
  return cache;
}

/** Persist a new font scale, snapped to a supported level. */
export async function setFontScalePreference(value: number): Promise<void> {
  const next = snapFontScale(value);
  if (next === cache) return;
  cache = next;
  emit();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Best-effort persistence; in-memory state already updated.
  }
}

/** Step the font scale up or down by one level. */
export async function stepFontScale(direction: 1 | -1): Promise<void> {
  const index = FONT_SCALE_LEVELS.indexOf(snapFontScale(cache) as (typeof FONT_SCALE_LEVELS)[number]);
  const nextIndex = Math.min(
    FONT_SCALE_LEVELS.length - 1,
    Math.max(0, (index < 0 ? FONT_SCALE_LEVELS.indexOf(DEFAULT_SCALE) : index) + direction)
  );
  await setFontScalePreference(FONT_SCALE_LEVELS[nextIndex]);
}

/** Persisted reading-text scale, shared across all reader screens. */
export function useFontScale() {
  const [scale, setScaleState] = useState<number>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setScaleState(cache);
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

  return {
    scale,
    ready,
    setScale: setFontScalePreference,
    increase: () => stepFontScale(1),
    decrease: () => stepFontScale(-1),
    canIncrease: scale < FONT_SCALE_MAX,
    canDecrease: scale > FONT_SCALE_MIN,
  };
}
