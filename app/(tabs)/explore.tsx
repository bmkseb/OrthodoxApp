import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { ExploreSectionFrame } from '@/components/explore/explore-section-frame';
import { PrayerStreakCard } from '@/components/explore/prayer-streak-card';
import { WeeklyExplore } from '@/components/explore/weekly-explore';
import { DidYouKnow } from '@/components/learn/did-you-know';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { VerseOfTheDayCard } from '@/components/sacred/verse-of-the-day-card';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';

const MUTED_GOLD = '#8A8070';
const STREAK_DAYS = 14;

// Two-column Quick Access grid sizing.
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
    <View style={styles.screen}>
      <ScreenScrollView style={styles.scrollView}>
        <PageHeader title="Explore" geez="መርምር" />

        {/* Search — top of the page */}
        <View style={styles.block}>
          <SearchBar
            placeholder={t('explore.searchHub')}
            placeholderTextColor={MUTED_GOLD}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            recentSearches={recentSearches}
          />
        </View>

        {/* Prayer streak — personal hero */}
        <View style={styles.streakBlock}>
          <PrayerStreakCard
            title={t('explore.streakTitle', { count: STREAK_DAYS })}
            subtitle={t('explore.streakSubtitle')}
          />
        </View>

        {/* Verse of the day — daily scripture ritual */}
        <ExploreSectionFrame title="Verse of the Day" icon="book">
          <VerseOfTheDayCard />
        </ExploreSectionFrame>

        {/* Quick access shortcut menu */}
        <ExploreSectionFrame title={t('explore.quickAccess')} icon="sparkle">
          <View style={styles.quickGrid}>
            {quickAccess.map((item) => (
              <OrthodoxPressable
                key={item.id}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={styles.quickCard}>
                <View style={styles.quickIcon}>
                  <Icon name={item.icon} size={20} color={Palette.gold} />
                </View>
                <View style={styles.quickTextBlock}>
                  <ThemedText style={styles.quickTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.quickSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </ThemedText>
                </View>
              </OrthodoxPressable>
            ))}
          </View>
        </ExploreSectionFrame>

        {/* Did You Know — canon and tradition facts */}
        <ExploreSectionFrame headerKey="learn.didYouKnow" icon="sparkle">
          <DidYouKnow />
        </ExploreSectionFrame>

        {/* Weekly Explore — curated, rotating highlights */}
        <ExploreSectionFrame title="Weekly Explore" icon="sparkle" style={styles.lastSection}>
          <WeeklyExplore />
        </ExploreSectionFrame>
      </ScreenScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  block: { marginBottom: Space.s16 },
  streakBlock: { marginBottom: Space.s12 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: QUICK_GAP,
  },
  quickCard: {
    width: QUICK_CARD_WIDTH,
    minHeight: 80,
    borderRadius: 18,
    backgroundColor: Palette.surfaceWarm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.18)',
    paddingHorizontal: Space.s12,
    paddingVertical: Space.s8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
    flexShrink: 0,
  },
  quickTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  quickTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.2,
  },
  quickSubtitle: {
    fontSize: 11,
    color: MUTED_GOLD,
  },
  lastSection: {
    marginBottom: 0,
  },
});
