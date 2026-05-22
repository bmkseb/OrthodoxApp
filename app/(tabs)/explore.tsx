import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ExploreMicroNote } from '@/components/explore/explore-micro-note';
import { ExploreSectionFrame } from '@/components/explore/explore-section-frame';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { DevotionalProgressCard } from '@/components/sacred/devotional-progress-card';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { PrayerManuscriptCard } from '@/components/sacred/prayer-manuscript-card';
import { SacredReadingHeroCard } from '@/components/sacred/sacred-reading-hero-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MediaListItem } from '@/components/ui/media-list-item';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

const { width } = Dimensions.get('window');
const STREAK_DAYS = 5;
const HERO_IMAGE = 'https://picsum.photos/900/500?random=1';

const MORE_READINGS = [
  { id: '2', key: 'john' as const, image: 'https://picsum.photos/400/300?random=2' },
  { id: '3', key: 'psalms' as const, image: 'https://picsum.photos/400/300?random=3' },
];

const PRAYERS = [
  { id: '1', key: 'dailyPrayer' as const, image: 'https://picsum.photos/200/200?random=7' },
  { id: '2', key: 'praisesMary' as const, image: 'https://picsum.photos/200/200?random=8' },
  { id: '3', key: 'orthodoxPrayers' as const, image: 'https://picsum.photos/200/200?random=9' },
  { id: '4', key: 'morningPrayer' as const, image: 'https://picsum.photos/200/200?random=10' },
];

const HYMNS = [
  { id: '1', title: 'Covenant of Mercy', artist: 'Helena Alemu', image: 'https://picsum.photos/80/80?random=13' },
  { id: '2', title: 'Your Graciousness has Sustained Me', artist: 'Various Artists', image: 'https://picsum.photos/80/80?random=14' },
  { id: '3', title: 'Holy Holy Holy', artist: 'Orthodox Choir', image: 'https://picsum.photos/80/80?random=15' },
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
  const { t, typography, ethiopicStyle, mode } = useTranslation();
  const amharicText = mode === 'am' ? ethiopicStyle : undefined;
  const iconColor = useThemeColor({}, 'icon');
  const accentColor = useThemeColor({}, 'tint');

  return (
    <ScreenScrollView>
      <LinearGradient
        colors={['rgba(201, 147, 58, 0.03)', 'transparent']}
        style={styles.atmosphereTop}
        pointerEvents="none"
      />

      <View style={styles.pageIntro}>
        <View style={styles.header}>
          <BilingualHeader headerKey="explore" variant="page" />
          <View style={styles.headerActions}>
            <OrthodoxPressable accessibilityLabel={t('settings.notifications')} accessibilityRole="button">
              <IconSymbol name="bell" size={22} color={iconColor} />
            </OrthodoxPressable>
            <SettingsNavButton color={iconColor} />
            <OrthodoxPressable accessibilityLabel={t('settings.profile')} accessibilityRole="button">
              <ProfileAvatar initial="B" accentColor={accentColor} />
            </OrthodoxPressable>
          </View>
        </View>

        <SearchBar placeholder={t('common.searchScriptures')} recentSearches={['Matthew', 'Psalms']} />

        <View style={styles.greetingContainer}>
          <ThemedText style={[styles.greeting, typography.section, amharicText]}>
            {t('greeting.hello', { name: 'Bamlak' })}
          </ThemedText>
          <ThemedText style={[styles.greetingSub, typography.subtitle, amharicText]}>
            {t('greeting.continueToday')}
          </ThemedText>
        </View>

        <DevotionalProgressCard
          streakDays={STREAK_DAYS}
          subtitle={t('common.devotionalRhythm')}
        />
      </View>

      <ExploreMicroNote text={t('explore.liturgicalNote')} icon="sun" />

      <ExploreSectionFrame headerKey="todaysReading" icon="book" showSeparator>
        <ExploreMicroNote text={t('explore.scriptureHighlight')} icon="scroll" />
        <SacredReadingHeroCard
          title={t('content.matthew')}
          imageUri={HERO_IMAGE}
          progress={0.4}
          metadata={t('common.dailyReading')}
          style={styles.hero}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {MORE_READINGS.map((reading) => (
            <SacredReadingHeroCard
              key={reading.id}
              compact
              title={t(`content.${reading.key}`)}
              imageUri={reading.image}
              progress={0.15}
              style={{ width: width * 0.72 }}
            />
          ))}
        </ScrollView>
      </ExploreSectionFrame>

      <ExploreMicroNote text={t('explore.saintCommemoration')} icon="cross" />

      <ExploreSectionFrame headerKey="prayer" icon="sparkle" showSeparator>
        <ExploreMicroNote text={t('explore.fastingIndicator')} icon="church" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {PRAYERS.map((prayer) => (
            <View key={prayer.id} style={styles.prayerCard}>
              <PrayerManuscriptCard title={t(`content.${prayer.key}`)} imageUri={prayer.image} />
            </View>
          ))}
        </ScrollView>
      </ExploreSectionFrame>

      <ExploreMicroNote text={t('explore.listeningContinue')} icon="music" />

      <ExploreSectionFrame headerKey="orthodoxHymns" icon="music">
        <View style={styles.hymnsSurface}>
          {HYMNS.map((hymn) => (
            <MediaListItem key={hymn.id} title={hymn.title} subtitle={hymn.artist} image={{ uri: hymn.image }} />
          ))}
        </View>
      </ExploreSectionFrame>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  atmosphereTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 0 },
  pageIntro: { marginBottom: Layout.headerContentGap, gap: Layout.headerContentGap, zIndex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  greetingContainer: { gap: 6 },
  greeting: { letterSpacing: -0.3, color: Palette.text },
  greetingSub: { color: ManuscriptTokens.mutedText },
  hero: { marginBottom: Layout.cardGap },
  scrollContent: { gap: Layout.cardGap, paddingRight: Layout.pagePadding },
  prayerCard: { marginRight: Layout.cardGap },
  hymnsSurface: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ManuscriptTokens.cardBorder,
    backgroundColor: 'rgba(30, 26, 22, 0.35)',
    padding: 4,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: ManuscriptTokens.fadedGoldStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 32, height: 32, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '600' },
});
