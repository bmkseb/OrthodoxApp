import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ExploreCardSurface, useExploreCardTypography } from '@/components/explore/explore-card-chrome';
import { Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { useTranslation } from '@/hooks/use-translation';

type WeeklyItem = {
  id: string;
  eyebrow: string;
  icon: IconName;
  title: string;
  geez: string;
  description: string;
  route?: Href;
};

const WEEKLY_ITEMS: WeeklyItem[] = [
  {
    id: 'saint',
    eyebrow: 'SAINT OF THE WEEK',
    icon: 'church',
    title: 'Saint Yared',
    geez: 'ቅዱስ ያሬድ',
    description:
      'The sixth-century deacon who received sacred chant from three heavenly birds, composing the Degua still sung in the Church today.',
    route: '/calendar',
  },
  {
    id: 'book',
    eyebrow: 'BOOK OF THE WEEK',
    icon: 'scroll',
    title: 'The Book of Jubilees',
    geez: 'መጽሐፈ ኩፋሌ',
    description:
      'Retells Genesis and Exodus as revealed to Moses, dividing all of history into forty-nine-year "jubilees".',
    route: '/catalog',
  },
  {
    id: 'hymn',
    eyebrow: 'HYMN OF THE WEEK',
    icon: 'music',
    title: 'Covenant of Mercy',
    geez: 'ኪዳነ ምሕረት',
    description:
      'A beloved mezmur honoring the Theotokos as the covenant of mercy granted to all who seek her intercession.',
    route: '/listen',
  },
  {
    id: 'prayer',
    eyebrow: 'PRAYER OF THE WEEK',
    icon: 'cross',
    title: 'Praise of Our Lady Mary',
    geez: 'ውዳሴ ማርያም',
    description:
      'The daily praises of the Theotokos — a distinct hymn of devotion appointed for each day of the week.',
    route: '/prayer/wudase-mariam' as Href,
  },
];

export function WeeklyExplore() {
  const { mode } = useTranslation();
  const { palette } = useThemeTokens();
  const type = useExploreCardTypography();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        rail: {
          gap: Layout.cardGap,
          paddingRight: Layout.pagePadding,
        },
        card: {
          width: 248,
          padding: Space.s16,
          gap: Space.s4,
        },
        eyebrowRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Space.s4,
          marginBottom: Space.s4,
        },
        geez: {
          marginBottom: Space.s4,
        },
      }),
    []
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {WEEKLY_ITEMS.map((item) => {
        const inner = (
          <>
            <View style={styles.eyebrowRow}>
              <Icon name={item.icon} size={12} color={palette.mutedGold} />
              <ThemedText style={type.eyebrow}>{item.eyebrow}</ThemedText>
            </View>
            <ThemedText style={type.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {mode !== 'en' && item.geez ? (
              <ThemedText style={[type.accent, styles.geez]} numberOfLines={1}>
                {item.geez}
              </ThemedText>
            ) : null}
            <ThemedText style={type.subtitle} numberOfLines={4}>
              {item.description}
            </ThemedText>
          </>
        );

        if (!item.route) {
          return (
            <ExploreCardSurface key={item.id} style={styles.card}>
              {inner}
            </ExploreCardSurface>
          );
        }
        return (
          <OrthodoxPressable
            key={item.id}
            onPress={() => router.push(item.route!)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.description}`}>
            <ExploreCardSurface style={styles.card}>{inner}</ExploreCardSurface>
          </OrthodoxPressable>
        );
      })}
    </ScrollView>
  );
}
