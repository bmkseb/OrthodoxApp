import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { DiscoverCanon } from '@/components/explore/discover-canon';
import { ExploreAtmosphere } from '@/components/explore/explore-atmosphere';
import { ExploreSectionFrame } from '@/components/explore/explore-section-frame';
import { PrayerStreakCard } from '@/components/explore/prayer-streak-card';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { SacredSectionDivider } from '@/components/sacred/sacred-section-divider';
import { MediaListItem } from '@/components/ui/media-list-item';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { ThemedText } from '@/components/themed-text';
import { SacredImagery } from '@/constants/explore-content';
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

const FEATURED_COLLECTIONS = [
  { id: 'lent', title: 'Great Lent Essentials', subtitle: 'Fasting season', image: SacredImagery.reflection, route: '/calendar' as const },
  { id: 'ethiopian', title: 'Ethiopian Saints', subtitle: 'Tewahedo', image: SacredImagery.continueLiturgy, route: '/calendar' as const },
  { id: 'archangels', title: 'The Archangels', subtitle: 'Heavenly hosts', image: SacredImagery.prayerOrthodox, route: '/learn' as const },
  { id: 'theotokos', title: 'Theotokos Collection', subtitle: 'St. Mary', image: SacredImagery.prayerMary, route: '/learn' as const },
  { id: 'pascha', title: 'Pascha Collection', subtitle: 'Resurrection', image: SacredImagery.readingHero, route: '/calendar' as const },
  { id: 'beginner', title: "Beginner's Orthodox Journey", subtitle: 'Start here', image: SacredImagery.readManuscript, route: '/learn' as const },
];

const SAINT_COLLECTIONS = [
  { id: 'week', title: 'Saint of the Week', subtitle: 'This week', image: SacredImagery.prayerMary },
  { id: 'popular', title: 'Popular Saints', subtitle: 'Most loved', image: SacredImagery.prayerOrthodox },
  { id: 'ethiopian', title: 'Ethiopian Saints', subtitle: 'Tewahedo', image: SacredImagery.continueLiturgy },
];

const PRAYER_LIBRARY = [
  { id: 'morning', title: 'Morning Prayers', image: SacredImagery.prayerDaily },
  { id: 'evening', title: 'Evening Prayers', image: SacredImagery.continueHorologium },
  { id: 'before-communion', title: 'Before Communion', image: SacredImagery.prayerOrthodox },
  { id: 'after-communion', title: 'After Communion', image: SacredImagery.prayerMary },
  { id: 'fasting', title: 'Fasting Prayers', image: SacredImagery.reflection },
];

const TOP_HYMNS = [
  { id: 'h1', title: 'Covenant of Mercy', artist: 'Helena Alemu', image: SacredImagery.listenHymns },
  { id: 'h2', title: 'Your Graciousness has Sustained Me', artist: 'Various Artists', image: SacredImagery.prayerMary },
  { id: 'h3', title: 'Blessed Art Thou, O Mary', artist: 'Tewahedo Choir', image: SacredImagery.listenMelodies },
];

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('explore');

  const quickAccess: QuickAccessItem[] = [
    { id: 'prayers', title: t('explore.catPrayers'), subtitle: 'Daily offices', icon: 'sun', onPress: () => router.push('/horologium') },
    { id: 'saints', title: t('explore.catSaints'), subtitle: 'Lives and feasts', icon: 'church', onPress: () => router.push('/calendar') },
    { id: 'hymns', title: t('explore.catHymns'), subtitle: 'Sacred melodies', icon: 'music', onPress: () => router.push('/listen') },
    { id: 'feasts', title: t('explore.catFeastsOnly'), subtitle: 'Calendar and fasts', icon: 'calendar', onPress: () => router.push('/calendar') },
    { id: 'fasts', title: t('explore.catFasts'), subtitle: 'Fasting seasons', icon: 'flame', onPress: () => router.push('/calendar') },
    {
      id: 'search',
      title: t('explore.catScripture'),
      subtitle: t('explore.catScriptureSearchSub'),
      icon: 'search',
      onPress: () => router.push('/read/catalog'),
    },
  ];

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
    router.push(`/catalog?q=${encodeURIComponent(term)}`);
  };

  return (
    <View style={styles.screen}>
      <ExploreAtmosphere />
      <ScreenScrollView
        hideAtmosphere
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
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

        {/* Quick access shortcut menu */}
        <ExploreSectionFrame title={t('explore.quickAccess')} icon="sparkle" compact>
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

        <SacredSectionDivider compact />

        {/* Prayer library — browse list */}
        <ExploreSectionFrame title={t('explore.prayerLibrary')} icon="cross" compact>
          <View style={styles.listSurface}>
            {PRAYER_LIBRARY.map((p) => (
              <MediaListItem
                key={p.id}
                title={p.title}
                subtitle={t('explore.catPrayers')}
                image={{ uri: p.image }}
                onPress={() => router.push('/horologium')}
              />
            ))}
          </View>
        </ExploreSectionFrame>

        <SacredSectionDivider compact />

        {/* Featured collections */}
        <ExploreSectionFrame title={t('explore.featuredCollections')} icon="scroll" compact>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {FEATURED_COLLECTIONS.map((c) => (
              <ManuscriptBookCard
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                imageUri={c.image}
                onPress={() => router.push(c.route)}
              />
            ))}
          </ScrollView>
        </ExploreSectionFrame>

        <SacredSectionDivider compact />

        {/* Discover the Canon */}
        <ExploreSectionFrame title={t('explore.discoverCanon')} icon="book" compact>
          <DiscoverCanon featuredLabel={t('explore.discoverCanon')} />
        </ExploreSectionFrame>

        <SacredSectionDivider compact />

        {/* Explore saints */}
        <ExploreSectionFrame title={t('explore.exploreSaints')} icon="church" compact>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {SAINT_COLLECTIONS.map((s) => (
              <ManuscriptBookCard
                key={s.id}
                title={s.title}
                subtitle={s.subtitle}
                imageUri={s.image}
                onPress={() => router.push('/calendar')}
              />
            ))}
          </ScrollView>
        </ExploreSectionFrame>

        <SacredSectionDivider compact />

        {/* Popular hymns — top 3, numbered, teaser into Listen */}
        <ExploreSectionFrame
          title={t('explore.popularHymns')}
          icon="music"
          compact
          onSeeAllPress={() => router.push('/listen')}>
          <View style={styles.listSurface}>
            {TOP_HYMNS.map((h, i) => (
              <View key={h.id} style={[styles.hymnRow, i === TOP_HYMNS.length - 1 && styles.hymnRowLast]}>
                <ThemedText style={styles.rank}>{i + 1}</ThemedText>
                <Image source={{ uri: h.image }} style={styles.hymnThumb} contentFit="cover" cachePolicy="memory-disk" />
                <View style={styles.hymnInfo}>
                  <ThemedText style={styles.hymnTitle} numberOfLines={1}>
                    {h.title}
                  </ThemedText>
                  <ThemedText type="muted" style={styles.hymnArtist} numberOfLines={1}>
                    {h.artist}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
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
  // Clear the floating mini player + tab bar so the last cards stay scrollable.
  scrollContent: { paddingBottom: 240 },
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
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
    marginRight: -Layout.pagePadding,
  },
  listSurface: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ManuscriptTokens.goldBorder,
    backgroundColor: Palette.surface,
    paddingVertical: Space.s12,
    paddingHorizontal: Space.s12,
  },
  hymnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s16,
    paddingVertical: Space.s12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(201, 147, 58, 0.14)',
  },
  hymnRowLast: {
    borderBottomWidth: 0,
  },
  rank: {
    width: 22,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Palette.gold,
  },
  hymnThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Palette.card,
  },
  hymnInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  hymnTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  hymnArtist: {
    fontSize: 13,
  },
});
