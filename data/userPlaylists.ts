import type { SavedListenKind } from '@/hooks/use-saved-hymns';

/** Route artist param for user hymn playlists. */
export const USER_PLAYLIST_ARTIST = 'My Playlists';

/** Route artist param for user sermon playlists. */
export const USER_SERMON_PLAYLIST_ARTIST = 'My Sermon Playlists';

export function isUserPlaylistArtist(artist: string): boolean {
  return artist === USER_PLAYLIST_ARTIST || artist === USER_SERMON_PLAYLIST_ARTIST;
}

export function userPlaylistArtistForKind(kind: SavedListenKind): string {
  if (kind === 'sermon') return USER_SERMON_PLAYLIST_ARTIST;
  if (kind === 'melody') return USER_PLAYLIST_ARTIST;
  return USER_PLAYLIST_ARTIST;
}

export function playlistKindFromArtist(artist: string): SavedListenKind {
  if (artist === USER_SERMON_PLAYLIST_ARTIST) return 'sermon';
  return 'hymn';
}

export function newUserPlaylistId(): string {
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
