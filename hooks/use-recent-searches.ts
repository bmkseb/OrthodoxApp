import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = '@orthodox/recent-search/';

export function useRecentSearches(screenKey: string, maxItems = 8) {
  const storageKey = `${STORAGE_PREFIX}${screenKey}`;
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (mounted && raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.filter((x): x is string => typeof x === 'string'));
          }
        }
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const addRecentSearch = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setRecentSearches((prev) => {
        const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, maxItems);
        void AsyncStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey, maxItems],
  );

  const removeRecentSearch = useCallback(
    async (term: string) => {
      setRecentSearches((prev) => {
        const next = prev.filter((x) => x !== term);
        void AsyncStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  return { recentSearches, addRecentSearch, removeRecentSearch, ready };
}
