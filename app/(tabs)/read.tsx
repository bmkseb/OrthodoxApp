import { router } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/orthodox/PageHeader';
import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { HolyBibleHeroCard } from '@/components/sacred/holy-bible-hero-card';
import { VerseOfTheDayCard } from '@/components/sacred/verse-of-the-day-card';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { SacredSectionDivider } from '@/components/sacred/sacred-section-divider';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout } from '@/constants/theme';
import { getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { removeReadingProgress, useReadingProgress } from '@/hooks/use-reading-progress';
import { scriptureLangQuery } from '@/hooks/use-scripture-lang';
import { useTranslation } from '@/hooks/use-translation';

const { width } = Dimensions.get('window');

const CATALOG_PREVIEW = [
  { id: 'c1', titleKey: 'horologium' as const, subKey: 'horologiumSub' as const, image: SacredImagery.readManuscript, route: '/horologium' as const },
  { id: 'c2', titleKey: 'holyBible' as const, subKey: 'holyBibleSub' as const, image: SacredImagery.continueBible, route: '/catalog' as const },
  { id: 'c3', titleKey: 'liturgy' as const, subKey: 'liturgySub' as const, image: SacredImagery.continueLiturgy, route: '/catalog' as const },
];

export default function ReadScreen() {
  const { t } = useTranslation();
  const featuredWidth = width - Layout.pagePadding * 2;
  const { entries } = useReadingProgress();

  const featuredItems: FeaturedItem[] = [
    {
      id: 'readings',
      title: t('content.todaysReadings'),
      subtitle: t('content.todaysReadingsSub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.continueBible,
      onPress: () => router.push('/calendar'),
    },
    {
      id: 'saint',
      title: t('content.saintOfTheDay'),
      subtitle: t('content.saintOfTheDaySub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.prayerOrthodox,
      onPress: () => router.push('/calendar'),
    },
    {
      id: 'feast',
      title: t('content.feastFast'),
      subtitle: t('content.feastFastSub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.continueLiturgy,
      onPress: () => router.push('/calendar'),
    },
    {
      id: 'prayer',
      title: t('content.dailyPrayer'),
      subtitle: t('content.dailyPrayerSub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.prayerDaily,
      onPress: () => router.push('/horologium'),
    },
  ];

  const lastRead = entries[0];
  const lastReadBook = lastRead ? getBibleBook(lastRead.bookId) : undefined;
  const continueReading = lastRead
    ? {
        book: lastReadBook ? getBookTitle(lastReadBook, lastRead.lang) : t('content.holyBible'),
        chapter: lastRead.chapter,
        percent:
          lastRead.totalChapters > 0 ? (lastRead.chapter / lastRead.totalChapters) * 100 : 0,
        chapterLabel: t('scripture.chapter'),
        ctaLabel: t('sections.continueReading'),
        onPress: () =>
          router.push(
            `/book/${lastRead.bookId}/${lastRead.chapter}${scriptureLangQuery(lastRead.lang)}`
          ),
      }
    : undefined;

  return (
    <ScreenScrollView>
      <PageHeader title="Read" geez="መጽሐፍ" />

      <View style={styles.section}>
        <HolyBibleHeroCard
          title={t('content.holyBible')}
          subtitle={t('content.holyBibleSub')}
          imageUri={SacredImagery.continueBible}
          width={featuredWidth}
          onPress={() => router.push('/catalog')}
          continueReading={continueReading}
        />
      </View>

      {entries.length > 0 ? (
        <>
          <SacredSectionDivider />

          <View style={styles.section}>
            <SectionHeader headerKey="recentlyRead" icon="book" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalRail}>
              {entries.map((entry) => {
                const book = getBibleBook(entry.bookId);
                const title = book ? getBookTitle(book, entry.lang) : t('content.holyBible');
                const progress =
                  entry.totalChapters > 0 ? entry.chapter / entry.totalChapters : 0;
                return (
                  <ManuscriptBookCard
                    key={entry.bookId}
                    title={title}
                    subtitle={`${t('scripture.chapter')} ${entry.chapter}`}
                    imageUri={SacredImagery.continueBible}
                    progress={progress}
                    onPress={() =>
                      router.push(
                        `/book/${entry.bookId}/${entry.chapter}${scriptureLangQuery(entry.lang)}`
                      )
                    }
                    onRemove={() => void removeReadingProgress(entry.bookId)}
                    removeLabel={`Remove ${title}`}
                  />
                );
              })}
            </ScrollView>
          </View>
        </>
      ) : null}

      <SacredSectionDivider />

      <View style={styles.section}>
        <SectionHeader headerKey="featured" icon="sparkle" />
        <FeaturedCarousel items={featuredItems} width={featuredWidth} autoRotateMs={3200} />
      </View>

      <SacredSectionDivider />

      <View style={styles.section}>
        <SectionHeader headerKey="content.verseOfTheDay" icon="book" />
        <VerseOfTheDayCard width={featuredWidth} />
      </View>

      <SacredSectionDivider />

      <View style={styles.section}>
        <SectionHeader
          headerKey="orthodoxCatalog"
          icon="scroll"
          onSeeAllPress={() => router.push('/read/catalog')}
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
              onPress={() => router.push(book.route)}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Layout.sectionContentBottom,
  },
  horizontalRail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
  },
});
