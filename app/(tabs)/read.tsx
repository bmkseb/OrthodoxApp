import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { PageHeader } from '@/components/orthodox/PageHeader';
import { EditorialFeaturedCard } from '@/components/sacred/editorial-featured-card';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { SacredSectionDivider } from '@/components/sacred/sacred-section-divider';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { useTranslation } from '@/hooks/use-translation';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout } from '@/constants/theme';

const { width } = Dimensions.get('window');

const BOOKS = [
  { id: '1', titleKey: 'horologium' as const, subKey: 'horologiumSub' as const, image: SacredImagery.continueHorologium, progress: 0.35 },
  { id: '2', titleKey: 'holyBible' as const, subKey: 'holyBibleSub' as const, image: SacredImagery.continueBible, progress: 0.62 },
  { id: '3', titleKey: 'liturgy' as const, subKey: 'liturgySub' as const, image: SacredImagery.continueLiturgy, progress: 0.18 },
];

const CATALOG_PREVIEW = [
  { id: 'c1', titleKey: 'horologium' as const, subKey: 'horologiumSub' as const, image: SacredImagery.readManuscript },
  { id: 'c2', titleKey: 'holyBible' as const, subKey: 'holyBibleSub' as const, image: SacredImagery.continueBible },
  { id: 'c3', titleKey: 'liturgy' as const, subKey: 'liturgySub' as const, image: SacredImagery.continueLiturgy },
];

export default function ReadScreen() {
  const { t } = useTranslation();
  const featuredWidth = width - Layout.pagePadding * 2;

  return (
    <ScreenScrollView contentContainerStyle={styles.scroll}>
      <PageHeader title="Read" geez="መጽሐፍ" />

      <View style={styles.section}>
        <SectionHeader headerKey="continueReading" icon="book" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRail}>
          {BOOKS.map((book) => (
            <ManuscriptBookCard
              key={book.id}
              title={t(`content.${book.titleKey}`)}
              subtitle={t(`content.${book.subKey}`)}
              imageUri={book.image}
              progress={book.progress}
            />
          ))}
        </ScrollView>
      </View>

      <SacredSectionDivider />

      <View style={styles.section}>
        <SectionHeader headerKey="featured" icon="sparkle" />
        <EditorialFeaturedCard
          title={t('common.lawOfKings')}
          subtitle={t('common.lawOfKingsSub')}
          badgeLabel={t('common.sacredManuscript')}
          imageUri={SacredImagery.readFeatured}
          style={{ width: featuredWidth }}
        />
      </View>

      <SacredSectionDivider />

      <View style={styles.section}>
        <SectionHeader
          headerKey="orthodoxCatalog"
          icon="scroll"
          onSeeAllPress={() => router.push('/catalog')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRail}>
          {CATALOG_PREVIEW.map((book) => (
            <ManuscriptBookCard
              key={book.id}
              title={t(`content.${book.titleKey}`)}
              subtitle={t(`content.${book.subKey}`)}
              imageUri={book.image}
              onPress={() => router.push('/catalog')}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Layout.sectionContentBottom },
  section: {
    marginBottom: Layout.sectionContentBottom,
  },
  horizontalRail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
  },
});
