import React, { memo } from 'react';
import { Dimensions, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { GeometricWatermark } from '@/components/sacred/geometric-watermark';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { EditorialMetaRow } from '@/components/ui/editorial-meta-row';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Opacity, Overlays, Palette, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SacredReadingHeroCardProps = {
  title: string;
  metadata?: string;
  metaLabels?: string[];
  /** Uppercase capsule above title (e.g. Daily Gospel) */
  labelCapsule?: string;
  /** Small category line below title */
  category?: string;
  imageUri: string;
  progress?: number;
  compact?: boolean;
  featured?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const SacredReadingHeroCard = memo(function SacredReadingHeroCard({
  title,
  metadata,
  metaLabels,
  labelCapsule,
  category,
  imageUri,
  progress = 0,
  compact = false,
  featured = false,
  onPress,
  style,
}: SacredReadingHeroCardProps) {
  const cardWidth = compact
    ? SCREEN_WIDTH * 0.78
    : SCREEN_WIDTH - Layout.pagePadding * 2;
  const cardHeight = featured ? 228 : compact ? 140 : 192;

  return (
    <OrthodoxPressable
      style={[styles.wrap, featured && styles.wrapFeatured, { width: cardWidth, marginRight: compact ? Spacing.sm : 0 }, style]}
      onPress={onPress}
      accessibilityRole="button">
      {featured ? (
        <LinearGradient
          colors={['rgba(201, 147, 58, 0.12)', 'transparent']}
          style={styles.bronzeHalo}
          pointerEvents="none"
        />
      ) : null}
      <View style={[styles.card, { height: cardHeight }]}>
        <SacredImage uri={imageUri} style={styles.image} contentFit="cover" />
        <View style={[styles.parchmentWash, featured && styles.parchmentWashFeatured]} />
        <ParchmentGrainOverlay />
        <VignetteOverlay />
        <ManuscriptCornerFrame inset={featured ? 10 : 8} />
        {featured ? (
          <View style={styles.cornerIcon}>
            <Icon name="cross" size={14} color="rgba(201, 147, 58, 0.55)" />
          </View>
        ) : null}

        <LinearGradient
          colors={[...(featured ? Overlays.heroCinematic : Overlays.heroBottomLower40)]}
          locations={featured ? [0, 0.5, 0.68, 1] : [0, 0.55, 0.72, 1]}
          style={styles.bottomGradient}
        />

        <View style={[styles.content, featured && styles.contentFeatured]}>
          {featured && metaLabels?.length ? (
            <View style={styles.topMeta}>
              <EditorialMetaRow labels={metaLabels} />
            </View>
          ) : null}
          <View style={styles.bottomBlock}>
            <View style={styles.watermark}>
              <GeometricWatermark size={compact ? 36 : featured ? 44 : 40} />
            </View>
            {featured && labelCapsule ? (
              <View style={styles.capsule}>
                <Text style={styles.capsuleText}>{labelCapsule}</Text>
              </View>
            ) : null}
            {metadata && !featured ? (
              <ThemedText type="muted" style={styles.metadata}>
                {metadata}
              </ThemedText>
            ) : null}
            <View style={styles.titleRow}>
              <Text style={styles.cross}>☩</Text>
              <ThemedText
                style={[styles.title, compact && styles.titleCompact, featured && styles.titleFeatured]}
                numberOfLines={featured ? 3 : compact ? 2 : 3}>
                {title}
              </ThemedText>
            </View>
            {featured && category ? (
              <Text style={styles.category}>{category}</Text>
            ) : null}
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
  wrapFeatured: {
    shadowColor: Palette.gold,
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  bronzeHalo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
    top: -4,
    bottom: -4,
    left: -4,
    right: -4,
    zIndex: -1,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ManuscriptTokens.cardBorder,
    overflow: 'hidden',
    backgroundColor: ManuscriptTokens.cardWarmEnd,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  parchmentWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ManuscriptTokens.parchmentWash,
  },
  parchmentWashFeatured: {
    backgroundColor: 'rgba(10, 8, 6, 0.25)',
  },
  cornerIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 4,
  },
  capsule: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
    marginBottom: Spacing.sm,
  },
  capsuleText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
  },
  category: {
    marginTop: Spacing.xs,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Palette.muted,
    opacity: 0.9,
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  contentFeatured: {
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  topMeta: {
    zIndex: 2,
  },
  bottomBlock: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  watermark: {
    position: 'absolute',
    right: 4,
    bottom: Spacing.lg,
    opacity: 0.35,
  },
  metadata: {
    fontSize: 11,
    marginBottom: Spacing.sm - 2,
    color: ManuscriptTokens.parchmentMuted,
    letterSpacing: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  cross: {
    color: Palette.gold,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
    opacity: 0.55,
  },
  title: {
    flex: 1,
    fontSize: 21,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 27,
    letterSpacing: -0.35,
  },
  titleCompact: {
    fontSize: 17,
    lineHeight: 22,
  },
  titleFeatured: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    maxWidth: '94%',
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ManuscriptTokens.progressGlow,
  },
});
