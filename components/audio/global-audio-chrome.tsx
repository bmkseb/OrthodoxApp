import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingMiniPlayer } from '@/components/audio/FloatingMiniPlayer';
import { FullScreenPlayer } from '@/components/audio/FullScreenPlayer';
import { YoutubePlayerHost } from '@/components/audio/youtube-player-host';
import { useAudioPlayer } from '@/contexts/audio-player-context';

/** App-wide audio UI: persistent YouTube host, mini player, full-screen sheet. */
export function GlobalAudioChrome() {
  const { isFullPlayerOpen, currentTrack } = useAudioPlayer();

  return (
    <View style={styles.host} pointerEvents="box-none">
      <YoutubePlayerHost />
      <FloatingMiniPlayer />
      {isFullPlayerOpen && currentTrack ? <FullScreenPlayer /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1100,
    elevation: 1100,
  },
});
