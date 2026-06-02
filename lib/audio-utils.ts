export function formatPlaybackTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Plain-text payload for the system share sheet. */
export function buildAudioTrackShareMessage(track: {
  title: string;
  artist?: string;
  album?: string;
  videoId?: string;
  url?: string;
}): string {
  const lines: string[] = [];
  const artist = track.artist?.trim();
  lines.push(artist ? `${track.title} — ${artist}` : track.title);
  if (track.album?.trim()) lines.push(track.album.trim());
  if (track.videoId) {
    lines.push(youtubeWatchUrl(track.videoId));
  } else if (track.url?.trim()) {
    lines.push(track.url.trim());
  }
  return lines.join('\n');
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffle playlist order while keeping the current track first. */
export function shuffleQueueKeepingCurrent<T extends { id: string }>(
  tracks: T[],
  currentId: string | null | undefined
): T[] {
  if (tracks.length <= 1) return tracks;
  const current = currentId ? tracks.find((track) => track.id === currentId) : null;
  const rest = current ? tracks.filter((track) => track.id !== currentId) : tracks;
  const shuffledRest = shuffleArray(rest);
  return current ? [current, ...shuffledRest] : shuffleArray(tracks);
}
