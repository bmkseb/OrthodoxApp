import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type TrackPlayerModule = typeof import('react-native-track-player');

let cached: TrackPlayerModule | null | undefined;

/** True on iOS/Android dev builds; false in Expo Go and on web. */
export function isTrackPlayerNativeAvailable(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

/** Lazy-load TrackPlayer so Expo Go never touches the missing native module. */
export function getTrackPlayerModule(): TrackPlayerModule | null {
  if (!isTrackPlayerNativeAvailable()) return null;
  if (cached !== undefined) return cached;
  try {
    cached = require('react-native-track-player') as TrackPlayerModule;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
