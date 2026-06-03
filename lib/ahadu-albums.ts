import {
  AHADU_ALBUMS,
  AHADU_TRACK_PINNED,
  AHADU_STUDIOS_CHANNEL,
  AHADU_TITLE_ALIASES,
  type AhaduAlbumDef,
} from '@/data/ahaduAlbums';
import { resolveMezmurAlbumThumbnail } from '@/constants/mezmur-album-art';
import type { Mezmur, MezmurAlbum, MezmurPlaylistCard } from '@/lib/mezmur';

function normTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s*\(instrumental\)\s*/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function englishTitleFromYouTube(title: string): string {
  return (title.split('||')[0] ?? title).replace(/\s*\(instrumental\)\s*/gi, '').trim();
}

export function titleVariants(canonical: string): string[] {
  const aliases = AHADU_TITLE_ALIASES[canonical] ?? [];
  return [canonical, ...aliases];
}

function isNumberedReleaseTitle(title: string): boolean {
  return /\(volume\s+/i.test(title) || /\bvol\.?\s*\d/i.test(title);
}

export function songMatchesCanonicalTitle(song: Mezmur, canonical: string): boolean {
  const songNorm = normTitle(englishTitleFromYouTube(song.title));
  if (songNorm.length < 3) return false;
  for (const variant of titleVariants(canonical)) {
    const variantNorm = normTitle(variant);
    if (variantNorm.length < 3) continue;
    if (songNorm === variantNorm) return true;
    if (isNumberedReleaseTitle(canonical) || isNumberedReleaseTitle(variant)) continue;
    if (songNorm.startsWith(`${variantNorm} `) || variantNorm.startsWith(`${songNorm} `)) return true;
  }
  return false;
}

function findExactTrack(pool: Mezmur[], track: string): Mezmur | undefined {
  const want = track.toLowerCase().trim();
  return pool.find((song) => englishTitleFromYouTube(song.title).toLowerCase().trim() === want);
}

export function isAhaduStudiosChannel(artist: string): boolean {
  return artist === AHADU_STUDIOS_CHANNEL;
}

export function findAhaduAlbumDef(album: string): AhaduAlbumDef | undefined {
  return AHADU_ALBUMS.find((entry) => entry.album === album);
}

/** Songs for a curated Ahadu album, in tracklist order. */
export function pickSongsForAhaduAlbum(songs: Mezmur[], album: string): Mezmur[] {
  const def = findAhaduAlbumDef(album);
  if (!def) return [];

  const ahadu = songs.filter((s) => s.artist === AHADU_STUDIOS_CHANNEL);
  const albumSongs = ahadu.filter((s) => s.album === album);
  const picked: Mezmur[] = [];

  for (const track of def.songs) {
    const pinnedVideoId = AHADU_TRACK_PINNED[track];
    let match =
      (pinnedVideoId ? ahadu.find((s) => s.videoId === pinnedVideoId) : undefined) ??
      findExactTrack(albumSongs, track) ??
      albumSongs.find((song) => songMatchesCanonicalTitle(song, track)) ??
      findExactTrack(ahadu, track) ??
      ahadu.find((song) => songMatchesCanonicalTitle(song, track));

    if (match) picked.push({ ...match, album });
  }

  return picked;
}

export function buildAhaduAlbumCards(songs: Mezmur[]): MezmurAlbum[] {
  return AHADU_ALBUMS.map((def) => {
    const albumSongs = pickSongsForAhaduAlbum(songs, def.album);
    const videoThumb = albumSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null;
    return {
      name: def.album,
      songCount: albumSongs.length,
      thumbnailUrl: resolveMezmurAlbumThumbnail(AHADU_STUDIOS_CHANNEL, def.album, videoThumb),
    };
  }).filter((card) => card.songCount > 0);
}

export function buildAhaduPlaylistCards(songs: Mezmur[]): MezmurPlaylistCard[] {
  return buildAhaduAlbumCards(songs).map((card) => ({
    artist: AHADU_STUDIOS_CHANNEL,
    album: card.name,
    songCount: card.songCount,
    thumbnailUrl: card.thumbnailUrl,
  }));
}
