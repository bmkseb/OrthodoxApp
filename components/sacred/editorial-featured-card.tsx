import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type EditorialFeaturedCardProps = {
  title: string;
  subtitle?: string;
  imageUri: string;
  badgeLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const EditorialFeaturedCard = memo(function EditorialFeaturedCard({
  title,
  subtitle,
  imageUri,
  badgeLabel,
  onPress,
  style,
}: EditorialFeaturedCardProps) {
  return (
    <OrthodoxPressable style={[styles.wrap, style]} onPress={onPress} accessibilityRole="button">
      <View style={styles.card}>
        <SacredImage source={{ uri: imageUri }} style={styles.image} />
        <VignetteOverlay intensity={0.45} />
        <ManuscriptCornerFrame />
        {badgeLabel ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{badgeLabel}</ThemedText>
          </View>
        ) : null}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}>
          <Text style={styles.cross}>☩</Text>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="muted" style={styles.subtitle} numberOfLines={2}>
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
  card: {
    minHeight: 200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ManuscriptTokens.cardBorder,
    overflow: 'hidden',
    backgroundColor: ManuscriptTokens.cardWarmEnd,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: ManuscriptTokens.fadedGold,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.gold,
    letterSpacing: 0.5,
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
    fontSize: 18,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  subtitle: {
    color: ManuscriptTokens.parchmentMuted,
    lineHeight: 20,
  },
});
