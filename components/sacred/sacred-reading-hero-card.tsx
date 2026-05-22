import React, { memo } from 'react';
import { Dimensions, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { GeometricWatermark } from '@/components/sacred/geometric-watermark';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Opacity, Palette, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SacredReadingHeroCardProps = {
  title: string;
  metadata?: string;
  imageUri: string;
  progress?: number;
  compact?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const SacredReadingHeroCard = memo(function SacredReadingHeroCard({
  title,
  metadata,
  imageUri,
  progress = 0,
  compact = false,
  onPress,
  style,
}: SacredReadingHeroCardProps) {
  const cardWidth = compact ? SCREEN_WIDTH * 0.72 : SCREEN_WIDTH - Layout.pagePadding * 2;
  const cardHeight = compact ? 160 : 220;

  return (
    <OrthodoxPressable
      style={[styles.wrap, { width: cardWidth, marginRight: compact ? Spacing.md : 0 }, style]}
      onPress={onPress}
      accessibilityRole="button">
      <View style={[styles.card, { height: cardHeight }]}>
        <SacredImage source={{ uri: imageUri }} style={[styles.image, { opacity: ManuscriptTokens.imageSoftening }]} />
        <View style={styles.parchmentWash} />
        <ParchmentGrainOverlay />
        <VignetteOverlay intensity={Opacity.vignette + 0.05} />
        <ManuscriptCornerFrame />

        <LinearGradient
          colors={['transparent', 'rgba(20, 18, 16, 0.55)', 'rgba(0, 0, 0, 0.92)']}
          locations={[0.2, 0.55, 1]}
          style={styles.bottomGradient}
        />

        <View style={styles.content}>
          <GeometricWatermark style={styles.watermark} size={compact ? 40 : 52} />
          {metadata ? (
            <ThemedText type="muted" style={styles.metadata}>
              {metadata}
            </ThemedText>
          ) : null}
          <View style={styles.titleRow}>
            <Text style={styles.cross}>☩</Text>
            <ThemedText style={[styles.title, compact && styles.titleCompact]} numberOfLines={compact ? 2 : 3}>
              {title}
            </ThemedText>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
        </View>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
    shadowColor: ManuscriptTokens.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: ManuscriptTokens.shadowOpacity,
    shadowRadius: 14,
    elevation: 5,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ManuscriptTokens.cardBorder,
    overflow: 'hidden',
    backgroundColor: ManuscriptTokens.cardWarmEnd,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  parchmentWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ManuscriptTokens.parchmentWash,
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg + 6,
    paddingTop: Spacing.xl,
  },
  watermark: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.xl + 8,
  },
  metadata: {
    fontSize: 12,
    marginBottom: Spacing.sm,
    color: ManuscriptTokens.parchmentMuted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cross: {
    color: Palette.gold,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 2,
    opacity: Opacity.watermark * 4,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    lineHeight: 28,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 24,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ManuscriptTokens.progressGlow,
    shadowColor: Palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
});
