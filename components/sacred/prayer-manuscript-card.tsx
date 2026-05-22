import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Spacing } from '@/constants/theme';

type PrayerManuscriptCardProps = {
  title: string;
  imageUri: string;
  onPress?: () => void;
};

export const PrayerManuscriptCard = memo(function PrayerManuscriptCard({
  title,
  imageUri,
  onPress,
}: PrayerManuscriptCardProps) {
  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <View style={styles.frame}>
        <SacredImage source={{ uri: imageUri }} style={[styles.image, { opacity: ManuscriptTokens.imageSoftening }]} />
        <View style={styles.parchmentWash} />
        <ParchmentGrainOverlay />
        <VignetteOverlay intensity={0.35} />
        <ManuscriptCornerFrame inset={8} />
        <Text style={styles.cornerCross} pointerEvents="none">
          ☩
        </Text>
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.75)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.gradient}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
        </LinearGradient>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginRight: Spacing.md,
  },
  frame: {
    width: 140,
    height: 168,
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
    backgroundColor: ManuscriptTokens.parchmentHighlight,
  },
  cornerCross: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    fontSize: 12,
    color: ManuscriptTokens.fadedGoldStrong,
    opacity: 0.55,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
});
