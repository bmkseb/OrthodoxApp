import { resolveMezmurChannelThumbnail } from '@/constants/mezmur-channel-art';
import { MEDIA_21_CHANNEL, MEDIA_21_TRACKS } from '@/data/media21Catalog';
import type { Mezmur, MezmurArtist } from '@/lib/mezmur';
import { youtubeListThumbnailUrl } from '@/lib/youtube-thumbnail';

export function isMedia21Channel(artist: string): boolean {
  return artist === MEDIA_21_CHANNEL;
}

export function buildMedia21Mezmur(): Mezmur[] {
  return MEDIA_21_TRACKS.map((track) => ({
    videoId: track.videoId,
    title: track.title,
    artist: MEDIA_21_CHANNEL,
    album: '',
    thumbnailUrl: youtubeListThumbnailUrl(track.videoId, null),
    publishedAt: null,
    language: 'amharic',
    type: 'other',
    description: null,
  }));
}

export function buildMedia21Artist(): MezmurArtist {
  const songs = buildMedia21Mezmur();
  return {
    name: MEDIA_21_CHANNEL,
    albumCount: 0,
    songCount: songs.length,
    thumbnailUrl: resolveMezmurChannelThumbnail(
      MEDIA_21_CHANNEL,
      songs.find((song) => song.thumbnailUrl)?.thumbnailUrl ?? null
    ),
  };
}
