import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExploreAtmosphere } from '@/components/explore/explore-atmosphere';
import { ExploreQuickChips } from '@/components/explore/explore-quick-chips';
import { ExploreSectionFrame } from '@/components/explore/explore-section-frame';
import { TodaysDevotionGrid } from '@/components/explore/todays-devotion-grid';
import { TodaysGospelCard } from '@/components/explore/todays-gospel-card';
import { BilingualHeader } from '@/components/orthodox/BilingualHeader';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { DevotionalProgressCard } from '@/components/sacred/devotional-progress-card';
import { ManuscriptBookCard } from '@/components/sacred/manuscript-book-card';
import { SacredSectionDivider } from '@/components/sacred/sacred-section-divider';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { PrayerManuscriptCard } from '@/components/sacred/prayer-manuscript-card';
import { ThemedText } from '@/components/themed-text';
import { MediaListItem } from '@/components/ui/media-list-item';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SacredImagery } from '@/constants/explore-content';
import { Layout, Palette, Space, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

const MUTED_GOLD = '#8A8070';

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

export default function ExploreScreen() {
  const { t, ethiopicStyle, mode } = useTranslation();
  const amharicText = mode === 'am' ? ethiopicStyle : undefined;

  return (
    <View style={styles.screen}>
      <ExploreAtmosphere />
      <ScreenScrollView hideAtmosphere contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <PageHeader title="Explore" />

        {/* Search */}
        <View style={styles.block}>
          <SearchBar
            placeholder={t('common.searchScriptures')}
            placeholderTextColor={MUTED_GOLD}
          />
        </View>

        {/* Filter pills (Daily Reading / Prayer / Hymns) */}
        <View style={styles.blockTight}>
          <ExploreQuickChips />
        </View>

        {/* Greeting */}
        <View style={styles.blockTight}>
          <ThemedText style={[styles.greeting, amharicText]}>{t('greeting.hello', { name: 'Bamlak' })}</ThemedText>
          <ThemedText style={[styles.greetingSub, amharicText]}>{t('greeting.continueToday')}</ThemedText>
        </View>

        {/* Devotional streak */}
        <View style={styles.blockMedium}>
          <DevotionalProgressCard streakDays={5} subtitle={t('common.devotionalRhythm')} />
        </View>

        {/* "ቃል | Logos" — single focused reading for today */}
        <View style={styles.todaysBlock}>
          <BilingualHeader amharic="ቃል" english="Logos" />
          <Text style={styles.logosSubtitle} allowFontScaling={false}>
            The Word for today
          </Text>
          <TodaysGospelCard
            title="Book of Matthew"
            subtitle="Chapter 7-10"
            chipLabel={t('explore.dailyGospel').toUpperCase()}
            minutesLabel="12 MIN"
            progress={0.4}
            imageUri={SacredImagery.readingHero}
          />
        </View>

        {/* "ቅዱስ | Today's Devotion" — three-card row (saint / lectionary / hymn) */}
        <View style={styles.devotionBlock}>
          <TodaysDevotionGrid />
        </View>

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
  block: { marginBottom: Space.s12 },
  blockTight: { marginBottom: Space.s8 },
  blockMedium: { marginBottom: Space.s16 },
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
  todaysBlock: {
    marginBottom: Layout.sectionContentBottom,
  },
  devotionBlock: {
    marginBottom: Layout.sectionContentBottom,
  },
  logosSubtitle: {
    marginTop: 4,
    marginBottom: Space.s12,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: MUTED_GOLD,
  },
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
});
