import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Overlays, Palette, Space, Typography } from '@/constants/theme';

type ManuscriptBookCardProps = {
  title: string;
  subtitle?: string;
  imageUri: string;
  progress?: number;
  onPress?: () => void;
  /** When provided, shows an X button at the top-right to dismiss the card. */
  onRemove?: () => void;
  removeLabel?: string;
};

export const ManuscriptBookCard = memo(function ManuscriptBookCard({
  title,
  subtitle,
  imageUri,
  progress = 0,
  onPress,
  onRemove,
  removeLabel,
}: ManuscriptBookCardProps) {
  const showProgress = progress > 0;

  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <View style={styles.insetBorder}>
        <View style={styles.card}>
          <SacredImage uri={imageUri} style={[styles.image, { opacity: ManuscriptTokens.imageSoftening }]} />
          <View style={styles.parchmentWash} />
          <ParchmentGrainOverlay />
          <VignetteOverlay />
          <ManuscriptCornerFrame inset={6} />

          <LinearGradient
            colors={[...Overlays.heroBottomStrong]}
            locations={[0, 0.55, 1]}
            style={styles.gradient}>
            <Text style={styles.cross}>☩</Text>
            <ThemedText style={styles.title} numberOfLines={2}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </ThemedText>
            ) : null}
          </LinearGradient>

          {showProgress ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
            </View>
          ) : null}

          {onRemove ? (
            <OrthodoxPressable
              style={styles.removeBtn}
              onPress={onRemove}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={removeLabel ?? 'Remove'}>
              <Icon name="close" size={11} color={Palette.text} />
            </OrthodoxPressable>
          ) : null}
        </View>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginRight: Layout.cardGap,
  },
  insetBorder: {
    padding: Space.s4,
    borderRadius: BorderRadius.lg + Space.s4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  card: {
    height: 168,
    width: 148,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
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
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Space.s12,
    paddingBottom: Space.s12,
    paddingTop: Space.s16,
  },
  cross: {
    color: Palette.muted,
    fontSize: 11,
    marginBottom: Space.s4,
    opacity: 0.7,
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 17,
    color: Palette.text,
  },
  subtitle: {
    marginTop: Space.s4,
    ...Typography.metadata,
    textTransform: 'none',
    letterSpacing: 0.2,
    fontSize: 11,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ManuscriptTokens.progressGlow,
  },
  removeBtn: {
    position: 'absolute',
    top: Space.s8,
    right: Space.s8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 10, 8, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
    zIndex: 20,
    elevation: 20,
  },
});
