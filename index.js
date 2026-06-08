const Constants = require('expo-constants').default;
const { ExecutionEnvironment } = require('expo-constants');
const { Platform } = require('react-native');

if (
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
) {
  try {
    const TrackPlayer = require('react-native-track-player').default;
    TrackPlayer.registerPlaybackService(() => require('./lib/track-player/playback-service'));
  } catch {
    // Native module not linked yet (e.g. during prebuild).
  }
}

require('expo-router/entry');
