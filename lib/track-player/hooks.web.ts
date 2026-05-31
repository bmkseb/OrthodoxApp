/** Web stub — TrackPlayer is native-only. */
export function useProgress(_updateInterval?: number) {
  return { position: 0, duration: 0, buffered: 0 };
}

export function usePlaybackState() {
  return { state: 'none' as const };
}

export function useActiveTrack() {
  return undefined;
}
