import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { type ImageSource } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type FeaturedHeroCardProps = {
  title: string;
  subtitle?: string;
  imageSource: ImageSource;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const FeaturedHeroCard = memo(function FeaturedHeroCard({
  title,
  subtitle,
  imageSource,
  onPress,
  style,
}: FeaturedHeroCardProps) {
  return (
    <OrthodoxPressable style={[styles.wrap, style]} onPress={onPress} accessibilityRole="button">
      <View style={styles.border}>
        <SacredImage source={imageSource} style={styles.image} />
        <VignetteOverlay />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.92)']}
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
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
  },
  border: {
    height: 200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xl,
  },
  cross: {
    color: Palette.gold,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(245, 236, 215, 0.75)',
  },
});
