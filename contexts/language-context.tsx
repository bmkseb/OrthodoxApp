import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { preloadTabAssets } from '@/lib/preload-assets';
import {
  getStorageKey,
  HeaderDisplay,
  HeaderKey,
  LanguageMode,
  normalizeStoredMode,
  resolveHeader,
  translate,
  TranslationKey,
} from '@/lib/translations';
import { getEthiopicTextStyle, getSacredTypography } from '@/lib/translations/typography';

type LanguageContextValue = {
  mode: LanguageMode;
  isReady: boolean;
  setMode: (mode: LanguageMode) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  header: (key: HeaderKey) => HeaderDisplay;
  typography: ReturnType<typeof getSacredTypography>;
  ethiopicStyle: ReturnType<typeof getEthiopicTextStyle>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>('bilingual');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(getStorageKey());
        if (mounted) setModeState(normalizeStoredMode(stored));
      } finally {
        if (mounted) setIsReady(true);
      }
    })();
    preloadTabAssets();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback(async (next: LanguageMode) => {
    setModeState(next);
    await AsyncStorage.setItem(getStorageKey(), next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      mode,
      isReady,
      setMode,
      t: (key, params) => translate(key, mode, params),
      header: (key) => resolveHeader(key, mode),
      typography: getSacredTypography(mode),
      ethiopicStyle: getEthiopicTextStyle(mode),
    }),
    [mode, isReady, setMode]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useTranslation() {
  const { t, header, mode, typography, ethiopicStyle, setMode, isReady } = useLanguage();
  return { t, header, mode, typography, ethiopicStyle, setMode, isReady };
}
