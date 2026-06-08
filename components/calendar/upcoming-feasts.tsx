import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { SacredImage } from '@/components/ui/sacred-image';
import { useTranslation } from '@/hooks/use-translation';
import { UpcomingFeast } from '@/data/orthodoxCalendar';
import { Layout, Opacity, Palette, Space } from '@/constants/theme';

type UpcomingFeastsProps = {
  feasts: UpcomingFeast[];
  onPressFeast: (feast: UpcomingFeast) => void;
};

export const UpcomingFeasts = memo(function UpcomingFeasts({ feasts, onPressFeast }: UpcomingFeastsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <BilingualHeader headerKey="upcomingFeasts" variant="section" />
        <Icon name="sparkle" size={18} />
      </View>
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
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: Space.s24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.headerContentGap,
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
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
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
    color: Palette.text,
  },
  date: {
    fontSize: 13,
    color: Palette.gold,
  },
  remaining: {
    fontSize: 11,
  },
});
