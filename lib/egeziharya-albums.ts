import {
  EGEZIHARYA_ORDERED_ALBUMS,
  EGEZIHARYA_TRACK_OVERRIDES,
  EGEZIHARYA_YILMA_CHANNEL,
  type EgeziharyaAlbumDef,
} from '@/data/egeziharyaAlbums';
import { englishTitleFromYouTube, songMatchesCanonicalTitle } from '@/lib/ahadu-albums';
import type { Mezmur } from '@/lib/mezmur';

function findTrackInPool(pool: Mezmur[], track: string): Mezmur | undefined {
  return pool.find((song) => songMatchesCanonicalTitle(song, track));
}

/** Prefer exact title match so "Hosanna" does not match longer titles on other albums. */
function findExactTrackInPool(pool: Mezmur[], track: string): Mezmur | undefined {
  const want = track.toLowerCase().trim();
  return pool.find((song) => englishTitleFromYouTube(song.title).toLowerCase().trim() === want);
}

export function isEgeziharyaYilmaChannel(artist: string): boolean {
  return artist === EGEZIHARYA_YILMA_CHANNEL;
}

function findOrderedAlbumDef(album: string): EgeziharyaAlbumDef | undefined {
  return EGEZIHARYA_ORDERED_ALBUMS.find((entry) => entry.album === album);
}

/** Songs for an Egeziharya album with a curated tracklist, in playlist order. */
export function pickSongsForEgeziharyaAlbum(songs: Mezmur[], album: string): Mezmur[] {
  const def = findOrderedAlbumDef(album);
  if (!def) return [];

  const channelSongs = songs.filter((s) => s.artist === EGEZIHARYA_YILMA_CHANNEL);
  const albumSongs = channelSongs.filter((s) => s.album === album);
  const overrides = EGEZIHARYA_TRACK_OVERRIDES[album] ?? {};
  const picked: Mezmur[] = [];

  for (const track of def.songs) {
    const overrideId = overrides[track];
    let match =
      (overrideId ? channelSongs.find((s) => s.videoId === overrideId) : undefined) ??
      findExactTrackInPool(albumSongs, track) ??
      findTrackInPool(albumSongs, track) ??
      findExactTrackInPool(channelSongs, track) ??
      findTrackInPool(channelSongs, track);

    if (match) picked.push({ ...match, album });
  }

  return picked;
}

export function hasEgeziharyaTrackOrder(album: string): boolean {
  return findOrderedAlbumDef(album) !== undefined;
}
