import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  runOnJS,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import type { TranslationKey } from '@/lib/translations';

export type AudioTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUri: string;
  category?: string;
  categoryLabel?: string;
  titleKey?: TranslationKey;
  artistKey?: TranslationKey;
};

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isFullPlayerOpen: boolean;
  isMiniPlayerVisible: boolean;
  expandProgress: SharedValue<number>;
  playTrack: (track: AudioTrack, options?: { autoPlay?: boolean; queue?: AudioTrack[] }) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  playPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (progress: number) => void;
  skipSeconds: (delta: number) => void;
  dismissMiniPlayer: () => void;
  /** @deprecated use playPause */
  togglePlay: () => void;
  /** @deprecated use playPause */
  skipBack: () => void;
  /** @deprecated use nextTrack */
  skipForward: () => void;
};

const EXPAND_SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.35);
  const [duration] = useState(225);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const expandProgress = useSharedValue(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const isMiniPlayerVisible = currentTrack != null && !isFullPlayerOpen;

  const applyTrack = useCallback((track: AudioTrack, autoPlay: boolean) => {
    setCurrentTrack(track);
    setIsPlaying(autoPlay);
    setProgress(0.08);
  }, []);

  const playTrack = useCallback(
    (track: AudioTrack, options?: { autoPlay?: boolean; queue?: AudioTrack[] }) => {
      const autoPlay = options?.autoPlay ?? true;
      const nextQueue = options?.queue?.length ? options.queue : [track];
      const index = Math.max(
        0,
        nextQueue.findIndex((item) => item.id === track.id)
      );
      setQueue(nextQueue);
      setQueueIndex(index);
      applyTrack(nextQueue[index] ?? track, autoPlay);
    },
    [applyTrack]
  );

  const openFullPlayer = useCallback(() => {
    if (!currentTrack) return;
    setIsFullPlayerOpen(true);
    expandProgress.value = withSpring(1, EXPAND_SPRING);
  }, [currentTrack, expandProgress]);

  const closeFullPlayer = useCallback(() => {
    setIsFullPlayerOpen(false);
    expandProgress.value = 0;
  }, [expandProgress]);

  const dismissMiniPlayer = useCallback(() => {
    closeFullPlayer();
    setIsPlaying(false);
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(0);
    setProgress(0);
  }, [closeFullPlayer]);

  const playPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const seekTo = useCallback((value: number) => {
    setProgress(Math.min(Math.max(value, 0), 1));
  }, []);

  const skipSeconds = useCallback(
    (delta: number) => {
      const next = progressRef.current + delta / duration;
      setProgress(Math.min(Math.max(next, 0), 1));
    },
    [duration]
  );

  const nextTrack = useCallback(() => {
    if (queue.length < 2) return;
    const nextIndex = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIndex);
    applyTrack(queue[nextIndex], true);
  }, [queue, queueIndex, applyTrack]);

  const previousTrack = useCallback(() => {
    if (progressRef.current > 0.05) {
      setProgress(0);
      return;
    }
    if (queue.length < 2) return;
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIndex);
    applyTrack(queue[prevIndex], true);
  }, [queue, queueIndex, applyTrack]);

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return p + 1 / duration / 10;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, duration]);

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      progress,
      duration,
      isFullPlayerOpen,
      isMiniPlayerVisible,
      expandProgress,
      playTrack,
      openFullPlayer,
      closeFullPlayer,
      dismissMiniPlayer,
      playPause,
      nextTrack,
      previousTrack,
      seekTo,
      skipSeconds,
      togglePlay: playPause,
      skipBack: previousTrack,
      skipForward: nextTrack,
    }),
    [
      currentTrack,
      isPlaying,
      progress,
      duration,
      isFullPlayerOpen,
      isMiniPlayerVisible,
      expandProgress,
      playTrack,
      openFullPlayer,
      closeFullPlayer,
      dismissMiniPlayer,
      playPause,
      nextTrack,
      previousTrack,
      seekTo,
      skipSeconds,
    ]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}

/** Back-compat alias */
export function usePlayback() {
  return useAudioPlayer();
}

export type PlaybackTrack = AudioTrack;
