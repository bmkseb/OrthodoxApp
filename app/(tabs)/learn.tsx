import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { LearnCollectionCard } from '@/components/learn/learn-collection-card';
import { LearnFeaturedHero } from '@/components/learn/learn-featured-hero';
import { LearnRecentStrip } from '@/components/learn/learn-recent-strip';
import { LearnSearchResults } from '@/components/learn/learn-search-results';
import { LearnTeachingCard } from '@/components/learn/learn-teaching-card';
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
} from '@/data/learnLibrary';
import { learnText } from '@/lib/learn-i18n';
import { SacredPageHeader } from '@/components/ui/bilingual-header';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { Layout, Space, Typography } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function LearnScreen() {
  const { t, mode } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredIndex] = useState(0);

  const featured = getFeatured(featuredIndex);
  const featuredTitle = learnText(featured.titleEn, featured.titleAm, mode);
  const featuredCategory = learnText(featured.categoryEn, featured.categoryAm, mode);

  const searchGroups = useMemo(
    () => (searchQuery.trim() ? searchLearnLibrary(searchQuery) : []),
    [searchQuery]
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

  const showLibrary = !searchQuery.trim();

  return (
    <ScreenScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.pageHeader}>
        <View style={styles.pageTitleRow}>
          <View style={styles.pageIconRail}>
            <Icon name="brain" size={20} />
          </View>
          <SacredPageHeader headerKey="learn" />
        </View>
        <SettingsNavButton />
      </View>
      <ThemedText type="muted" style={styles.pageSubtitle}>
        {t('learn.librarySubtitle')}
      </ThemedText>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={t('learn.searchLearn')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          recentSearches={['Trinity', 'Eucharist', 'Mary', 'Cross', 'Fasting']}
        />
      </View>

      {showLibrary ? (
        <>
          <SectionHeader title={t('learn.featuredTopic')} icon="sparkle" />
          <LearnFeaturedHero
            title={featuredTitle}
            category={featuredCategory}
            readMin={featured.readMin}
            imageUri={featured.imageUri}
            style={{ width: width - Layout.pagePadding * 2, marginBottom: Layout.sectionHeaderBottom }}
          />

          <SectionHeader title={t('learn.sacredCollections')} icon="pillar" />
          {LEARN_COLLECTIONS.map((collection, index) => (
            <LearnCollectionCard
              key={collection.id}
              collection={collection}
              defaultExpanded={index === 0}
            />
          ))}

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
  scroll: { paddingBottom: Layout.sectionContentBottom },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Space.s4,
    gap: Space.s8,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  pageIconRail: {
    width: Layout.iconRailWidth,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  pageSubtitle: {
    marginBottom: Layout.headerContentGap,
    marginLeft: Layout.iconRailWidth,
    ...Typography.body,
    fontSize: 13,
    color: undefined,
  },
  searchWrap: { marginBottom: Layout.sectionHeaderBottom },
  savedList: { gap: 0 },
});
