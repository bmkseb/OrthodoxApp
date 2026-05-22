import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CategoryBadge } from '@/components/ui/category-badge';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Opacity, Palette, Spacing } from '@/constants/theme';

type LearnHeroCardProps = {
  title: string;
  subtitle?: string;
  imageUri: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const LearnHeroCard = memo(function LearnHeroCard({
  title,
  subtitle,
  imageUri,
  onPress,
  style,
}: LearnHeroCardProps) {
  return (
    <OrthodoxPressable style={[styles.wrap, style]} onPress={onPress} accessibilityRole="button">
      <View style={styles.card}>
        <SacredImage source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.crimsonWash} />
        <ParchmentGrainOverlay />
        <VignetteOverlay />
        <CategoryBadge style={styles.badge} />
        <Text style={styles.watermark} pointerEvents="none">
          ☩
        </Text>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.82)', 'rgba(0,0,0,0.95)']}
          locations={[0.25, 0.55, 0.78, 1]}
          style={styles.gradient}>
          {subtitle ? (
            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {subtitle.toUpperCase()}
            </ThemedText>
          ) : null}
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
    borderRadius: BorderRadius.lg,
    shadowColor: ManuscriptTokens.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  card: {
    height: 228,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ManuscriptTokens.cardBorder,
    overflow: 'hidden',
    backgroundColor: ManuscriptTokens.cardWarmEnd,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  crimsonWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 26, 26, 0.25)',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  watermark: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md + 28,
    fontSize: 28,
    color: Palette.gold,
    opacity: Opacity.watermark,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md + 4,
    paddingTop: Spacing.xl,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: ManuscriptTokens.parchmentMuted,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    lineHeight: 28,
  },
});
