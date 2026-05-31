export type TrackPlayerSource = {
  id: string;
  title: string;
  artist: string;
  artworkUri: string;
  url?: string;
};

/** Demo streams until Supabase / CDN audio URLs are wired. */
const DEMO_STREAMS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
];

export function resolveTrackStreamUrl(track: TrackPlayerSource, index = 0): string {
  if (track.url?.trim()) return track.url.trim();
  const hash = track.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return DEMO_STREAMS[(hash + index) % DEMO_STREAMS.length];
}

export function toTrackPlayerItem(track: TrackPlayerSource, index = 0) {
  return {
    id: track.id,
    url: resolveTrackStreamUrl(track, index),
    title: track.title,
    artist: track.artist,
    artwork: track.artworkUri,
  };
}
