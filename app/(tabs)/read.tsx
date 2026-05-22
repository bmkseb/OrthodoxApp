import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Icon } from '@/components/Icon';
import { EditorialFeaturedCard } from '@/components/sacred/editorial-featured-card';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionDivider } from '@/components/ui/section-divider';
import { SectionHeader } from '@/components/ui/section-header';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { useTranslation } from '@/hooks/use-translation';
import { Layout } from '@/constants/theme';

const { width } = Dimensions.get('window');

const BOOKS = [
  { id: '1', titleKey: 'horologium' as const, subKey: 'horologiumSub' as const, image: 'https://picsum.photos/300/400?random=51' },
  { id: '2', titleKey: 'holyBible' as const, subKey: 'holyBibleSub' as const, image: 'https://picsum.photos/300/400?random=52' },
  { id: '3', titleKey: 'liturgy' as const, subKey: 'liturgySub' as const, image: 'https://picsum.photos/300/400?random=53' },
];

export default function ReadScreen() {
  const { t } = useTranslation();
  const featuredWidth = width - Layout.pagePadding * 2;

  return (
    <ScreenScrollView>
      <View style={styles.topRow}>
        <View style={styles.pageTitleRow}>
          <Icon name="book" size={22} />
          <BilingualHeader headerKey="read" variant="page" />
        </View>
        <SettingsNavButton />
      </View>

      <SectionHeader headerKey="continueReading" icon="book" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.scrollContent}>
        {BOOKS.map((book) => (
          <ManuscriptBookCard
            key={book.id}
            title={t(`content.${book.titleKey}`)}
            subtitle={t(`content.${book.subKey}`)}
            imageUri={book.image}
          />
        ))}
      </ScrollView>

      <SectionDivider />

      <SectionHeader headerKey="featured" icon="sparkle" />
      <EditorialFeaturedCard
        title={t('common.lawOfKings')}
        subtitle={t('common.lawOfKingsSub')}
        badgeLabel={t('common.sacredManuscript')}
        imageUri="https://picsum.photos/900/600?random=50"
        style={{ width: featuredWidth, marginBottom: Layout.sectionGap }}
      />

      <SectionDivider />

      <SectionHeader
        headerKey="orthodoxCatalog"
        icon="scroll"
        onSeeAllPress={() => router.push('/catalog')}
      />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.sectionGap,
  },
  pageTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, flex: 1 },
  horizontalScroll: { marginBottom: Layout.sectionGap },
  scrollContent: { gap: Layout.cardGap, paddingRight: Layout.pagePadding },
});
