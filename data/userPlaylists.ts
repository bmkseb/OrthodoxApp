/** Route artist param for locally stored user playlists. */
export const USER_PLAYLIST_ARTIST = 'My Playlists';

export function isUserPlaylistArtist(artist: string): boolean {
  return artist === USER_PLAYLIST_ARTIST;
}

export function newUserPlaylistId(): string {
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
