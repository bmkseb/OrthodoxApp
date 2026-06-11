import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getPalette,
  type AppPalette,
  type ColorScheme,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemePreference = 'system' | 'light' | 'dark';

const PREFERENCE_KEY = '@orthodox/color-scheme';
const CHOSEN_KEY = '@orthodox/has-chosen-appearance';

const DEFAULT_PREFERENCE: ThemePreference = 'light';

let cachePreference: ThemePreference = DEFAULT_PREFERENCE;
let cacheHasChosen = false;
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function normalizePreference(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return DEFAULT_PREFERENCE;
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const [storedPreference, storedChosen] = await Promise.all([
        AsyncStorage.getItem(PREFERENCE_KEY),
        AsyncStorage.getItem(CHOSEN_KEY),
      ]);
      cachePreference = normalizePreference(storedPreference);
      cacheHasChosen = storedChosen === '1';
    } catch {
      cachePreference = DEFAULT_PREFERENCE;
      cacheHasChosen = false;
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: ColorScheme;
  palette: AppPalette;
  ready: boolean;
  hasChosenAppearance: boolean;
  setPreference: (next: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(cachePreference);
  const [hasChosenAppearance, setHasChosenAppearance] = useState(cacheHasChosen);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setPreferenceState(cachePreference);
      setHasChosenAppearance(cacheHasChosen);
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

  const colorScheme: ColorScheme = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return preference;
  }, [preference, systemScheme]);

  const palette = useMemo(() => getPalette(colorScheme), [colorScheme]);

  const setPreference = useCallback(async (next: ThemePreference) => {
    cachePreference = next;
    cacheHasChosen = true;
    setPreferenceState(next);
    setHasChosenAppearance(true);
    emit();
    try {
      await Promise.all([
        AsyncStorage.setItem(PREFERENCE_KEY, next),
        AsyncStorage.setItem(CHOSEN_KEY, '1'),
      ]);
    } catch {
      // Best-effort persistence; in-memory state already updated.
    }
  }, []);

  const value = useMemo(
    () => ({
      preference,
      colorScheme,
      palette,
      ready,
      hasChosenAppearance,
      setPreference,
    }),
    [preference, colorScheme, palette, ready, hasChosenAppearance, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function usePalette() {
  return useTheme().palette;
}
