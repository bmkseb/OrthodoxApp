import {
  MAHIBERE_KIDUSAN_CHANNEL,
  MAHIBERE_KIDUSAN_ORDERED_ALBUMS,
  type MahibereKidusanAlbumDef,
} from '@/data/mahibereKidusanAlbums';
import { songMatchesCanonicalTitle } from '@/lib/ahadu-albums';
import type { Mezmur } from '@/lib/mezmur';

function findOrderedAlbumDef(album: string): MahibereKidusanAlbumDef | undefined {
  return MAHIBERE_KIDUSAN_ORDERED_ALBUMS.find((entry) => entry.album === album);
}

export function isMahibereKidusanChannel(artist: string): boolean {
  return artist === MAHIBERE_KIDUSAN_CHANNEL;
}

/** Songs for a Mahibere Kidusan album in playlist order. */
export function pickSongsForMahibereKidusanAlbum(songs: Mezmur[], album: string): Mezmur[] {
  const def = findOrderedAlbumDef(album);
  if (!def) return [];

  const channelSongs = songs.filter((s) => s.artist === MAHIBERE_KIDUSAN_CHANNEL);
  const picked: Mezmur[] = [];

  for (const track of def.songs) {
    const match = channelSongs.find((song) => songMatchesCanonicalTitle(song, track));
    if (match) picked.push({ ...match, album });
  }

  return picked;
}

export function hasMahibereKidusanTrackOrder(album: string): boolean {
  return findOrderedAlbumDef(album) !== undefined;
}
