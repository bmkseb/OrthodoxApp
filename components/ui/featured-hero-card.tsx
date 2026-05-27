import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { type ImageSource } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Overlays, Palette, Spacing } from '@/constants/theme';

type FeaturedHeroCardProps = {
  title: string;
  subtitle?: string;
  imageSource: ImageSource;
  isPlayingWarm?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const FeaturedHeroCard = memo(function FeaturedHeroCard({
  title,
  subtitle,
  imageSource,
  isPlayingWarm = false,
  onPress,
  style,
}: FeaturedHeroCardProps) {
  const imageUri =
    typeof imageSource === 'string'
      ? imageSource
      : typeof imageSource === 'object' && imageSource && 'uri' in imageSource
        ? String(imageSource.uri)
        : '';

  return (
    <View style={[styles.wrap, style]}>
      {isPlayingWarm ? (
        <LinearGradient
          colors={['rgba(201, 147, 58, 0.14)', 'transparent']}
          style={styles.warmHalo}
          pointerEvents="none"
        />
      ) : null}
      <OrthodoxPressable style={styles.pressable} onPress={onPress} accessibilityRole="button">
        <View style={[styles.border, isPlayingWarm && styles.borderWarm]}>
          <SacredImage uri={imageUri} style={styles.image} />
          <VignetteOverlay />
          <LinearGradient
            colors={[...Overlays.heroCinematic]}
            locations={[0, 0.5, 0.7, 1]}
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
        </View>
      </OrthodoxPressable>
      <LinearGradient
        colors={['transparent', Palette.background]}
        style={styles.pageFade}
        pointerEvents="none"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
    marginBottom: Layout.sectionHeaderGap,
  },
  warmHalo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg + 4,
    top: -6,
    bottom: -6,
    left: -6,
    right: -6,
    zIndex: 0,
  },
  pressable: {
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  border: {
    height: 192,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    overflow: 'hidden',
  },
  borderWarm: {
    borderColor: 'rgba(201, 147, 58, 0.35)',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md + 2,
    paddingBottom: Spacing.md + 2,
    paddingTop: Spacing.xl,
  },
  cross: {
    color: Palette.gold,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: Spacing.sm - 2,
    opacity: 0.6,
  },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 3,
    letterSpacing: -0.35,
    maxWidth: '88%',
    textAlign: 'left',
  },
  subtitle: {
    color: 'rgba(248, 240, 221, 0.7)',
    fontSize: 12,
    maxWidth: '75%',
    textAlign: 'left',
  },
  pageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -18,
    height: 24,
    zIndex: 2,
  },
});
