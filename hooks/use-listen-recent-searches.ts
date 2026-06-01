import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@orthodox/listen-recent-searches';
const LEGACY_STORAGE_KEY = '@orthodox/recent-search/listen';

export type ListenRecentSearchKind =
  | 'query'
  | 'song'
  | 'playlist'
  | 'channel'
  | 'sermon'
  | 'video'
  | 'melody';

export type ListenRecentSearchEntry = {
  id: string;
  kind: ListenRecentSearchKind;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  searchedAt: number;
  query?: string;
  videoId?: string;
  artist?: string;
  album?: string;
  channelName?: string;
};

const MAX_ITEMS = 24;

function isValidEntry(value: unknown): value is ListenRecentSearchEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.kind === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.searchedAt === 'number'
  );
}

function buildId(entry: Omit<ListenRecentSearchEntry, 'id' | 'searchedAt'>): string {
  switch (entry.kind) {
    case 'query':
      return `query:${(entry.query ?? entry.title).trim().toLowerCase()}`;
    case 'song':
    case 'sermon':
    case 'video':
    case 'melody':
      return `${entry.kind}:${entry.videoId ?? entry.title}`;
    case 'playlist':
      return `playlist:${entry.artist ?? ''}:${entry.album ?? entry.title}`;
    case 'channel':
      return `channel:${entry.channelName ?? entry.title}`;
    default:
      return `item:${entry.title}`;
  }
}

export function useListenRecentSearches() {
  const [entries, setEntries] = useState<ListenRecentSearchEntry[]>([]);
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

  const persist = useCallback(async (next: ListenRecentSearchEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Best-effort persistence.
    }
  }, []);

  const addRecentSearch = useCallback(
    async (entry: Omit<ListenRecentSearchEntry, 'id' | 'searchedAt'>) => {
      const id = buildId(entry);
      const nextEntry: ListenRecentSearchEntry = {
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
