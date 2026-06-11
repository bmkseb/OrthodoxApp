import React, { memo, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { Layout, Overlays, Space, Typography, getExploreCardBorder, getGlossyCardBackground } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const CARD_WIDTH = 110;
const CARD_HEIGHT = 150;

type SoftRailCardProps = {
  title: string;
  subtitle?: string;
  /** When omitted, the card renders the image-less "seal" design (warm gradient + cross). */
  imageUri?: string;
  progress?: number;
  onPress?: () => void;
  /** When provided, renders a small X to dismiss the card (e.g. Continue Learning). */
  onRemove?: () => void;
  removeLabel?: string;
};

/**
 * Soft rounded-rectangle rail card for non-book content (teachings, hymns,
 * collections). Two looks share one footprint:
 *  - With `imageUri`: cover art + cinematic gradient.
 *  - Without `imageUri`: the grayed "seal" treatment (warm gradient + ☩ cross),
 *    used where there's no artwork and a quieter, repeatable card reads better.
 */
export const SoftRailCard = memo(function SoftRailCard({
  title,
  subtitle,
  imageUri,
  progress = 0,
  onPress,
  onRemove,
  removeLabel,
}: SoftRailCardProps) {
  const { palette, colorScheme } = useThemeTokens();
  const showProgress = progress > 0;
  const cardBorder = getExploreCardBorder(palette, colorScheme);
  const cardFill = getGlossyCardBackground(palette, colorScheme);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginRight: Layout.cardGap,
        },
        card: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 18,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: cardBorder,
          overflow: 'hidden',
          backgroundColor: cardFill,
        },
        image: {
          ...StyleSheet.absoluteFillObject,
          opacity: 0.94,
        },
        gradient: {
          flex: 1,
          justifyContent: 'flex-end',
          padding: Space.s12,
        },
        labels: {
          zIndex: 1,
        },
        cross: {
          position: 'absolute',
          top: Space.s12,
          left: Space.s12,
          fontSize: 13,
          color: `${palette.gold}66`,
        },
        title: {
          ...Typography.cardTitle,
          fontSize: 15,
          lineHeight: 19,
          color: palette.text,
        },
        subtitle: {
          marginTop: 2,
          fontSize: 11,
          letterSpacing: 0.2,
        },
        progressTrack: {
          height: 2,
          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        },
        progressFill: {
          height: '100%',
          backgroundColor: palette.gold,
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
          backgroundColor: colorScheme === 'dark' ? 'rgba(12, 10, 8, 0.82)' : 'rgba(255, 255, 255, 0.92)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${palette.gold}73`,
          zIndex: 6,
          elevation: 6,
        },
      }),
    [cardBorder, cardFill, colorScheme, palette]
  );

  const sealGradient =
    colorScheme === 'dark'
      ? (['rgba(42, 36, 28, 0.92)', 'rgba(20, 17, 14, 0.98)'] as const)
      : ([palette.card, palette.surfaceWarm] as const);

  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <View style={styles.card}>
        {imageUri ? (
          <>
            <SacredImage uri={imageUri} style={styles.image} />
            <VignetteOverlay />
            <LinearGradient
              colors={[...Overlays.heroBottomStrong]}
              locations={[0, 0.55, 1]}
              style={styles.gradient}>
              <CardLabels title={title} subtitle={subtitle} titleStyle={styles.title} subtitleStyle={styles.subtitle} />
            </LinearGradient>
          </>
        ) : (
          <LinearGradient
            colors={[...sealGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}>
            <Text style={styles.cross}>☩</Text>
            <CardLabels title={title} subtitle={subtitle} titleStyle={styles.title} subtitleStyle={styles.subtitle} />
          </LinearGradient>
        )}

        {showProgress ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` },
              ]}
            />
          </View>
        ) : null}

        {onRemove ? (
          <OrthodoxPressable
            style={styles.removeBtn}
            onPress={onRemove}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={removeLabel ?? 'Remove'}>
            <Icon name="close" size={10} color={palette.text} />
          </OrthodoxPressable>
        ) : null}
      </View>
    </OrthodoxPressable>
  );
});

function CardLabels({
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
}: {
  title: string;
  subtitle?: string;
  titleStyle: object;
  subtitleStyle: object;
}) {
  return (
    <View style={{ zIndex: 1 }}>
      <ThemedText style={titleStyle} numberOfLines={3}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="muted" style={subtitleStyle} numberOfLines={1}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}
