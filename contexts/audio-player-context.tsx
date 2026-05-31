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
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import type { TranslationKey } from '@/lib/translations';
import { getTrackPlayerModule, isTrackPlayerNativeAvailable } from '@/lib/track-player/native-client';
import { setupTrackPlayer } from '@/lib/track-player/setup';
import { toTrackPlayerItem } from '@/lib/track-player/tracks';

export type AudioTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUri: string;
  /** Remote or local audio URL. Falls back to demo streams when omitted. */
  url?: string;
  /** YouTube video ID — uses embedded player instead of TrackPlayer. */
  videoId?: string;
  album?: string;
  category?: string;
  categoryLabel?: string;
  titleKey?: TranslationKey;
  artistKey?: TranslationKey;
};

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
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
  /** Sync play state from embedded YouTube player UI. */
  syncPlayingState: (playing: boolean) => void;
  /** @deprecated use playPause */
  togglePlay: () => void;
  /** @deprecated use playPause */
  skipBack: () => void;
  /** @deprecated use nextTrack */
  skipForward: () => void;
};

const EXPAND_SPRING = { damping: 22, stiffness: 220, mass: 0.9 };
const HAS_TRACK_PLAYER = isTrackPlayerNativeAvailable();

function isYoutubeTrack(track: AudioTrack | null | undefined): boolean {
  return Boolean(track?.videoId);
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [playerReady, setPlayerReady] = useState(!HAS_TRACK_PLAYER);

  const expandProgress = useSharedValue(0);
  const trackMetaRef = useRef<Map<string, AudioTrack>>(new Map());
  const queueOrderRef = useRef<string[]>([]);

  const isMiniPlayerVisible = currentTrack != null && !isFullPlayerOpen;

  useEffect(() => {
    if (!HAS_TRACK_PLAYER) return;
    setupTrackPlayer()
      .then(() => setPlayerReady(true))
      .catch(() => setPlayerReady(false));
  }, []);

  useEffect(() => {
    if (!HAS_TRACK_PLAYER || !playerReady) return;
    const mod = getTrackPlayerModule();
    if (!mod) return;

    const TrackPlayer = mod.default;
    const { Event, State } = mod;

    const sub = TrackPlayer.addEventListener(Event.PlaybackState, async () => {
      const { state } = await TrackPlayer.getPlaybackState();
      setIsPlaying(state === State.Playing || state === State.Buffering);
    });

    return () => {
      sub.remove();
    };
  }, [playerReady]);

  const syncActiveTrack = useCallback(async () => {
    if (!HAS_TRACK_PLAYER || !playerReady) return;
    const mod = getTrackPlayerModule();
    if (!mod) return;

    const TrackPlayer = mod.default;
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index == null || index < 0) {
      setCurrentTrack(null);
      return;
    }
    const active = await TrackPlayer.getActiveTrack();
    if (!active?.id) {
      setCurrentTrack(null);
      return;
    }
    const meta = trackMetaRef.current.get(String(active.id));
    if (meta) {
      setCurrentTrack(meta);
      return;
    }
    setCurrentTrack({
      id: String(active.id),
      title: active.title ?? 'Unknown',
      artist: active.artist ?? '',
      artworkUri: typeof active.artwork === 'string' ? active.artwork : '',
    });
  }, [playerReady]);

  const playTrack = useCallback(
    (track: AudioTrack, options?: { autoPlay?: boolean; queue?: AudioTrack[] }) => {
      const autoPlay = options?.autoPlay ?? true;
      const nextQueue = options?.queue?.length ? options.queue : [track];
      const index = Math.max(0, nextQueue.findIndex((item) => item.id === track.id));

      for (const item of nextQueue) {
        trackMetaRef.current.set(item.id, item);
      }
      queueOrderRef.current = nextQueue.map((item) => item.id);

      const selected = nextQueue[index] ?? track;
      setCurrentTrack(selected);
      setIsPlaying(autoPlay);

      if (isYoutubeTrack(selected)) {
        if (HAS_TRACK_PLAYER && playerReady) {
          const mod = getTrackPlayerModule();
          if (mod) void mod.default.reset();
        }
        return;
      }

      if (!HAS_TRACK_PLAYER || !playerReady) return;

      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;

        await TrackPlayer.reset();
        await TrackPlayer.add(nextQueue.map((item, i) => toTrackPlayerItem(item, i)));
        if (index > 0) await TrackPlayer.skip(index);
        if (autoPlay) await TrackPlayer.play();
        else await TrackPlayer.pause();
        await syncActiveTrack();
      })();
    },
    [playerReady, syncActiveTrack]
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
    trackMetaRef.current.clear();
    queueOrderRef.current = [];
    if (HAS_TRACK_PLAYER && playerReady) {
      const mod = getTrackPlayerModule();
      if (mod) void mod.default.reset();
    }
  }, [closeFullPlayer, playerReady]);

  const syncPlayingState = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const playPause = useCallback(() => {
    if (isYoutubeTrack(currentTrack)) {
      setIsPlaying((p) => !p);
      return;
    }
    if (!HAS_TRACK_PLAYER || !playerReady) {
      setIsPlaying((p) => !p);
      return;
    }
    void (async () => {
      const mod = getTrackPlayerModule();
      if (!mod) return;
      const TrackPlayer = mod.default;
      const { State } = mod;

      const { state } = await TrackPlayer.getPlaybackState();
      if (state === State.Playing || state === State.Buffering) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    })();
  }, [currentTrack, playerReady]);

  const seekTo = useCallback(
    (value: number) => {
      if (isYoutubeTrack(currentTrack)) return;
      if (!HAS_TRACK_PLAYER || !playerReady) return;
      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;

        const duration = await TrackPlayer.getDuration();
        if (!Number.isFinite(duration) || duration <= 0) return;
        const clamped = Math.min(Math.max(value, 0), 1);
        await TrackPlayer.seekTo(clamped * duration);
      })();
    },
    [currentTrack, playerReady]
  );

  const skipSeconds = useCallback(
    (delta: number) => {
      if (isYoutubeTrack(currentTrack)) return;
      if (!HAS_TRACK_PLAYER || !playerReady) return;
      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;

        const progress = await TrackPlayer.getProgress();
        const next = Math.min(Math.max(progress.position + delta, 0), progress.duration || 0);
        await TrackPlayer.seekTo(next);
      })();
    },
    [currentTrack, playerReady]
  );

  const nextTrack = useCallback(() => {
    if (isYoutubeTrack(currentTrack)) {
      const ids = queueOrderRef.current;
      const idx = currentTrack ? ids.indexOf(currentTrack.id) : -1;
      if (idx < 0 || idx >= ids.length - 1) return;
      const next = trackMetaRef.current.get(ids[idx + 1]);
      if (!next) return;
      setCurrentTrack(next);
      setIsPlaying(true);
      return;
    }
    if (!HAS_TRACK_PLAYER || !playerReady) return;
    void (async () => {
      const mod = getTrackPlayerModule();
      if (!mod) return;
      const TrackPlayer = mod.default;

      await TrackPlayer.skipToNext();
      await syncActiveTrack();
      await TrackPlayer.play();
      setIsPlaying(true);
    })();
  }, [currentTrack, playerReady, syncActiveTrack]);

  const previousTrack = useCallback(() => {
    if (isYoutubeTrack(currentTrack)) {
      const ids = queueOrderRef.current;
      const idx = currentTrack ? ids.indexOf(currentTrack.id) : -1;
      if (idx <= 0) return;
      const prev = trackMetaRef.current.get(ids[idx - 1]);
      if (!prev) return;
      setCurrentTrack(prev);
      setIsPlaying(true);
      return;
    }
    if (!HAS_TRACK_PLAYER || !playerReady) return;
    void (async () => {
      const mod = getTrackPlayerModule();
      if (!mod) return;
      const TrackPlayer = mod.default;

      const progress = await TrackPlayer.getProgress();
      if (progress.position > 3) {
        await TrackPlayer.seekTo(0);
        return;
      }
      await TrackPlayer.skipToPrevious();
      await syncActiveTrack();
      await TrackPlayer.play();
      setIsPlaying(true);
    })();
  }, [currentTrack, playerReady, syncActiveTrack]);

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
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
      syncPlayingState,
      togglePlay: playPause,
      skipBack: previousTrack,
      skipForward: nextTrack,
    }),
    [
      currentTrack,
      isPlaying,
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
      syncPlayingState,
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

/** Re-export TrackPlayer hooks for UI components (scrubber, play state, metadata). */
export { useActiveTrack, usePlaybackState, useProgress } from '@/lib/track-player/hooks';
