import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { DidYouKnow } from '@/components/learn/did-you-know';
import { LearnCollectionCard } from '@/components/learn/learn-collection-card';
import { LearnFeaturedHero } from '@/components/learn/learn-featured-hero';
import { LearnRecentStrip } from '@/components/learn/learn-recent-strip';
import { LearnTeachingCard } from '@/components/learn/learn-teaching-card';
import {
  LearnTopicFilters,
  type LearnTopicFilter,
} from '@/components/learn/learn-topic-filters';
import { BilingualHeader } from '@/components/orthodox/BilingualHeader';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { SacredSectionDivider } from '@/components/sacred/sacred-section-divider';
import {
  LEARN_COLLECTIONS,
  LEARN_CONTINUE_ID,
  LEARN_DAILY_ID,
  LEARN_RECENT_IDS,
  LEARN_SAVED_IDS,
  findTopicById,
  getFeatured,
  type LearnCollection,
  type LearnTopic,
} from '@/data/learnLibrary';
import { ContentSearchResults } from '@/components/search/content-search-results';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { resolveLearnTopic, searchLearnHeaders, findFirstLesson } from '@/lib/learn-search';
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
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import { Layout, Space } from '@/constants/theme';

const MUTED_GOLD = '#8A8070';

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

export default function LearnScreen() {
  const { t, mode } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<LearnTopicFilter | null>(null);
  const { recentSearches, addRecentSearch } = useRecentSearches('learn');
  const [featuredIndex] = useState(0);
  const [doctrineCollections, setDoctrineCollections] = useState<LearnCollection[]>([]);
  const [passageHits, setPassageHits] = useState<DoctrineSearchResult[]>([]);
  const [passageSearchLoading, setPassageSearchLoading] = useState(false);

  // Load the doctrine outline from Supabase; subtopics become the lesson cards.
  // Falls back silently to the bundled library when unavailable/offline.
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

  const openLesson = (topic: LearnTopic, passageNumber?: number) => {
    const slug = topic.slug ?? topic.id;
    const params = new URLSearchParams({ title: topic.titleEn });
    if (passageNumber) params.set('passage', String(passageNumber));
    router.push(`/learn/${slug}?${params.toString()}`);
  };

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
  };

  const featured = getFeatured(featuredIndex);
  const featuredTitle = learnText(featured.titleEn, featured.titleAm, mode);
  const featuredCategory = learnText(featured.categoryEn, featured.categoryAm, mode);

  // The free-text search wins; an active topic filter acts as a quick-pick
  // for the same search input, so changing one clears the other.
  const effectiveQuery = searchQuery.trim() || topicFilter || '';
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

  const recentItems = useMemo(
    () =>
      LEARN_RECENT_IDS.map((id) => {
        const found = findTopicById(id);
        if (!found) return null;
        return {
          id,
          title: learnText(found.topic.titleEn, found.topic.titleAm, mode),
          collection: learnText(found.collection.titleEn, found.collection.titleAm, mode),
        };
      }).filter(Boolean) as { id: string; title: string; collection: string }[],
    [mode]
  );

  const continueTopic = findTopicById(LEARN_CONTINUE_ID);
  const dailyTopic = findTopicById(LEARN_DAILY_ID);

  const savedItems = useMemo(
    () =>
      LEARN_SAVED_IDS.map((id) => findTopicById(id)).filter(Boolean) as NonNullable<
        ReturnType<typeof findTopicById>
      >[],
    []
  );

  const showLibrary = !effectiveQuery;

  return (
    <ScreenScrollView>
      <PageHeader title="Learn" geez="ትምህርት" />

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={t('learn.searchLearn')}
          placeholderTextColor={MUTED_GOLD}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.trim()) setTopicFilter(null);
          }}
          onSearchSubmit={handleSearchSubmit}
          recentSearches={recentSearches}
        />
      </View>

      <View style={styles.filterWrap}>
        <LearnTopicFilters
          activeFilter={topicFilter}
          onChange={(filter) => {
            setTopicFilter(filter);
            if (filter) setSearchQuery('');
          }}
        />
      </View>

      {showLibrary ? (
        <>
          <View style={styles.sectionHeader}>
            <BilingualHeader amharic="ዋና" english="Featured Teaching" />
          </View>
          <LearnFeaturedHero
            title={featuredTitle}
            category={featuredCategory}
            readMin={featured.readMin}
            imageUri={featured.imageUri}
            // TODO: Replace with properly licensed Ethiopian Orthodox imagery
            // (authentic ሥላሴ / Trinity iconography, Ethiopian liturgical art).
            // The Trinity card was previously falling back to an Italian coastal village stock photo.
            placeholder={featured.id === 'trinity' ? 'trinity' : undefined}
            style={{ width: width - Layout.pagePadding * 2, marginBottom: Layout.sectionHeaderBottom }}
          />

          <View style={styles.sectionHeader}>
            <BilingualHeader amharic="ስብስብ" english="Sacred Collections" />
          </View>
          {collectionsToRender.map((collection, index) => (
            <LearnCollectionCard
              key={collection.id}
              collection={collection}
              defaultExpanded={index === 0}
              onTopicPress={(topic) => openLesson(topic)}
            />
          ))}

          <SacredSectionDivider />

          <SectionHeader title="Did You Know?" icon="sparkle" />
          <DidYouKnow />

          <SacredSectionDivider />

          <SectionHeader title={t('learn.recentlyStudied')} icon="scroll" />
          <LearnRecentStrip items={recentItems} />

          {continueTopic ? (
            <>
              <SectionHeader title={t('learn.continueLearning')} icon="book" />
              <LearnTeachingCard
                label={t('learn.continueLearning')}
                title={learnText(continueTopic.topic.titleEn, continueTopic.topic.titleAm, mode)}
                readMin={continueTopic.topic.readMin}
              />
            </>
          ) : null}

          {dailyTopic ? (
            <>
              <SectionHeader title={t('learn.dailyTeaching')} icon="sun" />
              <LearnTeachingCard
                label={t('learn.dailyTeaching')}
                title={learnText(dailyTopic.topic.titleEn, dailyTopic.topic.titleAm, mode)}
                readMin={dailyTopic.topic.readMin}
              />
            </>
          ) : null}

          {savedItems.length > 0 ? (
            <>
              <SectionHeader title={t('learn.savedTeachings')} icon="bookmark" />
              <View style={styles.savedList}>
                {savedItems.map(({ topic, collection }) => (
                  <LearnTeachingCard
                    key={topic.id}
                    label={learnText(collection.titleEn, collection.titleAm, mode)}
                    title={learnText(topic.titleEn, topic.titleAm, mode)}
                    readMin={topic.readMin}
                  />
                ))}
              </View>
            </>
          ) : null}
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
  searchWrap: { marginBottom: Space.s12 },
  filterWrap: { marginBottom: Layout.sectionHeaderBottom },
  sectionHeader: { marginBottom: Space.s12 },
  savedList: { gap: 0 },
});
