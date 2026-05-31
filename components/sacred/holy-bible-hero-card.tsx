import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedText } from '@/components/themed-text';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

export type HolyBibleContinue = {
  book: string;
  chapter: number;
  percent: number;
  chapterLabel: string;
  ctaLabel: string;
  onPress: () => void;
};

type HolyBibleHeroCardProps = {
  title: string;
  subtitle: string;
  imageUri?: string;
  onPress?: () => void;
  width?: number;
  continueReading?: HolyBibleContinue;
};

/**
 * Hero card for the Holy Bible: a faint manuscript photo in the background,
 * an illuminated parchment texture, a faint cross watermark, and a soft gold
 * glow behind the title.
 */
export const HolyBibleHeroCard = memo(function HolyBibleHeroCard({
  title,
  subtitle,
  imageUri = SacredImagery.continueBible,
  onPress,
  width,
  continueReading,
}: HolyBibleHeroCardProps) {
  const pct = continueReading ? Math.min(Math.max(Math.round(continueReading.percent), 0), 100) : 0;
  const content = (
    <View style={[styles.card, width != null ? { width } : null]}>
      {/* Subtle bible/manuscript image at ~8% opacity */}
      <Image
        source={{ uri: imageUri }}
        style={styles.bgImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
      <View style={styles.darkWash} />

      {/* Illuminated manuscript texture */}
      <ParchmentGrainOverlay />

      {/* Faint cross watermark */}
      <Text style={styles.crossWatermark}>☩</Text>

      {/* Soft gold glow behind the title */}
      <Svg style={styles.glow} pointerEvents="none">
        <Defs>
          <RadialGradient id="bibleGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Palette.gold} stopOpacity={0.32} />
            <Stop offset="55%" stopColor={Palette.gold} stopOpacity={0.12} />
            <Stop offset="100%" stopColor={Palette.gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="34%" cy="80%" rx="46%" ry="30%" fill="url(#bibleGlow)" />
      </Svg>

      <LinearGradient
        colors={['transparent', 'rgba(12, 10, 8, 0.45)', 'rgba(0, 0, 0, 0.86)']}
        locations={[0.2, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ManuscriptCornerFrame inset={10} opacity={0.28} />

      <View style={styles.textLayer}>
        <Text style={styles.cross}>☩</Text>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>

        {continueReading ? (
          <OrthodoxPressable
            style={styles.continueRow}
            onPress={continueReading.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${continueReading.ctaLabel}: ${continueReading.book} ${continueReading.chapterLabel} ${continueReading.chapter}`}>
            <ThemedText style={styles.continueBook} numberOfLines={1}>
              {continueReading.book} · {continueReading.chapterLabel} {continueReading.chapter}
            </ThemedText>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <View style={styles.continueFooter}>
              <ThemedText style={styles.continuePercent}>{pct}%</ThemedText>
              <View style={styles.continueCta}>
                <ThemedText style={styles.continueCtaText}>{continueReading.ctaLabel}</ThemedText>
                <Icon name="chevron-right" size={13} color={Palette.gold} />
              </View>
            </View>
          </OrthodoxPressable>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <OrthodoxPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
        {content}
      </OrthodoxPressable>
    );
  }
  return content;
});

const styles = StyleSheet.create({
  card: {
    height: 196,
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.18)',
    backgroundColor: Palette.surfaceWarm,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  darkWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 8, 0.55)',
  },
  crossWatermark: {
    position: 'absolute',
    top: 24,
    right: 22,
    fontSize: 120,
    lineHeight: 130,
    color: Palette.gold,
    opacity: 0.05,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
  },
  textLayer: {
    position: 'absolute',
    left: Space.s24,
    right: Space.s24,
    bottom: Space.s24,
    gap: Space.s8,
    zIndex: 3,
  },
  cross: {
    fontSize: 13,
    color: Palette.gold,
    opacity: 0.8,
  },
  title: {
    ...Typography.sectionTitle,
    fontSize: 26,
    color: Palette.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    textShadowColor: 'rgba(201, 147, 58, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(245, 236, 215, 0.74)',
    fontStyle: 'italic',
  },
  continueRow: {
    marginTop: Space.s8,
    paddingTop: Space.s8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(201, 147, 58, 0.22)',
    gap: Space.s4,
  },
  continueBook: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.text,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
    backgroundColor: Palette.gold,
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continuePercent: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.muted,
  },
  continueCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  continueCtaText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.gold,
  },
});
