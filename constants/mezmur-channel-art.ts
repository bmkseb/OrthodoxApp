import { Image, type ImageSourcePropType } from 'react-native';
import type { ImageContentFit, ImageContentPosition } from 'expo-image';

/** Bundled channel logos override YouTube video thumbnails where set. */
const CHANNEL_ART = {
  'Ahadu Studios': require('@/assets/images/ahadu-studios.png'),
  'Egeziharya Yilma': require('@/assets/images/egeziharya-yilma.png'),
  'Mezmur Debter Zetewahedo': require('@/assets/images/mezmur-debter-zetewahedo.png'),
  'Y.O.T.C. Choir': require('@/assets/images/yotc-choir.png'),
  'Mahibere Kidusan': require('@/assets/images/mahibere-kidusan.png'),
  'SPOT Church': require('@/assets/images/spot-church.png'),
  '21 MEDIA ሃያ አንድ ሚዲያ': require('@/assets/images/media-21.png'),
  'ዘኆኅተ ብርሃን ሚዲያ': require('@/assets/images/zehohite-birhan.png'),
} as const satisfies Record<string, number>;

const uriCache = new Map<string, string>();

/** Zoom bundled logos past the circle edge (cropped by overflow) to remove PNG padding / white gaps. */
export const DEFAULT_BUNDLED_CHANNEL_LOGO_ZOOM = 1.12;

export type BundledChannelLogoStyle = {
  zoom: number;
  contentFit: ImageContentFit;
  contentPosition: ImageContentPosition;
};

const DEFAULT_BUNDLED_CHANNEL_LOGO_STYLE: BundledChannelLogoStyle = {
  zoom: DEFAULT_BUNDLED_CHANNEL_LOGO_ZOOM,
  contentFit: 'cover',
  contentPosition: 'center',
};

/** Per-channel fit/zoom when artwork padding or aspect needs adjustment. */
const CHANNEL_LOGO_STYLE: Partial<Record<keyof typeof CHANNEL_ART, Partial<BundledChannelLogoStyle>>> = {
  /** Icon sits left in the file — contain + position keeps the figure centered in the ring. */
  'SPOT Church': {
    zoom: 0.9,
    contentFit: 'contain',
    contentPosition: { left: '38%', top: '48%' },
  },
  '21 MEDIA ሃያ አንድ ሚዲያ': { zoom: 1.02 },
  /** Circular logo on a square canvas — contain keeps it centered in the ring. */
  'Ahadu Studios': { zoom: 1.1, contentFit: 'contain' },
  'Egeziharya Yilma': { zoom: 1.14 },
  'Mezmur Debter Zetewahedo': { zoom: 1.16 },
  'Y.O.T.C. Choir': { zoom: 1.04 },
  'Mahibere Kidusan': { zoom: 1.12 },
  'ዘኆኅተ ብርሃን ሚዲያ': { zoom: 1.05, contentFit: 'contain' },
};

export function getMezmurChannelArtSource(channelName: string): number | undefined {
  return CHANNEL_ART[channelName as keyof typeof CHANNEL_ART];
}

export function getBundledChannelLogoZoom(channelName: string): number {
  return getBundledChannelLogoStyle(channelName).zoom;
}

export function getBundledChannelLogoStyle(channelName: string): BundledChannelLogoStyle {
  const key = channelName as keyof typeof CHANNEL_ART;
  const overrides = CHANNEL_LOGO_STYLE[key];
  return {
    zoom: overrides?.zoom ?? DEFAULT_BUNDLED_CHANNEL_LOGO_STYLE.zoom,
    contentFit: overrides?.contentFit ?? DEFAULT_BUNDLED_CHANNEL_LOGO_STYLE.contentFit,
    contentPosition: overrides?.contentPosition ?? DEFAULT_BUNDLED_CHANNEL_LOGO_STYLE.contentPosition,
  };
}

export function mezmurChannelImageSource(
  channelName: string,
  fallbackUri: string | null
): ImageSourcePropType | null {
  const bundled = getMezmurChannelArtSource(channelName);
  if (bundled) return bundled;
  const uri = resolveMezmurChannelThumbnail(channelName, fallbackUri);
  return uri ? { uri } : null;
}

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
