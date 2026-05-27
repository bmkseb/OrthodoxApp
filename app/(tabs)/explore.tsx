import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { DailyRhythmRow } from '@/components/explore/daily-rhythm-row';
import { ExploreAtmosphere } from '@/components/explore/explore-atmosphere';
import { ExploreQuickChips } from '@/components/explore/explore-quick-chips';
import { ExploreSectionFrame } from '@/components/explore/explore-section-frame';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { DevotionalProgressCard } from '@/components/sacred/devotional-progress-card';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { SacredSectionDivider } from '@/components/sacred/sacred-section-divider';
import { SacredReadingHeroCard } from '@/components/sacred/sacred-reading-hero-card';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { PrayerManuscriptCard } from '@/components/sacred/prayer-manuscript-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MediaListItem } from '@/components/ui/media-list-item';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SacredPageHeader } from '@/components/ui/bilingual-header';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { SacredImagery } from '@/constants/explore-content';
import { Layout, Palette, Space, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');
const PEEK_WIDTH = width * 0.78;

const CONTINUE_BOOKS = [
  { id: '1', titleKey: 'horologium' as const, subKey: 'horologiumSub' as const, image: SacredImagery.continueHorologium, progress: 0.35 },
  { id: '2', titleKey: 'holyBible' as const, subKey: 'holyBibleSub' as const, image: SacredImagery.continueBible, progress: 0.62 },
  { id: '3', titleKey: 'liturgy' as const, subKey: 'liturgySub' as const, image: SacredImagery.continueLiturgy, progress: 0.18 },
];

const PRAYERS = [
  { id: '1', key: 'dailyPrayer' as const, image: SacredImagery.prayerDaily },
  { id: '2', key: 'praisesMary' as const, image: SacredImagery.prayerMary },
  { id: '3', key: 'orthodoxPrayers' as const, image: SacredImagery.prayerOrthodox },
];

const HYMNS = [
  { id: '1', title: 'Covenant of Mercy', artist: 'Helena Alemu', image: SacredImagery.listenHymns },
  { id: '2', title: 'Your Graciousness has Sustained Me', artist: 'Various Artists', image: SacredImagery.prayerMary },
];

function ProfileAvatar({ initial, accentColor }: { initial: string; accentColor: string }) {
  return (
    <View style={styles.avatarRing}>
      <ThemedView variant="card" style={styles.avatar}>
        <ThemedText style={[styles.avatarText, { color: accentColor }]}>{initial}</ThemedText>
      </ThemedView>
    </View>
  );
}

export default function ExploreScreen() {
  const { t, ethiopicStyle, mode } = useTranslation();
  const amharicText = mode === 'am' ? ethiopicStyle : undefined;
  const iconColor = useThemeColor({}, 'icon');
  const accentColor = useThemeColor({}, 'tint');
  // Restrained meta: max 2-3 tags only per spec
  const readingMeta = [t('explore.dailyGospel'), t('explore.bookMatthew'), t('explore.minRead')];

  return (
    <View style={styles.screen}>
      <ExploreAtmosphere />
      <ScreenScrollView hideAtmosphere contentContainerStyle={styles.scroll} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.pageTitleWrap}>
            <SacredPageHeader headerKey="explore" />
          </View>
          <View style={styles.headerActions}>
            <OrthodoxPressable accessibilityLabel={t('settings.notifications')} accessibilityRole="button">
              <IconSymbol name="bell" size={20} color={iconColor} />
            </OrthodoxPressable>
            <SettingsNavButton color={iconColor} />
            <OrthodoxPressable accessibilityLabel={t('settings.profile')} accessibilityRole="button">
              <ProfileAvatar initial="B" accentColor={accentColor} />
            </OrthodoxPressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.block}>
          <SearchBar placeholder={t('common.searchScriptures')} recentSearches={['Matthew', 'Psalms']} />
        </View>

        {/* Quick access */}
        <View style={styles.blockTight}>
          <ExploreQuickChips />
        </View>

        {/* Greeting */}
        <View style={styles.blockTight}>
          <ThemedText style={[styles.greeting, amharicText]}>{t('greeting.hello', { name: 'Bamlak' })}</ThemedText>
          <ThemedText style={[styles.greetingSub, amharicText]}>{t('greeting.continueToday')}</ThemedText>
        </View>

        {/* Devotional streak */}
        <View style={styles.blockTight}>
          <DevotionalProgressCard streakDays={5} subtitle={t('common.devotionalRhythm')} />
        </View>

        {/* Daily rhythm */}
        <View style={styles.blockMedium}>
          <DailyRhythmRow />
        </View>

        <SacredSectionDivider />

        {/* Today's reading — visual centerpiece */}
        <ExploreSectionFrame headerKey="todaysReading" icon="book">
          <SacredReadingHeroCard
            featured
            title={t('content.matthew')}
            labelCapsule={t('explore.dailyGospel')}
            category={t('explore.bookMatthew')}
            imageUri={SacredImagery.readingHero}
            progress={0.4}
            metaLabels={readingMeta}
            style={styles.featuredHero}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={PEEK_WIDTH + Layout.cardGap}
            contentContainerStyle={styles.peekCarousel}>
            <SacredReadingHeroCard
              compact
              title={t('content.john')}
              imageUri={SacredImagery.readingJohn}
              progress={0.12}
              style={{ width: PEEK_WIDTH }}
            />
            <SacredReadingHeroCard
              compact
              title={t('content.psalms')}
              imageUri={SacredImagery.readingPsalms}
              progress={0.08}
              style={{ width: PEEK_WIDTH }}
            />
          </ScrollView>
        </ExploreSectionFrame>

        <SacredSectionDivider />

        {/* Prayer */}
        <ExploreSectionFrame headerKey="prayer" icon="sparkle">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peekCarousel}>
            {PRAYERS.map((prayer) => (
              <PrayerManuscriptCard
                key={prayer.id}
                title={t(`content.${prayer.key}`)}
                imageUri={prayer.image}
              />
            ))}
          </ScrollView>
        </ExploreSectionFrame>

        <SacredSectionDivider />

        {/* Hymns */}
        <ExploreSectionFrame headerKey="orthodoxHymns" icon="music">
          <View style={styles.hymnsSurface}>
            {HYMNS.map((hymn) => (
              <MediaListItem key={hymn.id} title={hymn.title} subtitle={hymn.artist} image={{ uri: hymn.image }} />
            ))}
          </View>
        </ExploreSectionFrame>

        <SacredSectionDivider />

        {/* Continue reading */}
        <ExploreSectionFrame title={t('explore.continueReading')} icon="book">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peekCarousel}>
            {CONTINUE_BOOKS.map((book) => (
              <ManuscriptBookCard
                key={book.id}
                title={t(`content.${book.titleKey}`)}
                subtitle={t(`content.${book.subKey}`)}
                imageUri={book.image}
                progress={book.progress}
              />
            ))}
          </ScrollView>
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
  scroll: {
    paddingBottom: Layout.sectionContentBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Space.s8,
    marginBottom: Space.s12,
  },
  pageTitleWrap: { flex: 1, minWidth: 0 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Space.s8 },
  block: { marginBottom: Space.s12 },
  blockTight: { marginBottom: Space.s8 },
  blockMedium: { marginBottom: Space.s12 },
  greeting: {
    ...Typography.cardTitle,
    color: Palette.text,
  },
  greetingSub: {
    color: ManuscriptTokens.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: Space.s4,
  },
  featuredHero: { marginBottom: Space.s12 },
  peekCarousel: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
    marginRight: -Layout.pagePadding,
  },
  hymnsSurface: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ManuscriptTokens.goldBorder,
    backgroundColor: Palette.surface,
    paddingVertical: Space.s4,
    paddingHorizontal: Space.s4,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ManuscriptTokens.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '600' },
});
