import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import type { ReadCoverFocus, ReadCoverSource, ReadCoverTone } from '@/constants/read-cover-art';

type PremiumBookCoverLayersProps = {
  source: ReadCoverSource;
  style?: StyleProp<ViewStyle>;
  /** Left spine width — matches bookshelf card proportions. */
  spineWidth?: number;
  recyclingKey?: string;
  /** `warm` — light wash for bright source art without heavy darkening. */
  tone?: ReadCoverTone;
  focus?: ReadCoverFocus;
};

function toImageSource(source: ReadCoverSource): ImageSource {
  return typeof source === 'string' ? { uri: source } : source;
}

/**
 * Photo book cover with espresso wash, vignette, spine, and gloss —
 * mutes vivid source art so every title reads as one premium shelf set.
 */
export const PremiumBookCoverLayers = memo(function PremiumBookCoverLayers({
  source,
  style,
  spineWidth = 6,
  recyclingKey,
  tone = 'default',
  focus,
}: PremiumBookCoverLayersProps) {
  const key = recyclingKey ?? (typeof source === 'string' ? source : 'bundled-cover');
  const warm = tone === 'warm';
  const zoom = focus?.scale ?? 1;

  const layers = useMemo(
    () =>
      StyleSheet.create({
        photo: {
          opacity: warm ? 0.93 : 0.95,
          ...(zoom > 1 ? { transform: [{ scale: zoom }] } : null),
        },
        warmWash: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: warm ? 'rgba(36, 28, 20, 0.22)' : 'rgba(36, 28, 20, 0.16)',
        },
        coolMute: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: warm ? 'rgba(18, 22, 28, 0.06)' : 'rgba(18, 22, 28, 0.04)',
        },
      }),
    [warm, zoom]
  );

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <Image
        source={toImageSource(source)}
        style={[StyleSheet.absoluteFill, layers.photo]}
        contentFit={focus?.contentFit ?? 'cover'}
        contentPosition={focus?.contentPosition ?? 'center'}
        cachePolicy="memory-disk"
        transition={180}
        recyclingKey={key}
      />

      <View style={layers.warmWash} pointerEvents="none" />
      <View style={layers.coolMute} pointerEvents="none" />

      <VignetteOverlay />

      <LinearGradient
        colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.14)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.spine, { width: spineWidth }]}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'transparent', 'rgba(255, 255, 255, 0.03)']}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)', 'transparent']}
        locations={[0, 0.22, 0.55]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
});
