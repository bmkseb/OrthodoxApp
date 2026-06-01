import { Image } from 'react-native';

/** Bundled channel logos override YouTube video thumbnails where set. */
const CHANNEL_ART = {
  'Ahadu Studios': require('@/assets/images/ahadu-studios.png'),
} as const satisfies Record<string, number>;

const uriCache = new Map<string, string>();

export function resolveMezmurChannelThumbnail(
  channelName: string,
  fallback: string | null
): string | null {
  const local = CHANNEL_ART[channelName as keyof typeof CHANNEL_ART];
  if (!local) return fallback;

  let uri = uriCache.get(channelName);
  if (!uri) {
    uri = Image.resolveAssetSource(local).uri;
    uriCache.set(channelName, uri);
  }
  return uri;
}
