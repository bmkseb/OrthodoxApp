import type { UserPlaylist } from '@/hooks/use-user-playlists';

import { fetchAllMezmur, type Mezmur, type MezmurPlaylistCard } from '@/lib/mezmur';



export async function resolveUserPlaylistSongs(playlist: UserPlaylist): Promise<Mezmur[]> {

  const catalog = await fetchAllMezmur();

  const byId = new Map(catalog.map((song) => [song.videoId, song]));

  return playlist.videoIds

    .map((id) => byId.get(id))

    .filter((song): song is Mezmur => Boolean(song));

}



/** Custom cover only; null shows the default music-note placeholder. */
export function userPlaylistThumbnail(playlist: UserPlaylist): string | null {
  const cover = playlist.coverImageUri?.trim();
  return cover ? cover : null;
}



export function userPlaylistToCard(

  playlist: UserPlaylist,

  songs: Mezmur[]

): MezmurPlaylistCard {

  return {

    artist: 'My Playlists',

    album: playlist.id,

    songCount: playlist.videoIds.length,

    thumbnailUrl: userPlaylistThumbnail(playlist),

  };

}

