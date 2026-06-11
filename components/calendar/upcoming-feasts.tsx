import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SectionHeader } from '@/components/ui/section-header';
import { SacredImage } from '@/components/ui/sacred-image';
import { useTranslation } from '@/hooks/use-translation';
import { UpcomingFeast } from '@/data/orthodoxCalendar';
import { Layout, getExploreCardBorder } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type UpcomingFeastsProps = {
  feasts: UpcomingFeast[];
  onPressFeast: (feast: UpcomingFeast) => void;
  /** When true, omits header (parent SectionBlock owns rhythm). */
  contentOnly?: boolean;
};

export const UpcomingFeasts = memo(function UpcomingFeasts({
  feasts,
  onPressFeast,
  contentOnly = false,
}: UpcomingFeastsProps) {
  const { t } = useTranslation();
  const { palette, colorScheme } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: 0,
        },
        scroll: {
          gap: Layout.cardGap,
          paddingRight: Layout.pagePadding,
        },
        card: {
          width: 140,
          height: 180,
          borderRadius: Layout.cardRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: getExploreCardBorder(palette, colorScheme),
        },
        image: {
          width: '100%',
          height: '100%',
        },
        gradient: {
          ...StyleSheet.absoluteFillObject,
        },
        textBlock: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          gap: 2,
        },
        name: {
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        date: {
          fontSize: 13,
          color: palette.gold,
        },
        remaining: {
          fontSize: 11,
        },
      }),
    [colorScheme, palette]
  );

  const list = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}>
        {feasts.map((feast) => {
          const dateStr = feast.date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const feastKey = `${feast.date.getFullYear()}-${feast.month}-${feast.day}-${feast.nameEn}`;
          return (
            <OrthodoxPressable
              key={feastKey}
              onPress={() => onPressFeast(feast)}>
              <View style={styles.card}>
                <SacredImage
                  uri={`https://picsum.photos/280/360?random=${feast.day + feast.month * 7}`}
                  style={styles.image}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.88)']}
                  style={styles.gradient}
                />
                <View style={styles.textBlock}>
                  <Text style={styles.name} numberOfLines={2}>
                    {feast.nameEn}
                  </Text>
                  <Text style={styles.date}>{dateStr}</Text>
                  <ThemedText type="muted" style={styles.remaining}>
                    {t('calendar.daysRemaining', { count: feast.daysRemaining })}
                  </ThemedText>
                </View>
              </View>
            </OrthodoxPressable>
          );
        })}
      </ScrollView>
  );

  if (contentOnly) return list;

  return (
    <View style={styles.wrap}>
      <SectionHeader headerKey="upcomingFeasts" />
      {list}
    </View>
  );
});
