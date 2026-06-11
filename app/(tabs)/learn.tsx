import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DailyTeachingShelf } from '@/components/learn/daily-teaching-shelf';
import { LearnCatalogShelf } from '@/components/learn/learn-catalog-shelf';
import { SavedLearnContent } from '@/components/learn/saved-learn-content';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { SoftRailCard } from '@/components/ui/soft-rail-card';
import {
  LEARN_COLLECTIONS,
  LEARN_FEATURED,
  type LearnCollection,
  type LearnTopic,
} from '@/data/learnLibrary';
import { ContentSearchResults } from '@/components/search/content-search-results';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { resolveLearnTopic, searchLearnHeaders, findFirstLesson } from '@/lib/learn-search';
import { buildFaithAndOrderShelf, type LearnShelfLesson } from '@/lib/learn-catalog-shelves';
import { resolveDailyTeaching } from '@/lib/daily-teaching';
import { useTodayDailyTeachingCompleted } from '@/hooks/use-daily-teaching-completion';
import {
  countDoctrineLessons,
  fetchDoctrineOutline,
  searchDoctrinePassages,
  type DoctrineSearchResult,
  type DoctrineSubtopic,
} from '@/lib/doctrine';
import { learnText } from '@/lib/learn-i18n';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import {
  removeLearningProgress,
  useLearningProgress,
} from '@/hooks/use-learning-progress';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useSavedTeachings } from '@/hooks/use-saved-teachings';
import { useTranslation } from '@/hooks/use-translation';
import { Layout, Space } from '@/constants/theme';

const MUTED_GOLD = '#8A8070';
const SAVED_PREVIEW_LIMIT = 3;

const { width } = Dimensions.get('window');

function mapDoctrineSubtopic(sub: DoctrineSubtopic): LearnTopic {
  return {
    id: sub.slug,
    slug: sub.slug,
    titleEn: sub.title,
    titleAm: sub.titleAm ?? '',
    passageCount: sub.passageCount,
    children: sub.children.map(mapDoctrineSubtopic),
  };
}

const FEATURED_KEYWORDS: Record<string, string> = {
  trinity: 'trinity',
  eucharist: 'eucharist',
  '7-heavens': 'heaven',
  'holy-cross': 'cross',
};

function findRealLessonByKeyword(
  collections: LearnCollection[],
  needle: string
): { topic: LearnTopic; collection: LearnCollection } | null {
  const lc = needle.trim().toLowerCase();
  if (!lc) return null;
  for (const collection of collections) {
    const stack: LearnTopic[] = [...collection.topics];
    while (stack.length) {
      const topic = stack.shift() as LearnTopic;
      if (topic.children?.length) stack.push(...topic.children);
      if (!topic.titleEn.toLowerCase().includes(lc)) continue;
      const resolved = resolveLearnTopic(topic);
      if (resolved.slug && (resolved.passageCount ?? 1) > 0) {
        return { topic: resolved, collection };
      }
    }
  }
  return null;
}

function firstLessonAnywhere(
  collections: LearnCollection[]
): { topic: LearnTopic; collection: LearnCollection } | null {
  for (const collection of collections) {
    const lesson = findFirstLesson(collection);
    if (lesson) return { topic: lesson, collection };
  }
  return null;
}

export default function LearnScreen() {
  const { t, mode } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('learn');
  const [doctrineCollections, setDoctrineCollections] = useState<LearnCollection[]>([]);
  const [passageHits, setPassageHits] = useState<DoctrineSearchResult[]>([]);
  const [passageSearchLoading, setPassageSearchLoading] = useState(false);
  const featuredWidth = width - Layout.pagePadding * 2;

  const {
    values: continueScroll,
    scrollHandler: continueScrollHandler,
    onLayout: continueScrollLayout,
    onContentSizeChange: continueContentSizeChange,
  } = useHorizontalScrollIndicator();

  useEffect(() => {
    let active = true;
    fetchDoctrineOutline()
      .then((topics) => {
        if (!active) return;
        const mapped: LearnCollection[] = topics
          .filter((topic) => topic.subtopics.length > 0)
          .map((topic) => {
            const topicsTree = topic.subtopics.map(mapDoctrineSubtopic);
            const lessonCount = countDoctrineLessons(topic.subtopics);
            return {
              id: topic.slug,
              titleEn: topic.title,
              titleAm: topic.titleAm ?? '',
              subtitleEn: '',
              subtitleAm: '',
              descriptionEn: `${lessonCount} lessons`,
              descriptionAm: `${lessonCount} ትምህርቶች`,
              icon: 'book',
              topics: topicsTree,
            };
          });
        setDoctrineCollections(mapped);
      })
      .catch(() => {
        // Keep the bundled fallback on any fetch/RLS error.
      });
    return () => {
      active = false;
    };
  }, []);

  const collectionsToRender =
    doctrineCollections.length > 0 ? doctrineCollections : LEARN_COLLECTIONS;

  const openLesson = (
    topic: LearnTopic,
    passageNumber?: number,
    seriesTitle?: string
  ) => {
    const slug = topic.slug ?? topic.id;
    const params = new URLSearchParams({ title: topic.titleEn });
    if (seriesTitle) params.set('series', seriesTitle);
    if (passageNumber) params.set('passage', String(passageNumber));
    router.push(`/learn/${slug}?${params.toString()}`);
  };

  const openShelfLesson = (lesson: LearnShelfLesson) => {
    openLesson(
      lesson.topic,
      undefined,
      learnText(lesson.collection.titleEn, lesson.collection.titleAm, mode)
    );
  };

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
  };

  const featuredItems = useMemo<FeaturedItem[]>(() => {
    const fallback = firstLessonAnywhere(collectionsToRender);
    return LEARN_FEATURED.map((f) => {
      const category = learnText(f.categoryEn, f.categoryAm, mode);
      const needle = FEATURED_KEYWORDS[f.id] ?? f.titleEn;
      const target = findRealLessonByKeyword(collectionsToRender, needle) ?? fallback;
      return {
        id: f.id,
        title: learnText(f.titleEn, f.titleAm, mode),
        subtitle: category,
        badgeLabel: `${f.readMin} min`,
        imageUri: f.imageUri,
        onPress: () => {
          if (!target) return;
          openLesson(
            target.topic,
            undefined,
            learnText(target.collection.titleEn, target.collection.titleAm, mode)
          );
        },
      };
    });
  }, [collectionsToRender, mode]);

  const effectiveQuery = searchQuery.trim();
  const debouncedQuery = useDebouncedValue(effectiveQuery, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setPassageHits([]);
      setPassageSearchLoading(false);
      return;
    }

    let active = true;
    setPassageSearchLoading(true);
    searchDoctrinePassages(debouncedQuery)
      .then((hits) => {
        if (active) setPassageHits(hits);
      })
      .catch(() => {
        if (active) setPassageHits([]);
      })
      .finally(() => {
        if (active) setPassageSearchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const searchHeaders = useMemo(() => {
    if (!effectiveQuery) return [];
    return searchLearnHeaders(collectionsToRender, effectiveQuery, mode);
  }, [effectiveQuery, collectionsToRender, mode]);

  const { entries: continueEntries } = useLearningProgress();
  const { entries: savedEntries } = useSavedTeachings();

  const catechismShelf = useMemo(
    () => buildFaithAndOrderShelf(collectionsToRender, mode),
    [collectionsToRender, mode]
  );

  const dailyTeaching = useMemo(() => resolveDailyTeaching(new Date(), mode), [mode]);
  const { completed: dailyCompleted } = useTodayDailyTeachingCompleted();

  const showSavedSeeAll = savedEntries.length > SAVED_PREVIEW_LIMIT;
  const showLibrary = !effectiveQuery;

  return (
    <ScreenScrollView>
      <PageHeader title="Learn" geez="ትምህርት" />

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={t('learn.searchLearn')}
          placeholderTextColor={MUTED_GOLD}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          recentSearches={recentSearches}
        />
      </View>

      {recentSearches.length > 0 ? (
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {recentSearches.map((term) => (
              <OrthodoxPressable
                key={term}
                accessibilityRole="button"
                onPress={() => setSearchQuery(term)}
                style={styles.chip}>
                <Text style={styles.chipLabel} numberOfLines={1} allowFontScaling={false}>
                  {term}
                </Text>
              </OrthodoxPressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {showLibrary ? (
        <>
          <View style={styles.section}>
            <SectionHeader headerKey="featured" icon="sparkle" />
            <FeaturedCarousel
              items={featuredItems}
              width={featuredWidth}
              autoRotateMs={3200}
              cardHeight={Layout.featuredCardHeight}
            />
          </View>

          {continueEntries.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader headerKey="learn.continueLearning" icon="book" />
              <BookshelfSection
                horizontal
                scrollProps={{
                  onScroll: continueScrollHandler,
                  onLayout: continueScrollLayout,
                  onContentSizeChange: continueContentSizeChange,
                }}>
                {continueEntries.map((entry) => (
                  <SoftRailCard
                    key={entry.slug}
                    title={entry.title}
                    subtitle={entry.subtitle}
                    progress={entry.progress}
                    onPress={() =>
                      openLesson(
                        { id: entry.slug, slug: entry.slug, titleEn: entry.title, titleAm: '' },
                        undefined,
                        entry.subtitle
                      )
                    }
                    onRemove={() => void removeLearningProgress(entry.slug)}
                    removeLabel={`Remove ${entry.title}`}
                  />
                ))}
              </BookshelfSection>
              {continueEntries.length > 2 ? (
                <View style={styles.railHint}>
                  <HorizontalScrollIndicator values={continueScroll} />
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader
              headerKey="learn.learningCatalog"
              icon="scroll"
              onSeeAllPress={() => router.push('/learn/catalog' as never)}
            />
            <DailyTeachingShelf
              title={dailyTeaching.title}
              category={dailyTeaching.category}
              dateLabel={dailyTeaching.dateLabel}
              readMin={dailyTeaching.teaching.readMin}
              completed={dailyCompleted}
              onPress={() => router.push('/learn/daily' as never)}
            />
            <LearnCatalogShelf
              title={t('learn.catechism')}
              items={catechismShelf}
              onSeeAll={() => router.push('/learn/catalog' as never)}
              onLessonPress={openShelfLesson}
            />
          </View>

          <View style={[styles.section, styles.lastSection]}>
            <SectionHeader
              headerKey="learn.savedTeachings"
              icon="bookmark-filled"
              onSeeAllPress={
                showSavedSeeAll ? () => router.push('/learn/saved' as never) : undefined
              }
            />
            <SavedLearnContent previewLimit={SAVED_PREVIEW_LIMIT} />
          </View>
        </>
      ) : (
        <>
          <ContentSearchResults
            heading="Topics & lessons"
            hits={searchHeaders.map((hit) => ({
              id: hit.id,
              title: hit.title,
              subtitle: hit.subtitle,
              isHeader: true,
              onPress: () => {
                const target = resolveLearnTopic(hit.topic);
                if (target.slug && target.slug !== hit.collection.id) {
                  openLesson(target);
                  return;
                }
                const first = findFirstLesson(hit.collection);
                if (first) openLesson(first);
              },
            }))}
            emptyLabel={undefined}
          />
          <ContentSearchResults
            heading="In teachings"
            hits={passageHits.map((hit) => ({
              id: `${hit.subtopicSlug}-${hit.passageNumber}`,
              title: hit.subtopic,
              subtitle: `Passage ${hit.passageNumber}`,
              snippet: hit.snippet,
              onPress: () =>
                openLesson(
                  {
                    id: hit.subtopicSlug,
                    slug: hit.subtopicSlug,
                    titleEn: hit.subtopic,
                    titleAm: '',
                  },
                  hit.passageNumber
                ),
            }))}
            loading={passageSearchLoading}
            emptyLabel={
              searchHeaders.length === 0 &&
              passageHits.length === 0 &&
              !passageSearchLoading
                ? t('learn.noResults')
                : undefined
            }
          />
        </>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: Space.s16 },
  filterWrap: { marginBottom: Layout.sectionHeaderBottom },
  section: { marginBottom: Layout.sectionContentBottom },
  lastSection: { marginBottom: 0 },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    paddingRight: Layout.pagePadding,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.3)',
    backgroundColor: 'transparent',
  },
  chipLabel: {
    fontSize: 13,
    letterSpacing: 0.1,
    color: MUTED_GOLD,
    fontWeight: '500',
  },
  railHint: {
    marginTop: Space.s8,
    alignItems: 'center',
  },
});
