import { resolveMezmurAlbumThumbnail } from '@/constants/mezmur-album-art';
import { resolveMezmurChannelThumbnail } from '@/constants/mezmur-channel-art';
import {
  ZEHOHITE_BIRHAN_CHANNEL,
  ZEHOHITE_BIRHAN_PLAYLISTS,
} from '@/data/zehohiteBirhanCatalog';
import type { Mezmur, MezmurArtist, MezmurPlaylistCard } from '@/lib/mezmur';
import { youtubeListThumbnailUrl } from '@/lib/youtube-thumbnail';

const ALBUM_TRACK_ORDER = new Map(
  ZEHOHITE_BIRHAN_PLAYLISTS.map((playlist) => [
    playlist.album,
    playlist.tracks.map((track) => track.videoId),
  ])
);

export function isZehohiteBirhanChannel(artist: string): boolean {
  return artist === ZEHOHITE_BIRHAN_CHANNEL;
}

export function buildZehohiteBirhanMezmur(): Mezmur[] {
  const songs: Mezmur[] = [];
  for (const playlist of ZEHOHITE_BIRHAN_PLAYLISTS) {
    for (const track of playlist.tracks) {
      songs.push({
        videoId: track.videoId,
        title: track.title,
        artist: ZEHOHITE_BIRHAN_CHANNEL,
        album: playlist.album,
        thumbnailUrl: youtubeListThumbnailUrl(track.videoId, null),
        publishedAt: null,
        language: playlist.language,
        type: 'praise',
        description: null,
      });
    }
  }
  return songs;
}

export function pickSongsForZehohiteAlbum(songs: Mezmur[], album: string): Mezmur[] {
  const order = ALBUM_TRACK_ORDER.get(album);
  const albumSongs = songs.filter(
    (song) => isZehohiteBirhanChannel(song.artist) && song.album === album
  );
  if (!order?.length) return albumSongs;

  const byId = new Map(albumSongs.map((song) => [song.videoId, song]));
  return order
    .map((videoId) => byId.get(videoId))
    .filter((song): song is Mezmur => Boolean(song));
}

export function buildZehohiteBirhanPlaylistCards(): MezmurPlaylistCard[] {
  const songs = buildZehohiteBirhanMezmur();
  return ZEHOHITE_BIRHAN_PLAYLISTS.map((playlist) => {
    const albumSongs = songs.filter((song) => song.album === playlist.album);
    const thumb = albumSongs.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null;
    return {
      artist: ZEHOHITE_BIRHAN_CHANNEL,
      album: playlist.album,
      songCount: playlist.tracks.length,
      thumbnailUrl: resolveMezmurAlbumThumbnail(ZEHOHITE_BIRHAN_CHANNEL, playlist.album, thumb),
    };
  });
}

export function buildZehohiteBirhanArtist(): MezmurArtist {
  const songs = buildZehohiteBirhanMezmur();
  return {
    name: ZEHOHITE_BIRHAN_CHANNEL,
    albumCount: ZEHOHITE_BIRHAN_PLAYLISTS.length,
    songCount: songs.length,
    thumbnailUrl: resolveMezmurChannelThumbnail(
      ZEHOHITE_BIRHAN_CHANNEL,
      songs.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null
    ),
  };
}

export function buildZehohiteBirhanAlbums(): { name: string; songCount: number; thumbnailUrl: string | null }[] {
  return buildZehohiteBirhanPlaylistCards().map((card) => ({
    name: card.album,
    songCount: card.songCount,
    thumbnailUrl: card.thumbnailUrl,
  }));
}
