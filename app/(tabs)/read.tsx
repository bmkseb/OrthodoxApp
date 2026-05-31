import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/orthodox/PageHeader';
import { BookshelfBookCard } from '@/components/read/bookshelf-book-card';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { HolyBibleHeroCard } from '@/components/sacred/holy-bible-hero-card';
import { ContentSearchResults } from '@/components/search/content-search-results';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout } from '@/constants/theme';
import { getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  isPrayerBookId,
  prayerSlugFromBookId,
  removeReadingProgress,
  useReadingProgress,
} from '@/hooks/use-reading-progress';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { scriptureChapterRoute } from '@/hooks/use-scripture-lang';
import { useTranslation } from '@/hooks/use-translation';
import {
  resolveReadHeaderRoute,
  searchReadContent,
  searchReadHeaders,
  type ReadSearchContentHit,
  type ReadSearchHeaderHit,
} from '@/lib/read-search';

const { width } = Dimensions.get('window');

// Holy Bible listed first in the Orthodox Catalog preview.
const CATALOG_PREVIEW = [
  { id: 'c2', titleKey: 'holyBible' as const, subKey: 'holyBibleSub' as const, image: SacredImagery.continueBible, route: '/catalog' as Href },
  { id: 'c4', titleKey: 'dailyPrayer' as const, subKey: 'dailyPrayerSub' as const, image: SacredImagery.prayerDaily, route: '/prayer/daily-prayer' as Href },
  { id: 'c1', titleKey: 'horologium' as const, subKey: 'horologiumSub' as const, image: SacredImagery.readManuscript, route: '/horologium' as Href },
  { id: 'c3', titleKey: 'liturgy' as const, subKey: 'liturgySub' as const, image: SacredImagery.continueLiturgy, route: '/catalog' as Href },
];

export default function ReadScreen() {
  const { t } = useTranslation();
  const featuredWidth = width - Layout.pagePadding * 2;
  const { entries } = useReadingProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('read');
  const [headerHits, setHeaderHits] = useState<ReadSearchHeaderHit[]>([]);
  const [contentHits, setContentHits] = useState<ReadSearchContentHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const readLang = entries[0]?.lang ?? 'english';

  const {
    values: catalogScroll,
    scrollHandler: catalogScrollHandler,
    onLayout: catalogScrollLayout,
    onContentSizeChange: catalogContentSizeChange,
  } = useHorizontalScrollIndicator();
  const {
    values: continueScroll,
    scrollHandler: continueScrollHandler,
    onLayout: continueScrollLayout,
    onContentSizeChange: continueContentSizeChange,
  } = useHorizontalScrollIndicator();

  useEffect(() => {
    if (!debouncedQuery) {
      setHeaderHits([]);
      setContentHits([]);
      setSearchLoading(false);
      return;
    }

    setHeaderHits(searchReadHeaders(debouncedQuery, readLang));

    let active = true;
    setSearchLoading(true);
    searchReadContent(debouncedQuery, readLang)
      .then((hits) => {
        if (active) setContentHits(hits);
      })
      .catch(() => {
        if (active) setContentHits([]);
      })
      .finally(() => {
        if (active) setSearchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, readLang]);

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
  };

  const featuredItems: FeaturedItem[] = [
    {
      id: 'readings',
      title: t('content.todaysReadings'),
      subtitle: t('content.todaysReadingsSub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.continueBible,
      onPress: () => router.push('/catalog'),
    },
    {
      id: 'saint',
      title: t('content.saintOfTheDay'),
      subtitle: t('content.saintOfTheDaySub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.prayerOrthodox,
      onPress: () => router.push('/horologium'),
    },
    {
      id: 'feast',
      title: t('content.feastFast'),
      subtitle: t('content.feastFastSub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.continueLiturgy,
      onPress: () => router.push('/catalog'),
    },
    {
      id: 'prayer',
      title: t('content.dailyPrayer'),
      subtitle: t('content.dailyPrayerSub'),
      badgeLabel: t('calendar.today'),
      imageUri: SacredImagery.prayerDaily,
      onPress: () => router.push('/prayer/daily-prayer' as never),
    },
  ];

  return (
    <ScreenScrollView>
      <PageHeader title="Read" geez="መጽሐፍ" />

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder="Search books, chapters, prayers, and Scripture..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          recentSearches={recentSearches}
        />
      </View>

      {debouncedQuery ? (
        <>
          <ContentSearchResults
            heading="Books & sections"
            hits={headerHits.map((hit) => {
              const route = resolveReadHeaderRoute(hit.id, readLang);
              return {
                id: hit.id,
                title: hit.title,
                subtitle: hit.subtitle,
                isHeader: true,
                onPress: () => {
                  if (!route) return;
                  if (route.params) {
                    router.push({ pathname: route.pathname as never, params: route.params });
                  } else {
                    router.push(route.pathname as never);
                  }
                },
              };
            })}
            emptyLabel={undefined}
          />
          <ContentSearchResults
            heading="In text"
            hits={contentHits.map((hit) => ({
              id: hit.id,
              title: hit.title,
              subtitle: hit.subtitle,
              snippet: hit.snippet,
              onPress: () => {
                if (hit.horologiumHourId) {
                  router.push(`/horologium/${hit.horologiumHourId}` as never);
                  return;
                }
                if (hit.bookId && hit.chapter) {
                  router.push(scriptureChapterRoute(hit.bookId, hit.chapter, readLang, hit.verse));
                }
              },
            }))}
            loading={searchLoading}
            emptyLabel={
              headerHits.length === 0 && contentHits.length === 0 && !searchLoading
                ? 'No results found on Read.'
                : undefined
            }
          />
        </>
      ) : null}

      {/* Continue reading — pick up where you left off */}
      {entries.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader headerKey="continueReading" icon="book" />
          <BookshelfSection
            horizontal
            scrollProps={{
              onScroll: continueScrollHandler,
              onLayout: continueScrollLayout,
              onContentSizeChange: continueContentSizeChange,
            }}>
            {entries.map((entry) => {
              const progress = entry.totalChapters > 0 ? entry.chapter / entry.totalChapters : 0;

              if (isPrayerBookId(entry.bookId)) {
                const slug = prayerSlugFromBookId(entry.bookId);
                const title = entry.title || t('content.dailyPrayer');
                return (
                  <BookshelfBookCard
                    key={entry.bookId}
                    title={title}
                    subtitle={entry.subtitle || `${entry.chapter} / ${entry.totalChapters}`}
                    imageUri={SacredImagery.prayerDaily}
                    progress={progress}
                    onPress={() =>
                      router.push(`/prayer/${slug}/${entry.chapter}?lang=${entry.lang}` as never)
                    }
                    onRemove={() => void removeReadingProgress(entry.bookId)}
                    removeLabel={`Remove ${title}`}
                  />
                );
              }

              const book = getBibleBook(entry.bookId);
              const title = book ? getBookTitle(book, entry.lang) : t('content.holyBible');
              return (
                <BookshelfBookCard
                  key={entry.bookId}
                  title={title}
                  subtitle={`${t('scripture.chapter')} ${entry.chapter}`}
                  imageUri={SacredImagery.continueBible}
                  progress={progress}
                  onPress={() =>
                    router.push(scriptureChapterRoute(entry.bookId, entry.chapter, entry.lang))
                  }
                  onRemove={() => void removeReadingProgress(entry.bookId)}
                  removeLabel={`Remove ${title}`}
                />
              );
            })}
          </BookshelfSection>
          {entries.length > 2 ? (
            <View style={styles.railHint}>
              <HorizontalScrollIndicator values={continueScroll} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.section}>
          <SectionHeader headerKey="continueReading" icon="book" />
          <HolyBibleHeroCard
            title={t('content.holyBible')}
            subtitle={t('content.startReadingPrompt')}
            imageUri={SacredImagery.continueBible}
            width={featuredWidth}
            onPress={() => router.push('/catalog')}
          />
        </View>
      )}

      {/* Featured — daily discovery */}
      <View style={styles.section}>
        <SectionHeader headerKey="featured" icon="sparkle" />
        <FeaturedCarousel items={featuredItems} width={featuredWidth} autoRotateMs={3200} cardHeight={176} />
      </View>

      {/* Orthodox catalog — browse the library */}
      <View style={styles.section}>
        <SectionHeader
          headerKey="orthodoxCatalog"
          icon="scroll"
          onSeeAllPress={() => router.push('/read/catalog')}
        />
        <BookshelfSection
          horizontal
          scrollProps={{
            onScroll: catalogScrollHandler,
            onLayout: catalogScrollLayout,
            onContentSizeChange: catalogContentSizeChange,
          }}>
          {CATALOG_PREVIEW.map((book) => (
            <BookshelfBookCard
              key={book.id}
              title={t(`content.${book.titleKey}`)}
              subtitle={t(`content.${book.subKey}`)}
              imageUri={book.image}
              onPress={() => router.push(book.route)}
            />
          ))}
        </BookshelfSection>
        <View style={styles.railHint}>
          <HorizontalScrollIndicator values={catalogScroll} />
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginBottom: Layout.sectionContentBottom,
  },
  section: {
    marginBottom: Layout.sectionContentBottom,
  },
  railHint: {
    marginTop: 8,
    alignItems: 'center',
  },
});
