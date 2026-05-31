import { getTrackPlayerModule } from './native-client';

const STUB_PROGRESS = { position: 0, duration: 0, buffered: 0 };
const STUB_STATE = { state: 'none' as const };

export function useProgress(updateInterval?: number) {
  const mod = getTrackPlayerModule();
  if (mod) {
    return mod.useProgress(updateInterval);
  }
  return STUB_PROGRESS;
}

export function usePlaybackState() {
  const mod = getTrackPlayerModule();
  if (mod) {
    return mod.usePlaybackState();
  }
  return STUB_STATE;
}

export function useActiveTrack() {
  const mod = getTrackPlayerModule();
  if (mod) {
    return mod.useActiveTrack();
  }
  return undefined;
}
