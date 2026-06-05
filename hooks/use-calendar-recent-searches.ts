import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@orthodox/calendar-recent-searches';
const LEGACY_STORAGE_KEY = '@orthodox/recent-search/calendar';
const MAX_ITEMS = 24;

export type CalendarRecentSearchKind = 'query' | 'feast' | 'fasting';

export type CalendarRecentSearchEntry = {
  id: string;
  kind: CalendarRecentSearchKind;
  title: string;
  subtitle?: string;
  searchedAt: number;
  query?: string;
  dateIso?: string;
};

function isValidEntry(value: unknown): value is CalendarRecentSearchEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.kind === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.searchedAt === 'number'
  );
}

function buildId(entry: Omit<CalendarRecentSearchEntry, 'id' | 'searchedAt'>): string {
  switch (entry.kind) {
    case 'query':
      return `query:${(entry.query ?? entry.title).trim().toLowerCase()}`;
    case 'feast':
    case 'fasting':
      return `${entry.kind}:${entry.dateIso ?? entry.title}`;
    default:
      return `item:${entry.title}`;
  }
}

export function useCalendarRecentSearches() {
  const [entries, setEntries] = useState<CalendarRecentSearchEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const legacyRaw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacyRaw) {
            const legacy = JSON.parse(legacyRaw) as unknown;
            const migrated = Array.isArray(legacy)
              ? legacy
                  .filter((term): term is string => typeof term === 'string' && term.trim().length > 0)
                  .map((term, index) => ({
                    id: `query:${term.trim().toLowerCase()}`,
                    kind: 'query' as const,
                    title: term.trim(),
                    query: term.trim(),
                    searchedAt: Date.now() - index,
                  }))
              : [];
            if (migrated.length > 0) {
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
              raw = JSON.stringify(migrated);
            }
          }
        }

        if (mounted && raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            setEntries(
              parsed
                .filter(isValidEntry)
                .sort((a, b) => b.searchedAt - a.searchedAt)
                .slice(0, MAX_ITEMS)
            );
          }
        }
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: CalendarRecentSearchEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Best-effort persistence.
    }
  }, []);

  const addRecentSearch = useCallback(
    async (entry: Omit<CalendarRecentSearchEntry, 'id' | 'searchedAt'>) => {
      const id = buildId(entry);
      const nextEntry: CalendarRecentSearchEntry = {
        ...entry,
        id,
        searchedAt: Date.now(),
      };
      setEntries((prev) => {
        const next = [nextEntry, ...prev.filter((item) => item.id !== id)].slice(0, MAX_ITEMS);
        void persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeRecentSearch = useCallback(
    async (id: string) => {
      setEntries((prev) => {
        const next = prev.filter((item) => item.id !== id);
        void persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearRecentSearches = useCallback(async () => {
    setEntries([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Best-effort persistence.
    }
  }, []);

  return {
    entries,
    ready,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
