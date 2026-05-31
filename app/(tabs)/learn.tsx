import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { DidYouKnow } from '@/components/learn/did-you-know';
import { LearnCollectionCard } from '@/components/learn/learn-collection-card';
import { LearnFeaturedHero } from '@/components/learn/learn-featured-hero';
import { LearnRecentStrip } from '@/components/learn/learn-recent-strip';
import { LearnSearchResults } from '@/components/learn/learn-search-results';
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
  searchLearnLibrary,
  type LearnCollection,
  type LearnTopic,
} from '@/data/learnLibrary';
import { fetchDoctrineOutline } from '@/lib/doctrine';
import { learnText } from '@/lib/learn-i18n';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import { Layout, Space } from '@/constants/theme';

const MUTED_GOLD = '#8A8070';

const { width } = Dimensions.get('window');

export default function LearnScreen() {
  const { t, mode } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<LearnTopicFilter | null>(null);
  const { recentSearches, addRecentSearch } = useRecentSearches('learn');
  const [featuredIndex] = useState(0);
  const [doctrineCollections, setDoctrineCollections] = useState<LearnCollection[]>([]);

  // Load the doctrine outline from Supabase; subtopics become the lesson cards.
  // Falls back silently to the bundled library when unavailable/offline.
  useEffect(() => {
    let active = true;
    fetchDoctrineOutline()
      .then((topics) => {
        if (!active) return;
        const mapped: LearnCollection[] = topics
          .filter((topic) => topic.subtopics.length > 0)
          .map((topic) => ({
            id: topic.slug,
            titleEn: topic.title,
            // Amharic shown beside English in bilingual mode; '' => English only.
            titleAm: topic.titleAm ?? '',
            subtitleEn: '',
            subtitleAm: '',
            descriptionEn: `${topic.subtopics.length} lessons`,
            descriptionAm: `${topic.subtopics.length} ትምህርቶች`,
            icon: 'book',
            topics: topic.subtopics.map((sub) => ({
              id: sub.slug,
              slug: sub.slug,
              titleEn: sub.title,
              titleAm: sub.titleAm ?? '',
            })),
          }));
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

  const openLesson = (topic: LearnTopic) => {
    const slug = topic.slug ?? topic.id;
    router.push(`/learn/${slug}?title=${encodeURIComponent(topic.titleEn)}`);
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

  const searchGroups = useMemo(
    () => (effectiveQuery ? searchLearnLibrary(effectiveQuery) : []),
    [effectiveQuery]
  );

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
        <LearnSearchResults groups={searchGroups} />
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
