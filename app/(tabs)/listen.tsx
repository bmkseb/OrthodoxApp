import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/orthodox/PageHeader';
import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { SoftRailCard } from '@/components/ui/soft-rail-card';
import { useAudioPlayer, type AudioTrack } from '@/contexts/audio-player-context';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import { resolvePlayerTrackCopy } from '@/lib/audio-track-display';
import { SacredImagery } from '@/constants/sacred-imagery';
import { translate, type LanguageMode, type TranslationKey } from '@/lib/translations';
import { Layout, Palette, Space } from '@/constants/theme';

type ListenTab = 'hymns' | 'sermons' | 'melodies';
const TAB_KEYS: ListenTab[] = ['hymns', 'sermons', 'melodies'];
// Muted gold used for the search placeholder per design spec.
const MUTED_GOLD = '#8A8070';
// 200ms-feel spring used by the sliding segmented-tab pill.
const PILL_SPRING = { damping: 18, stiffness: 240, mass: 0.6 } as const;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const { width: WINDOW_WIDTH } = Dimensions.get('window');

type Track = {
  id: string;
  titleKey?: TranslationKey;
  title?: string;
  artistKey?: TranslationKey;
  artist?: string;
  image: string;
};

const TAB_CONTENT: Record<
  ListenTab,
  {
    sectionIcon: 'sparkle' | 'music';
    featured: { titleKey?: TranslationKey; title?: string; subtitleKey?: TranslationKey; subtitle?: string; image: string };
    tracks: Track[];
  }
> = {
  hymns: {
    sectionIcon: 'sparkle',
    featured: { title: 'Covenant of Mercy', subtitle: 'Helena Alemu', image: SacredImagery.listenHymns },
    tracks: [
      { id: '1', title: 'Covenant of Mercy', artist: 'Helena Alemu', image: SacredImagery.listenHymns },
      { id: '2', title: 'Your Graciousness has Sustained Me', artist: 'Various Artists', image: SacredImagery.prayerMary },
      { id: '3', title: 'Holy Holy Holy', artist: 'Orthodox Choir', image: SacredImagery.readManuscript },
    ],
  },
  sermons: {
    sectionIcon: 'sparkle',
    featured: { title: 'The Path of Repentance', subtitle: 'Fr. Daniel Habtemariam', image: SacredImagery.listenSermons },
    tracks: [
      { id: '1', title: 'The Path of Repentance', artist: 'Fr. Daniel Habtemariam', image: SacredImagery.listenSermons },
      { id: '2', title: 'Living in Christ', artist: 'Fr. Tekle Mariam', image: SacredImagery.readFeatured },
    ],
  },
  melodies: {
    sectionIcon: 'sparkle',
    featured: {
      titleKey: 'listen.yaredMelody',
      subtitleKey: 'listen.yaredMelodyArtist',
      image: SacredImagery.listenMelodies,
    },
    tracks: [
      { id: '1', titleKey: 'listen.yaredMelody', artistKey: 'listen.yaredMelodyArtist', image: SacredImagery.listenMelodies },
      { id: '2', title: 'Ancient Chant I', artist: 'Monastery Choir', image: SacredImagery.readManuscript },
    ],
  },
};

/** Hymns Catalog rail — browse mezmur by mood/season, plus chants and the office. */
const LISTEN_COLLECTIONS: { id: string; title: string; subtitle: string; image: string; tab?: ListenTab; route?: string }[] = [
  { id: 'repentance', title: 'Repentance Mezmur', subtitle: 'ንስሐ መዝሙር', image: SacredImagery.prayerMary, tab: 'hymns' },
  { id: 'joyous', title: 'Joyous Mezmur', subtitle: 'ደስታ መዝሙር', image: SacredImagery.listenHymns, tab: 'hymns' },
  { id: 'praise', title: 'Praise Mezmur', subtitle: 'ምስጋና መዝሙር', image: SacredImagery.listenMelodies, tab: 'hymns' },
  { id: 'yared', title: 'Yared Chants', subtitle: 'ዜማ · Zema', image: SacredImagery.readManuscript, tab: 'melodies' },
  { id: 'sermons', title: 'Sermons', subtitle: 'ስብከት · Teachings', image: SacredImagery.listenSermons, tab: 'sermons' },
  { id: 'office', title: 'Prayer Office', subtitle: "ሰዓታት · Se'atat", image: SacredImagery.readManuscript, route: '/horologium' },
];

function resolveLabel(t: (k: TranslationKey) => string, key?: TranslationKey, fallback?: string) {
  return key ? t(key) : (fallback ?? '');
}

function getListenTabLabel(t: (k: TranslationKey) => string, mode: LanguageMode, key: ListenTab): string {
  if (key !== 'melodies') return t(`listen.${key}`);
  if (mode === 'am') return translate('listen.yaredMelody', 'am');
  return translate('listen.yaredMelody', 'en');
}

function getCategoryLabel(key: ListenTab, t: (k: TranslationKey) => string, mode: LanguageMode): string {
  if (key === 'hymns') return t('listen.hymns');
  if (key === 'sermons') return t('listen.sermons');
  if (mode === 'am') return translate('listen.melodies', 'am');
  return translate('listen.melodies', 'en');
}

type TabLayouts = Partial<Record<ListenTab, { x: number; width: number }>>;

function SegmentedTabs({
  activeTab,
  onChange,
}: {
  activeTab: ListenTab;
  onChange: (t: ListenTab) => void;
}) {
  const { t, mode } = useTranslation();
  const [layouts, setLayouts] = useState<TabLayouts>({});

  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  useEffect(() => {
    const layout = layouts[activeTab];
    if (!layout) return;
    if (pillOpacity.value === 0) {
      // First measurement — snap into place, then fade in so the pill never
      // appears to "fly in" from the origin on initial mount.
      pillX.value = layout.x;
      pillWidth.value = layout.width;
      pillOpacity.value = withSpring(1, PILL_SPRING);
    } else {
      pillX.value = withSpring(layout.x, PILL_SPRING);
      pillWidth.value = withSpring(layout.width, PILL_SPRING);
    }
  }, [activeTab, layouts, pillOpacity, pillX, pillWidth]);

  const handleLayout = useCallback((key: ListenTab, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const existing = prev[key];
      if (existing && existing.x === x && existing.width === width) return prev;
      return { ...prev, [key]: { x, width } };
    });
  }, []);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  return (
    <View style={styles.segmentContainer}>
      <Animated.View style={[styles.segmentPill, pillStyle]} pointerEvents="none" />
      {TAB_KEYS.map((key) => {
        const isActive = activeTab === key;
        return (
          <Pressable
            key={key}
            onLayout={(e) => handleLayout(key, e)}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={styles.segmentTab}>
            <Text
              style={[styles.segmentLabel, isActive ? styles.segmentLabelActive : styles.segmentLabelInactive]}
              numberOfLines={1}
              allowFontScaling={false}>
              {getListenTabLabel(t, mode, key)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ListenScreen() {
  const { t, mode } = useTranslation();
  const [activeTab, setActiveTab] = useState<ListenTab>('hymns');
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('listen');
  const { playTrack, openFullPlayer } = useAudioPlayer();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = useFloatingBottomInset();
  const { values: scrollIndicator, scrollHandler } = useScrollIndicator();
  const content = TAB_CONTENT[activeTab];
  const categoryLabel = getCategoryLabel(activeTab, t, mode);
  const featuredWidth = WINDOW_WIDTH - Layout.pagePadding * 2;

  const toPlaybackTrack = useCallback(
    (track: Track): AudioTrack => {
      const copy = resolvePlayerTrackCopy({
        mode,
        titleKey: track.titleKey,
        title: track.title,
        artistKey: track.artistKey,
        artist: track.artist,
        categoryLabel,
      });
      return {
        id: `${activeTab}-${track.id}`,
        title: copy.title,
        artist: copy.artist,
        artworkUri: track.image,
        category: copy.categoryLabel,
        categoryLabel: copy.categoryLabel,
        titleKey: track.titleKey,
        artistKey: track.artistKey,
      };
    },
    [activeTab, categoryLabel, mode]
  );

  const buildQueue = useCallback(
    (): AudioTrack[] => content.tracks.map((track) => toPlaybackTrack(track)),
    [content.tracks, toPlaybackTrack]
  );

  useEffect(() => {
    const first = content.tracks[0];
    if (first) {
      const queue = buildQueue();
      playTrack(toPlaybackTrack(first), { queue });
    }
  }, [activeTab, buildQueue, content.tracks, playTrack, toPlaybackTrack]);

  const playFromTrack = useCallback(
    (track: Track) => {
      playTrack(toPlaybackTrack(track), { queue: buildQueue() });
    },
    [buildQueue, playTrack, toPlaybackTrack]
  );

  // Auto-rotating featured carousel skims across all three categories.
  const featuredItems = useMemo<FeaturedItem[]>(
    () =>
      TAB_KEYS.map((tab) => {
        const f = TAB_CONTENT[tab].featured;
        return {
          id: tab,
          title: resolveLabel(t, f.titleKey, f.title),
          subtitle: resolveLabel(t, f.subtitleKey, f.subtitle),
          badgeLabel: getListenTabLabel(t, mode, tab),
          imageUri: f.image,
          onPress: () => setActiveTab(tab),
        };
      }),
    [t, mode]
  );

  const q = searchQuery.trim().toLowerCase();
  const filteredTracks = useMemo(() => {
    if (!q) return content.tracks;
    return content.tracks.filter((track) => {
      const title = resolveLabel(t, track.titleKey, track.title);
      const artist = resolveLabel(t, track.artistKey, track.artist);
      return title.toLowerCase().includes(q) || artist.toLowerCase().includes(q);
    });
  }, [content.tracks, q, t]);

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
  };

  return (
    <ThemedView style={styles.root}>
      <SacredAtmosphere />
      <AnimatedScrollView
        style={styles.scroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Space.s8,
            paddingBottom: scrollBottomPadding,
          },
        ]}>
        <PageHeader title="Listen" geez="መዝሙር" />
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t('listen.searchPlaceholder')}
            placeholderTextColor={MUTED_GOLD}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            recentSearches={recentSearches}
          />
        </View>
        <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Continue listening — horizontal rail of the active category */}
        {filteredTracks.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Continue Listening" icon="music" onSeeAllPress={openFullPlayer} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}>
              {filteredTracks.map((track) => (
                <SoftRailCard
                  key={track.id}
                  title={resolveLabel(t, track.titleKey, track.title)}
                  subtitle={resolveLabel(t, track.artistKey, track.artist)}
                  onPress={() => playFromTrack(track)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Featured — auto-rotating across categories */}
        <View style={styles.section}>
          <SectionHeader title="Featured" icon="sparkle" />
          <FeaturedCarousel
            items={featuredItems}
            width={featuredWidth}
            autoRotateMs={3200}
            cardHeight={176}
          />
        </View>

        {/* Catalog — browse the wider audio library */}
        <View style={styles.section}>
          <SectionHeader title="Hymns Catalog" icon="scroll" onSeeAllPress={() => setActiveTab('hymns')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {LISTEN_COLLECTIONS.map((c) => (
              <SoftRailCard
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                onPress={() => {
                  if (c.tab) setActiveTab(c.tab);
                  else if (c.route) router.push(c.route as never);
                }}
              />
            ))}
          </ScrollView>
        </View>
      </AnimatedScrollView>

      <ScrollIndicator
        values={scrollIndicator}
        trackInsetTop={insets.top + Space.s8}
        trackInsetBottom={scrollBottomPadding}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.pagePadding },
  searchWrap: { marginBottom: Space.s16 },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#1A1815',
    borderRadius: 12,
    padding: 4,
    marginBottom: Space.s16,
    position: 'relative',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  segmentPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: 8,
    backgroundColor: '#C9933A',
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  segmentLabelActive: { color: '#000000', fontWeight: '600' },
  segmentLabelInactive: { color: MUTED_GOLD, fontWeight: '500' },
  section: { marginBottom: Layout.sectionContentBottom },
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
    marginRight: -Layout.pagePadding,
  },
});
