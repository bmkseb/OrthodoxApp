import type { ListenRecentSearchEntry } from '@/hooks/use-listen-recent-searches';
import type { MezmurArtist } from '@/lib/mezmur';


function recentTimestamp(
  recents: ListenRecentSearchEntry[],
  kind: ListenRecentSearchEntry['kind'],
  match: (entry: ListenRecentSearchEntry) => boolean
): number {
  for (const entry of recents) {
    if (entry.kind !== kind) continue;
    if (!match(entry)) continue;
    return entry.searchedAt;
  }
  return 0;
}

/** Channels/playlists last opened appear first; unopened items sort alphabetically after. */
export function sortChannelsByRecentAccess(
  channels: MezmurArtist[],
  recents: ListenRecentSearchEntry[]
): MezmurArtist[] {
  return [...channels].sort((a, b) => {
    const ta = recentTimestamp(recents, 'channel', (e) => (e.channelName ?? e.title) === a.name);
    const tb = recentTimestamp(recents, 'channel', (e) => (e.channelName ?? e.title) === b.name);
    if (tb !== ta) return tb - ta;
    return a.name.localeCompare(b.name);
  });
}

export function sortPlaylistKeysByRecentAccess(
  keys: string[],
  recents: ListenRecentSearchEntry[],
  playlistArtist: string,
  keyForEntry: (albumKey: string) => string
): string[] {
  return [...keys].sort((a, b) => {
    const ta = recentTimestamp(recents, 'playlist', (e) => e.artist === playlistArtist && keyForEntry(e.album ?? e.title) === a);
    const tb = recentTimestamp(recents, 'playlist', (e) => e.artist === playlistArtist && keyForEntry(e.album ?? e.title) === b);
    if (tb !== ta) return tb - ta;
    return a.localeCompare(b);
  });
}
