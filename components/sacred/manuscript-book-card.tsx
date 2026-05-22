import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type ManuscriptBookCardProps = {
  title: string;
  subtitle?: string;
  imageUri: string;
  progress?: number;
  onPress?: () => void;
};

export const ManuscriptBookCard = memo(function ManuscriptBookCard({
  title,
  subtitle,
  imageUri,
  progress,
  onPress,
}: ManuscriptBookCardProps) {
  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <View style={styles.card}>
        <SacredImage source={{ uri: imageUri }} style={[styles.image, { opacity: ManuscriptTokens.imageSoftening }]} />
        <View style={styles.parchmentWash} />
        <ParchmentGrainOverlay />
        <VignetteOverlay intensity={0.3} />
        <ManuscriptCornerFrame inset={8} />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.92)']}
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

        {typeof progress === 'number' ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
          </View>
        ) : null}
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  card: {
    height: 148,
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
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.lg,
  },
  cross: {
    color: Palette.gold,
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.65,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 24,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ManuscriptTokens.progressGlow,
  },
});
