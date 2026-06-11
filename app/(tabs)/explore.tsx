import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { type IconName } from '@/components/Icon';
import { ExploreSectionFrame } from '@/components/explore/explore-section-frame';
import { PrayerStreakCard } from '@/components/explore/prayer-streak-card';
import { QuickAccessTile } from '@/components/explore/quick-access-tile';
import { WeeklyExplore } from '@/components/explore/weekly-explore';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { VerseOfTheDayCard } from '@/components/sacred/verse-of-the-day-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { Layout, Space } from '@/constants/theme';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';

const STREAK_DAYS = 14;

const QUICK_GAP = 10;
const QUICK_CARD_WIDTH =
  (Dimensions.get('window').width - Layout.pagePadding * 2 - QUICK_GAP) / 2;

type QuickAccessItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  onPress: () => void;
};

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('explore');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        block: { marginBottom: Layout.searchToSection },
        streakBlock: { marginBottom: Space.s12 },
        verseBlock: { marginTop: Space.s8 },
        quickGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: QUICK_GAP,
        },
      }),
    []
  );

  const quickAccess: QuickAccessItem[] = [
    { id: 'prayers', title: t('explore.catPrayers'), subtitle: 'Daily offices', icon: 'sun', onPress: () => router.push({ pathname: '/read/catalog', params: { genre: 'prayer' } }) },
    { id: 'saints', title: t('explore.catSaints'), subtitle: 'Lives and feasts', icon: 'church', onPress: () => router.push('/calendar') },
    { id: 'hymns', title: t('explore.catHymns'), subtitle: 'Sacred melodies', icon: 'music', onPress: () => router.push('/listen') },
    { id: 'feasts', title: t('explore.catFeasts'), subtitle: 'Feasts and fasting seasons', icon: 'calendar', onPress: () => router.push('/calendar') },
    {
      id: 'search',
      title: t('explore.catScripture'),
      subtitle: t('explore.catScriptureSearchSub'),
      icon: 'search',
      onPress: () => router.push('/read/catalog'),
    },
    { id: 'catechism', title: t('explore.catCatechism'), subtitle: 'Doctrine and teachings', icon: 'scroll', onPress: () => router.push('/learn/catalog') },
  ];

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
    router.push(`/catalog?q=${encodeURIComponent(term)}`);
  };

  return (
    <ScreenScrollView>
      <PageHeader title="Explore" geez="መርምር" />

        <View style={styles.block}>
          <SearchBar
            placeholder={t('explore.searchHub')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            recentSearches={recentSearches}
          />
        </View>

        <View style={styles.streakBlock}>
          <PrayerStreakCard
            title={t('explore.streakTitle', { count: STREAK_DAYS })}
            subtitle={t('explore.streakSubtitle')}
          />
        </View>

        <ExploreSectionFrame showDivider={false} style={styles.verseBlock}>
          <VerseOfTheDayCard hero showEyebrow eyebrowLabel="TODAY'S VERSE" />
        </ExploreSectionFrame>

        <ExploreSectionFrame title={t('explore.quickAccess')}>
          <View style={styles.quickGrid}>
            {quickAccess.map((item) => (
              <QuickAccessTile
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                width={QUICK_CARD_WIDTH}
                onPress={item.onPress}
              />
            ))}
          </View>
        </ExploreSectionFrame>

        <ExploreSectionFrame title="Weekly Explore">
          <WeeklyExplore />
        </ExploreSectionFrame>
    </ScreenScrollView>
  );
}
