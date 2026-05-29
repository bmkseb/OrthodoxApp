import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { SacredImagePlaceholder } from '@/components/sacred/sacred-image-placeholder';
import { ThemedText } from '@/components/themed-text';
import { EditorialMetaRow } from '@/components/ui/editorial-meta-row';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Opacity, Overlays, Palette, Spacing } from '@/constants/theme';

type LearnFeaturedHeroProps = {
  title: string;
  category: string;
  readMin: number;
  imageUri: string;
  onPress?: () => void;
  /**
   * Render a sacred gradient + motif placeholder instead of the network image.
   * Use this when no properly licensed Ethiopian Orthodox imagery is sourced yet.
   */
  placeholder?: 'liturgy' | 'trinity';
  style?: StyleProp<ViewStyle>;
};

export const LearnFeaturedHero = memo(function LearnFeaturedHero({
  title,
  category,
  readMin,
  imageUri,
  onPress,
  placeholder,
  style,
}: LearnFeaturedHeroProps) {
  return (
    <OrthodoxPressable style={[styles.wrap, style]} onPress={onPress} accessibilityRole="button">
      <LinearGradient
        colors={['rgba(201, 147, 58, 0.1)', 'transparent']}
        style={styles.halo}
        pointerEvents="none"
      />
      <View style={styles.card}>
        {placeholder ? (
          // TODO: Replace with properly licensed Ethiopian Orthodox imagery
          <SacredImagePlaceholder variant={placeholder} />
        ) : (
          <SacredImage uri={imageUri} style={styles.image} />
        )}
        <ParchmentGrainOverlay />
        <VignetteOverlay />
        <LinearGradient
          colors={[...Overlays.heroCinematic]}
          locations={[0, 0.5, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <EditorialMetaRow labels={[category, `${readMin} min`]} />
          <Text style={styles.cross}>☩</Text>
          <ThemedText style={styles.title} numberOfLines={3}>
            {title}
          </ThemedText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '18%' }]} />
        </View>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: { borderRadius: BorderRadius.lg },
  halo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg + 4,
    top: -4,
    bottom: -4,
    left: -4,
    right: -4,
    zIndex: -1,
  },
  card: {
    height: 220,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ManuscriptTokens.cardBorder,
    overflow: 'hidden',
    backgroundColor: ManuscriptTokens.cardWarmEnd,
  },
  image: { ...StyleSheet.absoluteFillObject, opacity: 0.92 },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md + 2,
    paddingBottom: Spacing.md + 4,
    paddingTop: Spacing.lg,
    zIndex: 2,
  },
  cross: {
    color: Palette.gold,
    fontSize: 14,
    opacity: 0.55,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.45,
    lineHeight: 32,
    maxWidth: '92%',
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
  },
});
