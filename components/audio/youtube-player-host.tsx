import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import YoutubePlayer, { type YoutubeIframeRef } from 'react-native-youtube-iframe';

import { useAudioPlayer } from '@/contexts/audio-player-context';

/** Off-screen size — WebView needs real dimensions; must stay invisible. */
const HIDDEN_PLAYER_SIZE = 200;
const PROGRESS_INTERVAL_MS = 250;

/** Persistent hidden YouTube WebView for background mezmur playback. */
export function YoutubePlayerHost() {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const lastDurationRef = useRef(0);
  const pendingSeekRef = useRef(0);

  const [playerReady, setPlayerReady] = useState(false);

  const {
    currentTrack,
    isPlaying,
    youtubeStartSeconds,
    registerYoutubeBridge,
    reportYoutubeProgress,
    handleYoutubeEnded,
  } = useAudioPlayer();

  const videoId = currentTrack?.videoId ?? '';

  useEffect(() => {
    setPlayerReady(false);
    lastDurationRef.current = 0;
    pendingSeekRef.current = youtubeStartSeconds;
  }, [videoId, youtubeStartSeconds]);

  useEffect(() => {
    registerYoutubeBridge({
      seekTo: (seconds) => {
        playerRef.current?.seekTo(seconds, true);
      },
    });
    return () => registerYoutubeBridge(null);
  }, [registerYoutubeBridge]);

  const pollProgress = useCallback(async () => {
    const ref = playerRef.current;
    if (!ref) return;

    try {
      const position = await ref.getCurrentTime();
      let duration = await ref.getDuration();

      if (Number.isFinite(duration) && duration > 0) {
        lastDurationRef.current = duration;
      } else {
        duration = lastDurationRef.current;
      }

      if (Number.isFinite(position)) {
        reportYoutubeProgress(position, duration);
      }
    } catch {
      // Player not ready yet.
    }
  }, [reportYoutubeProgress]);

  useEffect(() => {
    if (!videoId || !playerReady) return;

    void pollProgress();
    const id = setInterval(() => void pollProgress(), PROGRESS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [videoId, playerReady, pollProgress]);

  const onReady = useCallback(() => {
    setPlayerReady(true);

    const ref = playerRef.current;
    if (!ref) return;

    const seconds = pendingSeekRef.current;
    pendingSeekRef.current = 0;

    ref.seekTo(seconds > 0 ? seconds : 0, true);
    void pollProgress();
  }, [pollProgress]);

  if (!videoId) return null;

  const startAt = Math.max(0, Math.floor(youtubeStartSeconds));

  return (
    <View style={styles.hidden} pointerEvents="none">
      <YoutubePlayer
        key={videoId}
        ref={playerRef}
        height={HIDDEN_PLAYER_SIZE}
        width={HIDDEN_PLAYER_SIZE}
        play={isPlaying}
        videoId={videoId}
        onReady={onReady}
        onChangeState={(state) => {
          if (state === 'ended') {
            handleYoutubeEnded();
            return;
          }
          if (state === 'playing' || state === 'paused' || state === 'buffering') {
            void pollProgress();
          }
        }}
        initialPlayerParams={{
          controls: 0,
          preventFullScreen: true,
          modestbranding: true,
          rel: false,
          start: startAt,
        }}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
        forceAndroidAutoplay={Platform.OS === 'android'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: HIDDEN_PLAYER_SIZE,
    height: HIDDEN_PLAYER_SIZE,
    opacity: 0,
    zIndex: -1,
    elevation: -1,
    overflow: 'hidden',
  },
});
