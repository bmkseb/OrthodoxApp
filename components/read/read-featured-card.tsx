import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PremiumBookCoverLayers } from '@/components/read/premium-book-cover-layers';
import type { ReadCoverFocus, ReadCoverSource, ReadCoverTone } from '@/constants/read-cover-art';
import { Layout, SerifFamily, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type ReadFeaturedCardProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  coverSource: ReadCoverSource;
  coverTone?: ReadCoverTone;
  coverFocus?: ReadCoverFocus;
  height?: number;
  onPress?: () => void;
  style?: { width?: number };
};

/** Featured Read hero — premium book cover with title overlay. */
export const ReadFeaturedCard = memo(function ReadFeaturedCard({
  title,
  subtitle,
  eyebrow = 'Featured',
  coverSource,
  coverTone = 'default',
  coverFocus,
  height = Layout.featuredCardHeight,
  onPress,
  style,
}: ReadFeaturedCardProps) {
  const { palette, sacred, colorScheme } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        host: {
          ...(style?.width != null ? { width: style.width } : null),
          height,
          borderRadius: Layout.cardRadius,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${palette.gold}33`,
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
        topRule: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: palette.gold,
          zIndex: 4,
        },
        scrim: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 2,
        },
        labels: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: Space.s20,
          paddingBottom: Space.s16,
          paddingTop: Space.s32,
          zIndex: 3,
        },
        eyebrow: {
          fontSize: 11,
          fontWeight: '700',
          color: palette.gold,
          letterSpacing: 1.2,
          marginBottom: Space.s6,
          fontFamily: SerifFamily,
          ...Platform.select({
            ios: { fontVariant: ['small-caps' as const] },
            default: { textTransform: 'uppercase' as const },
          }),
        },
        title: {
          fontSize: 22,
          fontWeight: '700',
          lineHeight: 28,
          color: sacred.cream,
          fontFamily: SerifFamily,
        },
        subtitle: {
          marginTop: Space.s4,
          fontSize: 13,
          lineHeight: 18,
          color: sacred.creamMuted,
          fontFamily: SerifFamily,
        },
      }),
    [colorScheme, height, palette, sacred, style?.width]
  );

  const card = (
    <View style={styles.host}>
      <PremiumBookCoverLayers
        source={coverSource}
        tone={coverTone}
        focus={coverFocus}
        spineWidth={8}
        recyclingKey={typeof coverSource === 'string' ? coverSource : title}
      />
      <View style={styles.topRule} pointerEvents="none" />
      <LinearGradient
        colors={['transparent', 'rgba(8, 6, 5, 0.22)', 'rgba(8, 6, 5, 0.78)']}
        locations={[0.42, 0.72, 1]}
        style={styles.scrim}
        pointerEvents="none"
      />
      <View style={styles.labels}>
        <Text style={styles.eyebrow} numberOfLines={1}>
          {eyebrow}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <OrthodoxPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
        {card}
      </OrthodoxPressable>
    );
  }

  return card;
});
