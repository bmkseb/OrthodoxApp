import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { newUserPlaylistId } from '@/data/userPlaylists';

const STORAGE_KEY = '@orthodox/user-playlists';

export type UserPlaylist = {
  id: string;
  title: string;
  videoIds: string[];
  /** Local file URI from image picker, or null for the default music-note cover. */
  coverImageUri?: string | null;
  createdAt: number;
  updatedAt: number;
};

let cache: UserPlaylist[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  for (const subscriber of subscribers) subscriber();
}

function isValidPlaylist(value: unknown): value is UserPlaylist {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.title === 'string' &&
    Array.isArray(row.videoIds) &&
    row.videoIds.every((id) => typeof id === 'string')
  );
}

function normalizePlaylist(raw: UserPlaylist): UserPlaylist {
  const now = Date.now();
  const cover =
    typeof raw.coverImageUri === 'string' && raw.coverImageUri.trim()
      ? raw.coverImageUri.trim()
      : null;
  return {
    id: raw.id,
    title: raw.title.trim() || 'Untitled playlist',
    videoIds: [...new Set(raw.videoIds.map((id) => (typeof id === 'string' ? id.trim() : '')).filter(Boolean))],
    coverImageUri: cover,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed)
        ? parsed.filter(isValidPlaylist).map(normalizePlaylist).sort((a, b) => b.updatedAt - a.updatedAt)
        : [];
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
    // Best-effort persistence.
  }
}

export async function fetchUserPlaylists(): Promise<UserPlaylist[]> {
  await ensureLoaded();
  return [...cache];
}

export async function createUserPlaylist(
  title: string,
  videoIds: string[] = [],
  coverImageUri?: string | null
): Promise<UserPlaylist> {
  await ensureLoaded();
  const now = Date.now();
  const cover =
    typeof coverImageUri === 'string' && coverImageUri.trim() ? coverImageUri.trim() : null;
  const playlist: UserPlaylist = {
    id: newUserPlaylistId(),
    title: title.trim() || 'Untitled playlist',
    videoIds: [...new Set(videoIds.map((id) => id.trim()).filter(Boolean))],
    coverImageUri: cover,
    createdAt: now,
    updatedAt: now,
  };
  cache = [playlist, ...cache];
  await persist();
  emit();
  return playlist;
}

export async function renameUserPlaylist(id: string, title: string): Promise<void> {
  await ensureLoaded();
  const trimmed = title.trim();
  if (!trimmed) return;
  cache = cache.map((p) =>
    p.id === id ? { ...p, title: trimmed, updatedAt: Date.now() } : p
  );
  await persist();
  emit();
}

export async function deleteUserPlaylist(id: string): Promise<void> {
  await ensureLoaded();
  cache = cache.filter((p) => p.id !== id);
  await persist();
  emit();
}

export async function addSongToUserPlaylist(id: string, videoId: string): Promise<boolean> {
  const vid = videoId.trim();
  if (!vid) return false;
  await ensureLoaded();
  let found = false;
  cache = cache.map((p) => {
    if (p.id !== id) return p;
    found = true;
    if (p.videoIds.includes(vid)) return { ...p, updatedAt: Date.now() };
    return {
      ...p,
      videoIds: [...p.videoIds, vid],
      updatedAt: Date.now(),
    };
  });
  if (!found) return false;
  await persist();
  emit();
  return true;
}

export async function setUserPlaylistCoverImage(
  id: string,
  coverImageUri: string | null
): Promise<void> {
  await ensureLoaded();
  const cover =
    typeof coverImageUri === 'string' && coverImageUri.trim() ? coverImageUri.trim() : null;
  cache = cache.map((p) =>
    p.id === id ? { ...p, coverImageUri: cover, updatedAt: Date.now() } : p
  );
  await persist();
  emit();
}

export async function removeSongFromUserPlaylist(id: string, videoId: string): Promise<void> {
  await ensureLoaded();
  cache = cache.map((p) =>
    p.id === id
      ? {
          ...p,
          videoIds: p.videoIds.filter((vid) => vid !== videoId),
          updatedAt: Date.now(),
        }
      : p
  );
  await persist();
  emit();
}

export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void ensureLoaded().then(() => {
      if (active) {
        setPlaylists([...cache]);
        setReady(true);
      }
    });
    const refresh = () => setPlaylists([...cache]);
    subscribers.add(refresh);
    return () => {
      active = false;
      subscribers.delete(refresh);
    };
  }, []);

  const refresh = useCallback(async () => {
    await ensureLoaded();
    setPlaylists([...cache]);
  }, []);

  return { playlists, ready, refresh };
}
