import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';

import {
  recordListeningProgress,
  type ListeningProgressEntry,
} from '@/hooks/use-listening-progress';
import type { TranslationKey } from '@/lib/translations';
import { fetchRandomMezmur, mezmurToAudioTrack } from '@/lib/mezmur';
import { shuffleQueueKeepingCurrent } from '@/lib/audio-utils';
import {
  useActiveTrack,
  usePlaybackState,
  useProgress as useTrackPlayerProgressHook,
} from '@/lib/track-player/hooks';
import { getTrackPlayerModule, isTrackPlayerNativeAvailable } from '@/lib/track-player/native-client';
import { setupTrackPlayer } from '@/lib/track-player/setup';
import { toTrackPlayerItem } from '@/lib/track-player/tracks';

export type AudioTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUri: string;
  url?: string;
  videoId?: string;
  album?: string;
  description?: string;
  category?: string;
  categoryLabel?: string;
  titleKey?: TranslationKey;
  artistKey?: TranslationKey;
  saveKind?: 'hymn' | 'sermon' | 'melody';
};

type YoutubeProgress = {
  position: number;
  duration: number;
  buffered: number;
};

type PlayTrackOptions = {
  autoPlay?: boolean;
  queue?: AudioTrack[];
  startSeconds?: number;
  openFullPlayer?: boolean;
};

type YoutubeBridge = {
  seekTo: (seconds: number) => void;
};

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  queueIndex: number;
  isShuffleEnabled: boolean;
  isPlaying: boolean;
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;
  isMiniPlayerVisible: boolean;
  expandProgress: SharedValue<number>;
  youtubeProgress: YoutubeProgress;
  youtubeStartSeconds: number;
  playTrack: (track: AudioTrack, options?: PlayTrackOptions) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  addToQueue: (track: AudioTrack, options?: { playNext?: boolean }) => void;
  removeFromQueue: (trackId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  playQueueItem: (index: number) => void;
  toggleShuffle: () => void;
  playPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (progress: number) => void;
  skipSeconds: (delta: number) => void;
  dismissMiniPlayer: () => void;
  registerYoutubeBridge: (bridge: YoutubeBridge | null) => void;
  reportYoutubeProgress: (position: number, duration: number) => void;
  handleYoutubeEnded: () => void;
  togglePlay: () => void;
  skipBack: () => void;
  skipForward: () => void;
};

const EXPAND_SPRING = { damping: 22, stiffness: 220, mass: 0.9 };
const HAS_TRACK_PLAYER = isTrackPlayerNativeAvailable();
const PROGRESS_SAVE_INTERVAL_SEC = 3;

function isYoutubeTrack(track: AudioTrack | null | undefined): boolean {
  return Boolean(track?.videoId);
}

function listeningProgressFromTrack(
  track: AudioTrack,
  positionSeconds?: number
): Omit<ListeningProgressEntry, 'updatedAt'> {
  return {
    videoId: track.videoId!,
    title: track.title,
    artist: track.artist,
    album: track.album ?? track.categoryLabel ?? '',
    thumbnailUrl: track.artworkUri,
    positionSeconds,
    kind: track.saveKind ?? 'hymn',
  };
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [nativePlayerReady, setNativePlayerReady] = useState(!HAS_TRACK_PLAYER);
  const [youtubeProgress, setYoutubeProgress] = useState<YoutubeProgress>({
    position: 0,
    duration: 0,
    buffered: 0,
  });
  const [youtubeStartSeconds, setYoutubeStartSeconds] = useState(0);

  const expandProgress = useSharedValue(0);
  const trackMetaRef = useRef<Map<string, AudioTrack>>(new Map());
  const queueOrderRef = useRef<string[]>([]);
  const canonicalOrderRef = useRef<string[]>([]);
  const isShuffleEnabledRef = useRef(false);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const isPlayingRef = useRef(false);
  const youtubeBridgeRef = useRef<YoutubeBridge | null>(null);
  const savedPositionsRef = useRef<Map<string, number>>(new Map());
  const lastSavedProgressRef = useRef(0);

  const isMiniPlayerVisible = currentTrack != null && !isFullPlayerOpen;

  const queueIndex = useMemo(() => {
    if (!currentTrack) return -1;
    return queue.findIndex((track) => track.id === currentTrack.id);
  }, [currentTrack, queue]);

  const syncQueueRefs = useCallback((tracks: AudioTrack[]) => {
    for (const item of tracks) {
      trackMetaRef.current.set(item.id, item);
    }
    queueOrderRef.current = tracks.map((item) => item.id);
  }, []);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isShuffleEnabledRef.current = isShuffleEnabled;
  }, [isShuffleEnabled]);

  const rebuildNativeQueue = useCallback(
    async (tracks: AudioTrack[], activeId: string | null, shouldPlay: boolean) => {
      if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;
      const mod = getTrackPlayerModule();
      if (!mod) return;
      const TrackPlayer = mod.default;
      const activeIndex = Math.max(0, tracks.findIndex((track) => track.id === activeId));

      await TrackPlayer.reset();
      if (tracks.length === 0) return;
      await TrackPlayer.add(tracks.map((item, i) => toTrackPlayerItem(item, i)));
      if (activeIndex > 0) await TrackPlayer.skip(activeIndex);
      if (shouldPlay) await TrackPlayer.play();
      else await TrackPlayer.pause();
    },
    [nativePlayerReady]
  );

  const applyDisplayQueue = useCallback(
    (canonicalTracks: AudioTrack[], options?: { keepCurrentId?: string | null; syncNative?: boolean }) => {
      canonicalOrderRef.current = canonicalTracks.map((item) => item.id);
      for (const item of canonicalTracks) {
        trackMetaRef.current.set(item.id, item);
      }

      const keepCurrentId = options?.keepCurrentId ?? currentTrackRef.current?.id ?? null;
      const displayTracks =
        isShuffleEnabledRef.current && canonicalTracks.length > 1
          ? shuffleQueueKeepingCurrent(canonicalTracks, keepCurrentId)
          : canonicalTracks;

      syncQueueRefs(displayTracks);
      setQueue(displayTracks);

      if (options?.syncNative && !isYoutubeTrack(currentTrackRef.current)) {
        void rebuildNativeQueue(displayTracks, keepCurrentId, isPlayingRef.current);
      }

      return displayTracks;
    },
    [rebuildNativeQueue, syncQueueRefs]
  );

  useEffect(() => {
    if (!HAS_TRACK_PLAYER) return;
    setupTrackPlayer()
      .then(() => setNativePlayerReady(true))
      .catch(() => setNativePlayerReady(false));
  }, []);

  useEffect(() => {
    if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;
    const mod = getTrackPlayerModule();
    if (!mod) return;

    const TrackPlayer = mod.default;
    const { Event, State } = mod;

    const sub = TrackPlayer.addEventListener(Event.PlaybackState, async () => {
      if (isYoutubeTrack(currentTrack)) return;
      const { state } = await TrackPlayer.getPlaybackState();
      setIsPlaying(state === State.Playing || state === State.Buffering);
    });

    return () => sub.remove();
  }, [nativePlayerReady, currentTrack]);

  const registerYoutubeBridge = useCallback((bridge: YoutubeBridge | null) => {
    youtubeBridgeRef.current = bridge;
  }, []);

  const reportYoutubeProgress = useCallback((position: number, duration: number) => {
    setYoutubeProgress((prev) => ({
      position: Number.isFinite(position) ? position : prev.position,
      duration: Number.isFinite(duration) && duration > 0 ? duration : prev.duration,
      buffered: 0,
    }));
    if (!currentTrack?.videoId) return;

    savedPositionsRef.current.set(currentTrack.videoId, position);
    if (Math.abs(position - lastSavedProgressRef.current) < PROGRESS_SAVE_INTERVAL_SEC) return;
    lastSavedProgressRef.current = position;

    void recordListeningProgress(listeningProgressFromTrack(currentTrack, position));
  }, [currentTrack]);

  const resolveStartSeconds = useCallback(async (_track: AudioTrack, explicit?: number) => {
    if (explicit != null) return Math.max(0, explicit);
    return 0;
  }, []);

  const beginYoutubePlayback = useCallback(
    (track: AudioTrack, autoPlay: boolean, startSeconds?: number) => {
      const sameVideo = currentTrack?.videoId === track.videoId && Boolean(track.videoId);

      setCurrentTrack(track);
      setIsPlaying(autoPlay);

      void (async () => {
        const seconds = await resolveStartSeconds(track, startSeconds);
        setYoutubeStartSeconds(seconds);
        setYoutubeProgress((prev) => ({ position: seconds, duration: prev.duration, buffered: 0 }));
        lastSavedProgressRef.current = seconds;

        if (sameVideo) {
          youtubeBridgeRef.current?.seekTo(seconds);
        }

        if (track.videoId) {
          savedPositionsRef.current.set(track.videoId, seconds);
        }

        void recordListeningProgress(listeningProgressFromTrack(track, seconds));
      })();

      if (HAS_TRACK_PLAYER && nativePlayerReady) {
        const mod = getTrackPlayerModule();
        if (mod) void mod.default.reset();
      }
    },
    [currentTrack, nativePlayerReady, resolveStartSeconds]
  );

  const playTrack = useCallback(
    (track: AudioTrack, options?: PlayTrackOptions) => {
      const autoPlay = options?.autoPlay ?? true;
      const incomingQueue = options?.queue?.length ? options.queue : [track];
      const index = Math.max(0, incomingQueue.findIndex((item) => item.id === track.id));
      const selected = incomingQueue[index] ?? track;

      applyDisplayQueue(incomingQueue, { keepCurrentId: selected.id });

      if (options?.openFullPlayer) {
        setIsFullPlayerOpen(true);
        expandProgress.value = withSpring(1, EXPAND_SPRING);
      }

      if (isYoutubeTrack(selected)) {
        beginYoutubePlayback(selected, autoPlay, options?.startSeconds);
        return;
      }

      setYoutubeStartSeconds(0);
      setYoutubeProgress({ position: 0, duration: 0, buffered: 0 });
      setCurrentTrack(selected);
      setIsPlaying(autoPlay);

      if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;

      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;

        await TrackPlayer.reset();
        const displayQueue = isShuffleEnabledRef.current && incomingQueue.length > 1
          ? shuffleQueueKeepingCurrent(incomingQueue, selected.id)
          : incomingQueue;
        await TrackPlayer.add(displayQueue.map((item, i) => toTrackPlayerItem(item, i)));
        const displayIndex = Math.max(0, displayQueue.findIndex((item) => item.id === selected.id));
        if (displayIndex > 0) await TrackPlayer.skip(displayIndex);
        if (autoPlay) await TrackPlayer.play();
        else await TrackPlayer.pause();
      })();
    },
    [applyDisplayQueue, beginYoutubePlayback, expandProgress, nativePlayerReady]
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

  const openQueue = useCallback(() => {
    setIsQueueOpen(true);

    void (async () => {
      const song = await fetchRandomMezmur();
      if (!song) return;

      setQueue((prev) => {
        if (prev.length > 0) return prev;

        const randomTrack = mezmurToAudioTrack(song);
        trackMetaRef.current.set(randomTrack.id, randomTrack);

        let next: AudioTrack[];
        if (currentTrack) {
          trackMetaRef.current.set(currentTrack.id, currentTrack);
          next =
            currentTrack.id === randomTrack.id ? [currentTrack] : [currentTrack, randomTrack];
        } else {
          next = [randomTrack];
        }

        canonicalOrderRef.current = next.map((item) => item.id);
        syncQueueRefs(next);
        return next;
      });
    })();
  }, [currentTrack, syncQueueRefs]);

  const toggleShuffle = useCallback(() => {
    const enabled = !isShuffleEnabledRef.current;
    isShuffleEnabledRef.current = enabled;
    setIsShuffleEnabled(enabled);

    const canonicalTracks = canonicalOrderRef.current
      .map((id) => trackMetaRef.current.get(id))
      .filter((track): track is AudioTrack => Boolean(track));

    applyDisplayQueue(canonicalTracks, {
      keepCurrentId: currentTrackRef.current?.id ?? null,
      syncNative: true,
    });
  }, [applyDisplayQueue]);

  const closeQueue = useCallback(() => {
    setIsQueueOpen(false);
  }, []);

  const playQueueItem = useCallback(
    (index: number) => {
      const track = queue[index];
      if (!track) return;

      if (isYoutubeTrack(track)) {
        beginYoutubePlayback(track, true);
        return;
      }

      if (!HAS_TRACK_PLAYER || !nativePlayerReady) {
        setCurrentTrack(track);
        setIsPlaying(true);
        return;
      }

      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;
        await TrackPlayer.skip(index);
        await TrackPlayer.play();
        setCurrentTrack(track);
        setIsPlaying(true);
      })();
    },
    [beginYoutubePlayback, nativePlayerReady, queue]
  );

  const addToQueue = useCallback(
    (track: AudioTrack, options?: { playNext?: boolean }) => {
      trackMetaRef.current.set(track.id, track);

      setQueue((prevQueue) => {
        const fromRef = canonicalOrderRef.current
          .map((id) => trackMetaRef.current.get(id))
          .filter((item): item is AudioTrack => Boolean(item));

        let base = fromRef.length > 0 ? fromRef : [...prevQueue];

        const playing = currentTrackRef.current;
        if (playing) {
          trackMetaRef.current.set(playing.id, playing);
          if (!base.some((item) => item.id === playing.id)) {
            base = [playing, ...base];
          }
        }

        for (const item of base) {
          trackMetaRef.current.set(item.id, item);
        }

        const withoutDup = base.filter((item) => item.id !== track.id);
        let nextCanonical: AudioTrack[];

        if (options?.playNext && playing) {
          const currentIdx = withoutDup.findIndex((item) => item.id === playing.id);
          if (currentIdx >= 0) {
            nextCanonical = [...withoutDup];
            nextCanonical.splice(currentIdx + 1, 0, track);
          } else {
            nextCanonical = [...withoutDup, track];
          }
        } else {
          nextCanonical = [...withoutDup, track];
        }

        canonicalOrderRef.current = nextCanonical.map((item) => item.id);

        const keepCurrentId = playing?.id ?? null;
        const displayTracks =
          isShuffleEnabledRef.current && nextCanonical.length > 1
            ? shuffleQueueKeepingCurrent(nextCanonical, keepCurrentId)
            : nextCanonical;

        syncQueueRefs(displayTracks);
        return displayTracks;
      });
    },
    [syncQueueRefs]
  );

  const removeFromQueue = useCallback(
    (trackId: string) => {
      const canonicalTracks = canonicalOrderRef.current
        .map((id) => trackMetaRef.current.get(id))
        .filter((item): item is AudioTrack => Boolean(item));

      const index = canonicalTracks.findIndex((item) => item.id === trackId);
      if (index < 0) return;

      const prevDisplayIndex = queueOrderRef.current.indexOf(trackId);
      const nextCanonical = canonicalTracks.filter((item) => item.id !== trackId);
      const displayQueue = applyDisplayQueue(nextCanonical, {
        keepCurrentId: currentTrack?.id === trackId ? null : currentTrack?.id ?? null,
      });

      if (currentTrack?.id === trackId) {
        const replacement =
          displayQueue[prevDisplayIndex] ??
          displayQueue[prevDisplayIndex - 1] ??
          displayQueue[0] ??
          null;

        if (replacement) {
          if (isYoutubeTrack(replacement)) {
            beginYoutubePlayback(replacement, isPlaying);
          } else {
            setCurrentTrack(replacement);
            void rebuildNativeQueue(displayQueue, replacement.id, isPlaying);
          }
        } else {
          closeFullPlayer();
          setIsPlaying(false);
          setCurrentTrack(null);
          setYoutubeStartSeconds(0);
          setYoutubeProgress({ position: 0, duration: 0, buffered: 0 });
          if (HAS_TRACK_PLAYER && nativePlayerReady) {
            const mod = getTrackPlayerModule();
            if (mod) void mod.default.reset();
          }
        }
      }
    },
    [
      applyDisplayQueue,
      beginYoutubePlayback,
      closeFullPlayer,
      currentTrack,
      isPlaying,
      nativePlayerReady,
      rebuildNativeQueue,
    ]
  );

  const reorderQueue = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

      setQueue((prev) => {
        if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        canonicalOrderRef.current = next.map((item) => item.id);
        syncQueueRefs(next);
        return next;
      });
    },
    [syncQueueRefs]
  );

  const playPause = useCallback(() => {
    if (isYoutubeTrack(currentTrack)) {
      setIsPlaying((playing) => !playing);
      return;
    }

    if (!HAS_TRACK_PLAYER || !nativePlayerReady) {
      setIsPlaying((playing) => !playing);
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
  }, [currentTrack, nativePlayerReady]);

  const dismissMiniPlayer = useCallback(() => {
    if (currentTrack?.videoId) {
      youtubeBridgeRef.current?.seekTo(0);
      savedPositionsRef.current.set(currentTrack.videoId, 0);
      void recordListeningProgress(listeningProgressFromTrack(currentTrack, 0));
    }

    closeFullPlayer();
    setIsPlaying(false);
    setCurrentTrack(null);
    setYoutubeStartSeconds(0);
    setYoutubeProgress({ position: 0, duration: 0, buffered: 0 });
    lastSavedProgressRef.current = 0;
    trackMetaRef.current.clear();
    queueOrderRef.current = [];
    canonicalOrderRef.current = [];
    setQueue([]);
    setIsShuffleEnabled(false);
    isShuffleEnabledRef.current = false;
    setIsQueueOpen(false);

    if (HAS_TRACK_PLAYER && nativePlayerReady) {
      const mod = getTrackPlayerModule();
      if (mod) void mod.default.reset();
    }
  }, [closeFullPlayer, currentTrack, nativePlayerReady]);

  const switchYoutubeTrack = useCallback(
    (track: AudioTrack) => {
      beginYoutubePlayback(track, true);
    },
    [beginYoutubePlayback]
  );

  const nextTrack = useCallback(() => {
    if (!isYoutubeTrack(currentTrack)) {
      if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;
      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;
        const activeIndex = await TrackPlayer.getActiveTrackIndex();
        const trackCount = (await TrackPlayer.getQueue()).length;

        if (trackCount <= 1) {
          await TrackPlayer.seekTo(0);
          await TrackPlayer.play();
          setIsPlaying(true);
          return;
        }

        if (activeIndex != null && activeIndex >= trackCount - 1) {
          await TrackPlayer.skip(0);
        } else {
          await TrackPlayer.skipToNext();
        }
        await TrackPlayer.play();
        setIsPlaying(true);
      })();
      return;
    }

    if (!currentTrack) return;

    const ids = queueOrderRef.current;
    const idx = ids.indexOf(currentTrack.id);
    if (idx < 0) return;

    if (ids.length <= 1) {
      youtubeBridgeRef.current?.seekTo(0);
      setIsPlaying(true);
      return;
    }

    const nextId = idx >= ids.length - 1 ? ids[0] : ids[idx + 1];
    const next = trackMetaRef.current.get(nextId);
    if (next) switchYoutubeTrack(next);
  }, [currentTrack, nativePlayerReady, switchYoutubeTrack]);

  const previousTrack = useCallback(() => {
    if (isYoutubeTrack(currentTrack)) {
      if (youtubeProgress.position > 3) {
        youtubeBridgeRef.current?.seekTo(0);
        reportYoutubeProgress(0, youtubeProgress.duration);
        return;
      }
      if (!currentTrack) return;

      const ids = queueOrderRef.current;
      const idx = ids.indexOf(currentTrack.id);
      if (idx <= 0) return;
      const prev = trackMetaRef.current.get(ids[idx - 1]);
      if (prev) switchYoutubeTrack(prev);
      return;
    }

    if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;
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
      await TrackPlayer.play();
      setIsPlaying(true);
    })();
  }, [currentTrack, nativePlayerReady, reportYoutubeProgress, switchYoutubeTrack, youtubeProgress.duration, youtubeProgress.position]);

  const handleYoutubeEnded = useCallback(() => {
    nextTrack();
  }, [nextTrack]);

  const seekTo = useCallback(
    (value: number) => {
      if (isYoutubeTrack(currentTrack)) {
        const total = youtubeProgress.duration;
        if (!Number.isFinite(total) || total <= 0) return;
        const seconds = Math.min(Math.max(value, 0), 1) * total;
        youtubeBridgeRef.current?.seekTo(seconds);
        reportYoutubeProgress(seconds, total);
        return;
      }

      if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;
      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;
        const total = await TrackPlayer.getDuration();
        if (!Number.isFinite(total) || total <= 0) return;
        await TrackPlayer.seekTo(Math.min(Math.max(value, 0), 1) * total);
      })();
    },
    [currentTrack, nativePlayerReady, reportYoutubeProgress, youtubeProgress.duration]
  );

  const skipSeconds = useCallback(
    (delta: number) => {
      if (isYoutubeTrack(currentTrack)) {
        const total = youtubeProgress.duration;
        const next = Math.min(Math.max(youtubeProgress.position + delta, 0), total || 0);
        youtubeBridgeRef.current?.seekTo(next);
        reportYoutubeProgress(next, total);
        return;
      }

      if (!HAS_TRACK_PLAYER || !nativePlayerReady) return;
      void (async () => {
        const mod = getTrackPlayerModule();
        if (!mod) return;
        const TrackPlayer = mod.default;
        const progress = await TrackPlayer.getProgress();
        const next = Math.min(Math.max(progress.position + delta, 0), progress.duration || 0);
        await TrackPlayer.seekTo(next);
      })();
    },
    [currentTrack, nativePlayerReady, reportYoutubeProgress, youtubeProgress.duration, youtubeProgress.position]
  );

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack,
      queue,
      queueIndex,
      isShuffleEnabled,
      isPlaying,
      isFullPlayerOpen,
      isQueueOpen,
      isMiniPlayerVisible,
      expandProgress,
      youtubeProgress,
      youtubeStartSeconds,
      playTrack,
      openFullPlayer,
      closeFullPlayer,
      openQueue,
      closeQueue,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      playQueueItem,
      toggleShuffle,
      playPause,
      nextTrack,
      previousTrack,
      seekTo,
      skipSeconds,
      dismissMiniPlayer,
      registerYoutubeBridge,
      reportYoutubeProgress,
      handleYoutubeEnded,
      togglePlay: playPause,
      skipBack: previousTrack,
      skipForward: nextTrack,
    }),
    [
      currentTrack,
      queue,
      queueIndex,
      isShuffleEnabled,
      isPlaying,
      isFullPlayerOpen,
      isQueueOpen,
      isMiniPlayerVisible,
      expandProgress,
      youtubeProgress,
      youtubeStartSeconds,
      playTrack,
      openFullPlayer,
      closeFullPlayer,
      openQueue,
      closeQueue,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      playQueueItem,
      toggleShuffle,
      playPause,
      nextTrack,
      previousTrack,
      seekTo,
      skipSeconds,
      dismissMiniPlayer,
      registerYoutubeBridge,
      reportYoutubeProgress,
      handleYoutubeEnded,
    ]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}

export function usePlayback() {
  return useAudioPlayer();
}

export type PlaybackTrack = AudioTrack;

export function usePlayerProgress(updateInterval?: number) {
  const { currentTrack, youtubeProgress } = useAudioPlayer();
  const nativeProgress = useTrackPlayerProgressHook(updateInterval);
  if (currentTrack?.videoId) return youtubeProgress;
  return nativeProgress;
}

export { useActiveTrack, usePlaybackState, useProgress } from '@/lib/track-player/hooks';
