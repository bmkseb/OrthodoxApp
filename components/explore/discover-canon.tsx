import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { ThemedText } from '@/components/themed-text';
import { SacredImagery } from '@/constants/explore-content';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';

const { width } = Dimensions.get('window');

type CanonFact = {
  id: string;
  title: string;
  geez: string;
  fact: string;
  /** When false, the card is informational only (no navigation). */
  link: boolean;
};

const FACTS: CanonFact[] = [
  {
    id: 'enoch',
    title: 'The Book of Enoch',
    geez: 'መጽሐፈ ሄኖክ',
    fact: 'Quoted directly in the New Testament (Jude 1:14–15), yet it survives in full only in Ge\u02bbez.',
    link: false,
  },
  {
    id: 'jubilees',
    title: 'Jubilees',
    geez: 'መጽሐፈ ኩፋሌ',
    fact: 'Retells Genesis and Exodus as revealed to Moses, dividing history into 49-year "jubilees".',
    link: false,
  },
  {
    id: 'meqabyan',
    title: 'The Meqabyan',
    geez: 'መጽሐፈ መቃብያን',
    fact: 'Ethiopia\u2019s three Books of Meqabyan are entirely distinct from the Maccabees of other traditions.',
    link: true,
  },
];

// Broader-canon books, shown as a horizontal browse rail.
const CANON_BOOKS = [
  { id: 'meqabyan', title: 'Meqabyan', geez: 'መጽሐፈ መቃብያን', image: SacredImagery.continueLiturgy },
  { id: 'tobit', title: 'Tobit', geez: 'መጽሐፈ ጦቢት', image: SacredImagery.readingPsalms },
  { id: 'judith', title: 'Judith', geez: 'መጽሐፈ ዮዲት', image: SacredImagery.prayerOrthodox },
  { id: 'sirach', title: 'Sirach', geez: 'መጽሐፈ ሲራክ', image: SacredImagery.readingJohn },
];

export function DiscoverCanon({ featuredLabel = 'Discover the Canon' }: { featuredLabel?: string }) {
  const featuredWidth = width - Layout.pagePadding * 2;

  const featured: FeaturedItem[] = [
    {
      id: 'enoch',
      title: 'The Book of Enoch',
      subtitle: 'Rarely found in other Bibles',
      badgeLabel: featuredLabel,
      imageUri: SacredImagery.readManuscript,
      onPress: () => router.push('/catalog'),
    },
    {
      id: 'jubilees',
      title: 'Jubilees',
      subtitle: 'Revealed to Moses on Sinai',
      badgeLabel: featuredLabel,
      imageUri: SacredImagery.reflection,
      onPress: () => router.push('/catalog'),
    },
  ];

  return (
    <View>
      <FeaturedCarousel items={featured} width={featuredWidth} autoRotateMs={4000} />

      {/* Horizontal browse rail of broader-canon books */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bookRail}>
        {CANON_BOOKS.map((b) => (
          <ManuscriptBookCard
            key={b.id}
            title={b.title}
            subtitle={b.geez}
            imageUri={b.image}
            onPress={() => router.push('/catalog')}
          />
        ))}
      </ScrollView>

      {/* "Did You Know?" facts about the broader canon */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}>
        {FACTS.map((item) => {
          const inner = (
            <>
              <View style={styles.eyebrowRow}>
                <Icon name="sparkle" size={13} color={Palette.gold} />
                <ThemedText style={styles.eyebrow}>DID YOU KNOW?</ThemedText>
              </View>
              <ThemedText style={styles.title} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.geez} numberOfLines={1}>
                {item.geez}
              </ThemedText>
              <ThemedText style={styles.fact} numberOfLines={4}>
                {item.fact}
              </ThemedText>
            </>
          );

          if (!item.link) {
            return (
              <View key={item.id} style={styles.card}>
                {inner}
              </View>
            );
          }
          return (
            <OrthodoxPressable
              key={item.id}
              onPress={() => router.push('/catalog')}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.fact}`}
              style={styles.card}>
              {inner}
            </OrthodoxPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bookRail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
    marginTop: Space.s16,
  },
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
    marginTop: Space.s16,
  },
  card: {
    width: 240,
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
    letterSpacing: 1.4,
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
  fact: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.muted,
  },
});
