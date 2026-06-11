import { memo, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import {
  Layout,
  SerifFamily,
  Space,
  getBibleHeroInnerHairline,
} from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

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
  /** Small-caps label above the title (e.g. Scripture, Prayer, Featured). */
  eyebrow?: string;
  onPress?: () => void;
  width?: number;
  height?: number;
  continueReading?: HolyBibleContinue;
};

const INNER_INSET = 3;

/** Featured Holy Bible hero — espresso gradient, rounded, gold inner hairline. */
export const HolyBibleHeroCard = memo(function HolyBibleHeroCard({
  title,
  subtitle,
  eyebrow = 'Scripture',
  onPress,
  width,
  height,
  continueReading,
}: HolyBibleHeroCardProps) {
  const { palette, colorScheme, sacred } = useThemeTokens();
  const innerHairline = getBibleHeroInnerHairline(colorScheme);
  const pct = continueReading ? Math.min(Math.max(Math.round(continueReading.percent), 0), 100) : 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        host: {
          ...(width != null ? { width } : null),
          borderRadius: Layout.cardRadius,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: palette.shadowColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: colorScheme === 'light' ? 0.1 : 0.28,
              shadowRadius: 12,
            },
            android: { elevation: 4 },
          }),
        },
        gradient: {
          minHeight: height ?? Layout.featuredCardHeight,
        },
        innerFrame: {
          flex: 1,
          margin: INNER_INSET,
          borderRadius: Layout.cardRadius - INNER_INSET,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: innerHairline,
          overflow: 'hidden',
        },
        body: {
          minHeight: (height ?? Layout.featuredCardHeight) - INNER_INSET * 2,
          paddingHorizontal: Space.s24,
          paddingVertical: Space.s24,
          justifyContent: 'flex-end',
        },
        eyebrow: {
          fontSize: 11,
          fontWeight: '700',
          color: palette.gold,
          letterSpacing: 1.4,
          marginBottom: Space.s8,
          fontFamily: SerifFamily,
          ...Platform.select({
            ios: { fontVariant: ['small-caps' as const] },
            default: { textTransform: 'uppercase' as const },
          }),
        },
        title: {
          fontSize: 26,
          fontWeight: '700',
          lineHeight: 32,
          color: sacred.cream,
          fontFamily: SerifFamily,
        },
        subtitle: {
          fontSize: 14,
          lineHeight: 20,
          color: sacred.creamMuted,
          fontFamily: SerifFamily,
          marginTop: Space.s4,
        },
        continueRow: {
          marginTop: Space.s12,
          paddingTop: Space.s12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(255, 255, 255, 0.12)',
          gap: Space.s4,
        },
        continueBook: {
          fontSize: 11,
          fontWeight: '600',
          color: sacred.creamMuted,
          fontFamily: SerifFamily,
        },
        progressTrack: {
          height: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.14)',
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          borderRadius: 1,
          backgroundColor: palette.gold,
        },
        continueFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        continuePercent: {
          fontSize: 10,
          fontWeight: '600',
          color: sacred.creamMuted,
        },
        continueCta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        },
        continueCtaText: {
          fontSize: 11,
          fontWeight: '700',
          color: palette.gold,
        },
      }),
    [colorScheme, height, innerHairline, palette, sacred, width]
  );

  const content = (
    <View style={styles.host}>
      <LinearGradient
        colors={[sacred.espressoStart, sacred.espressoEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}>
        <View style={styles.innerFrame}>
          <View style={styles.body}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {continueReading ? (
              <OrthodoxPressable
                style={styles.continueRow}
                onPress={continueReading.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${continueReading.ctaLabel}: ${continueReading.book} ${continueReading.chapterLabel} ${continueReading.chapter}`}>
                <Text style={styles.continueBook} numberOfLines={1}>
                  {continueReading.book} · {continueReading.chapterLabel} {continueReading.chapter}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <View style={styles.continueFooter}>
                  <Text style={styles.continuePercent}>{pct}%</Text>
                  <View style={styles.continueCta}>
                    <Text style={styles.continueCtaText}>{continueReading.ctaLabel}</Text>
                    <Icon name="chevron-right" size={13} color={palette.gold} />
                  </View>
                </View>
              </OrthodoxPressable>
            ) : null}
          </View>
        </View>
      </LinearGradient>
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
