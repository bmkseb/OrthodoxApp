import type { UserPlaylist } from '@/hooks/use-user-playlists';
import { userPlaylistArtistForKind } from '@/data/userPlaylists';
import { fetchAllMezmur, type Mezmur, type MezmurPlaylistCard } from '@/lib/mezmur';
import { youtubeListThumbnailUrl } from '@/lib/youtube-thumbnail';

const COLLAGE_SLOT_COUNT = 4;



export async function resolveUserPlaylistSongs(playlist: UserPlaylist): Promise<Mezmur[]> {

  const catalog = await fetchAllMezmur();

  const byId = new Map(catalog.map((song) => [song.videoId, song]));

  return playlist.videoIds

    .map((id) => byId.get(id))

    .filter((song): song is Mezmur => Boolean(song));

}



/** Custom cover only; null means use the automatic thumbnail collage. */
export function userPlaylistCoverUri(playlist: UserPlaylist): string | null {
  const cover = playlist.coverImageUri?.trim();
  return cover ? cover : null;
}

/** @deprecated Use userPlaylistCoverUri — kept for call sites that expect a single URI. */
export function userPlaylistThumbnail(playlist: UserPlaylist): string | null {
  return userPlaylistCoverUri(playlist);
}

/** Up to four YouTube list thumbnails from the playlist's videos (playlist order). */
export function userPlaylistCollageUris(playlist: UserPlaylist): string[] {
  const uris: string[] = [];
  const seen = new Set<string>();
  for (const rawId of playlist.videoIds) {
    const id = rawId.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    uris.push(youtubeListThumbnailUrl(id, null));
    if (uris.length >= COLLAGE_SLOT_COUNT) break;
  }
  return uris;
}



export function userPlaylistToCard(

  playlist: UserPlaylist,

  songs: Mezmur[]

): MezmurPlaylistCard {

  return {

    artist: userPlaylistArtistForKind(playlist.kind),

    album: playlist.id,

    songCount: playlist.videoIds.length,

    thumbnailUrl: userPlaylistThumbnail(playlist),

  };

}

