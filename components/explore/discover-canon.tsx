import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { SacredImagery } from '@/constants/explore-content';
import { Layout, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

const { width } = Dimensions.get('window');

// Broader-canon books, shown as a horizontal browse rail.
const CANON_BOOKS = [
  { id: 'meqabyan', title: 'Meqabyan', geez: 'መጽሐፈ መቃብያን', image: SacredImagery.continueLiturgy },
  { id: 'tobit', title: 'Tobit', geez: 'መጽሐፈ ጦቢት', image: SacredImagery.readingPsalms },
  { id: 'judith', title: 'Judith', geez: 'መጽሐፈ ዮዲት', image: SacredImagery.prayerOrthodox },
  { id: 'sirach', title: 'Sirach', geez: 'መጽሐፈ ሲራክ', image: SacredImagery.readingJohn },
];

export function DiscoverCanon({ featuredLabel = 'Discover the Canon' }: { featuredLabel?: string }) {
  const featuredWidth = width - Layout.pagePadding * 2;
  const { mode } = useTranslation();

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
            subtitle={mode === 'en' ? undefined : b.geez}
            imageUri={b.image}
            onPress={() => router.push('/catalog')}
          />
        ))}
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
});
