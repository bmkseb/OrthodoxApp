import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingMiniPlayer } from '@/components/audio/FloatingMiniPlayer';
import { FullScreenPlayer } from '@/components/audio/FullScreenPlayer';
import { YoutubePlayerHost } from '@/components/audio/youtube-player-host';
import { MezmurSongOptionsSheet } from '@/components/listen/mezmur-song-options-sheet';
import { useAudioPlayer } from '@/contexts/audio-player-context';

/** App-wide audio UI: persistent YouTube host, mini player, full-screen sheet. */
export function GlobalAudioChrome() {
  const {
    isFullPlayerOpen,
    currentTrack,
    addToPlaylistPicker,
    closeAddToPlaylistPicker,
    playPause,
    addToQueue,
  } = useAudioPlayer();

  const picker = addToPlaylistPicker;

  return (
    <View style={styles.host} pointerEvents="box-none">
      <YoutubePlayerHost />
      <FloatingMiniPlayer />
      {isFullPlayerOpen && currentTrack ? <FullScreenPlayer /> : null}
      {picker ? (
        <MezmurSongOptionsSheet
          visible
          title={picker.title}
          subtitle={picker.subtitle}
          thumbnailUrl={picker.thumbnailUrl ?? currentTrack?.artworkUri}
          videoId={picker.videoId}
          videoIdForPlaylist={picker.videoId}
          playlistKind={currentTrack?.saveKind ?? 'hymn'}
          startInPlaylistMode
          onClose={closeAddToPlaylistPicker}
          onPlayNow={() => {
            if (currentTrack?.videoId === picker.videoId) {
              playPause();
            }
          }}
          onAddToQueue={() => {
            if (currentTrack) addToQueue(currentTrack);
          }}
        />
      ) : null}
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
