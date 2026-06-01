import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

type WeeklyItem = {
  id: string;
  /** Short kicker, e.g. "SAINT OF THE WEEK". */
  eyebrow: string;
  icon: IconName;
  title: string;
  geez: string;
  description: string;
  /** Optional destination; omit for an informational-only card. */
  route?: Href;
};

/**
 * Curated weekly highlights. Swap these out each week to feature a different
 * saint, book, hymn, or prayer with a short note on why it's worth exploring.
 */
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

/** Horizontal rail of weekly featured highlights for the Explore tab. */
export function WeeklyExplore() {
  const { mode } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {WEEKLY_ITEMS.map((item) => {
        const inner = (
          <>
            <View style={styles.eyebrowRow}>
              <Icon name={item.icon} size={13} color={Palette.gold} />
              <ThemedText style={styles.eyebrow}>{item.eyebrow}</ThemedText>
            </View>
            <ThemedText style={styles.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {mode !== 'en' && item.geez ? (
              <ThemedText style={styles.geez} numberOfLines={1}>
                {item.geez}
              </ThemedText>
            ) : null}
            <ThemedText style={styles.description} numberOfLines={4}>
              {item.description}
            </ThemedText>
          </>
        );

        if (!item.route) {
          return (
            <View key={item.id} style={styles.card}>
              {inner}
            </View>
          );
        }
        return (
          <OrthodoxPressable
            key={item.id}
            onPress={() => router.push(item.route!)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.description}`}
            style={styles.card}>
            {inner}
          </OrthodoxPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
  },
  card: {
    width: 248,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.28)',
    backgroundColor: Palette.card,
    padding: Space.s16,
    gap: Space.s4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
    marginBottom: Space.s4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: Palette.gold,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  geez: {
    fontSize: 13,
    color: Palette.gold,
    marginBottom: Space.s4,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.muted,
  },
});
