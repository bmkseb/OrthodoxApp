import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { SacredImage } from '@/components/ui/sacred-image';
import { BorderRadius, Palette } from '@/constants/theme';

type TodaysGospelCardProps = {
  title: string;
  subtitle: string;
  /** 0–1 reading progress, drives the gold bar at the bottom. */
  progress?: number;
  /** Uppercase pill in the top-left corner. */
  chipLabel?: string;
  /** Right-side reading-length pill, e.g. "12 MIN". */
  minutesLabel?: string;
  imageUri: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const CARD_HEIGHT = 180;
const PROGRESS_HEIGHT = 3;

export const TodaysGospelCard = memo(function TodaysGospelCard({
  title,
  subtitle,
  progress = 0,
  chipLabel = 'DAILY GOSPEL',
  minutesLabel = '12 MIN',
  imageUri,
  onPress,
  style,
}: TodaysGospelCardProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <OrthodoxPressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.wrap, style]}>
      <View style={styles.card}>
        <SacredImage uri={imageUri} style={styles.image} contentFit="cover" />

        {/* Dark gradient overlay covering the bottom 60% of the card. */}
        <LinearGradient
          colors={['transparent', 'rgba(10, 8, 6, 0.55)', 'rgba(10, 8, 6, 0.92)']}
          locations={[0, 0.45, 1]}
          style={styles.overlay}
          pointerEvents="none"
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.cross} allowFontScaling={false}>
              ☩
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} allowFontScaling={false}>
                {chipLabel}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>
                {title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1} allowFontScaling={false}>
                {subtitle}
              </Text>
            </View>
            <View style={styles.minutesChip}>
              <Text style={styles.minutesText} allowFontScaling={false}>
                {minutesLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${clamped * 100}%` }]} />
        </View>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.18)',
    overflow: 'hidden',
    backgroundColor: '#100D0A',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18 + PROGRESS_HEIGHT,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cross: {
    fontSize: 16,
    lineHeight: 18,
    color: Palette.gold,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Palette.gold,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28,
    color: Palette.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: 'rgba(245, 236, 215, 0.72)',
  },
  minutesChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245, 236, 215, 0.18)',
  },
  minutesText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(245, 236, 215, 0.85)',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PROGRESS_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
  },
});
