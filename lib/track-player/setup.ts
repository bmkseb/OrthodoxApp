import { getTrackPlayerModule } from './native-client';

let setupPromise: Promise<void> | null = null;

export async function setupTrackPlayer(): Promise<void> {
  const mod = getTrackPlayerModule();
  if (!mod) return;
  if (setupPromise) return setupPromise;

  const TrackPlayer = mod.default;
  const { Capability } = mod;

  setupPromise = (async () => {
    await TrackPlayer.setupPlayer({
      waitForBuffer: true,
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      progressUpdateEventInterval: 0.25,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
    });
  })();

  return setupPromise;
}

export function resetTrackPlayerSetup() {
  setupPromise = null;
}
