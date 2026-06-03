import { resolveMezmurAlbumThumbnail } from '@/constants/mezmur-album-art';
import { resolveMezmurChannelThumbnail } from '@/constants/mezmur-channel-art';
import {
  SPOT_CHURCH_CHANNEL,
  SPOT_CHURCH_PLAYLISTS,
} from '@/data/spotChurchCatalog';
import type { Mezmur, MezmurArtist, MezmurPlaylistCard } from '@/lib/mezmur';
import { youtubeListThumbnailUrl } from '@/lib/youtube-thumbnail';

const ALBUM_TRACK_ORDER = new Map(
  SPOT_CHURCH_PLAYLISTS.map((playlist) => [
    playlist.album,
    playlist.tracks.map((track) => track.videoId),
  ])
);

export function isSpotChurchChannel(artist: string): boolean {
  return artist === SPOT_CHURCH_CHANNEL;
}

export function buildSpotChurchMezmur(): Mezmur[] {
  const songs: Mezmur[] = [];
  for (const playlist of SPOT_CHURCH_PLAYLISTS) {
    for (const track of playlist.tracks) {
      songs.push({
        videoId: track.videoId,
        title: track.title,
        artist: SPOT_CHURCH_CHANNEL,
        album: playlist.album,
        thumbnailUrl: youtubeListThumbnailUrl(track.videoId, null),
        publishedAt: null,
        language: 'english',
        type: 'sermon',
        description: null,
      });
    }
  }
  return songs;
}

export function pickSongsForSpotAlbum(songs: Mezmur[], album: string): Mezmur[] {
  const order = ALBUM_TRACK_ORDER.get(album);
  const albumSongs = songs.filter(
    (song) => isSpotChurchChannel(song.artist) && song.album === album
  );
  if (!order?.length) return albumSongs;

  const byId = new Map(albumSongs.map((song) => [song.videoId, song]));
  return order
    .map((videoId) => byId.get(videoId))
    .filter((song): song is Mezmur => Boolean(song));
}

export function buildSpotChurchPlaylistCards(): MezmurPlaylistCard[] {
  const songs = buildSpotChurchMezmur();
  return SPOT_CHURCH_PLAYLISTS.map((playlist) => {
    const albumSongs = songs.filter((song) => song.album === playlist.album);
    const thumb = albumSongs.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null;
    return {
      artist: SPOT_CHURCH_CHANNEL,
      album: playlist.album,
      songCount: playlist.tracks.length,
      thumbnailUrl: resolveMezmurAlbumThumbnail(SPOT_CHURCH_CHANNEL, playlist.album, thumb),
    };
  });
}

export function buildSpotChurchArtist(): MezmurArtist {
  const songs = buildSpotChurchMezmur();
  return {
    name: SPOT_CHURCH_CHANNEL,
    albumCount: SPOT_CHURCH_PLAYLISTS.length,
    songCount: songs.length,
    thumbnailUrl: resolveMezmurChannelThumbnail(
      SPOT_CHURCH_CHANNEL,
      songs.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null
    ),
  };
}

export function buildSpotChurchAlbums(): { name: string; songCount: number; thumbnailUrl: string | null }[] {
  return buildSpotChurchPlaylistCards().map((card) => ({
    name: card.album,
    songCount: card.songCount,
    thumbnailUrl: card.thumbnailUrl,
  }));
}
