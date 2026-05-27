import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FeaturedHeroCard } from '@/components/ui/featured-hero-card';
import { MediaListItem } from '@/components/ui/media-list-item';
import { SearchBar } from '@/components/ui/search-bar';
import { SacredPageHeader } from '@/components/ui/bilingual-header';
import { SectionHeader } from '@/components/ui/section-header';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { useAudioPlayer, type AudioTrack } from '@/contexts/audio-player-context';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';
import { useTranslation } from '@/hooks/use-translation';
import { resolvePlayerTrackCopy } from '@/lib/audio-track-display';
import { SacredImagery } from '@/constants/sacred-imagery';
import { translate, type LanguageMode, type TranslationKey } from '@/lib/translations';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';

type ListenTab = 'hymns' | 'sermons' | 'melodies';
const TAB_KEYS: ListenTab[] = ['hymns', 'sermons', 'melodies'];
const RECENT_SEARCHES = ['Helena Alemu', 'Repentance', 'Holy Holy'];

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

function SegmentedTabs({ activeTab, onChange }: { activeTab: ListenTab; onChange: (t: ListenTab) => void }) {
  const { t, mode } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.segmentScroll}
      style={styles.segmentScrollView}>
      {TAB_KEYS.map((key) => {
        const isActive = activeTab === key;
        const isMelodies = key === 'melodies';
        return (
          <OrthodoxPressable
            key={key}
            style={[
              styles.segmentPill,
              isMelodies && styles.segmentPillWide,
              isActive ? styles.segmentPillActive : styles.segmentPillInactive,
            ]}
            onPress={() => onChange(key)}>
            <Text style={[styles.segmentLabel, isActive ? styles.segmentLabelActive : styles.segmentLabelInactive]}>
              {getListenTabLabel(t, mode, key)}
            </Text>
          </OrthodoxPressable>
        );
      })}
    </ScrollView>
  );
}

export default function ListenScreen() {
  const { t, mode } = useTranslation();
  const [activeTab, setActiveTab] = useState<ListenTab>('hymns');
  const { playTrack, isPlaying } = useAudioPlayer();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = useFloatingBottomInset();
  const content = TAB_CONTENT[activeTab];
  const categoryLabel = getCategoryLabel(activeTab, t, mode);

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

  const featuredTitle = useMemo(
    () => resolveLabel(t, content.featured.titleKey, content.featured.title),
    [content.featured, t]
  );

  return (
    <ThemedView style={styles.root}>
      <SacredAtmosphere />
      <ScrollView
        style={styles.scroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Space.s8,
            paddingBottom: scrollBottomPadding,
          },
        ]}>
        <View style={styles.titleRow}>
          <View style={styles.pageTitleRow}>
            <Icon name="music" size={20} color={Palette.muted} />
            <SacredPageHeader headerKey="listen" />
          </View>
          <SettingsNavButton />
        </View>
        <View style={styles.searchWrap}>
          <SearchBar placeholder={t('listen.searchPlaceholder')} recentSearches={RECENT_SEARCHES} />
        </View>
        <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
        <FeaturedHeroCard
          title={featuredTitle}
          subtitle={resolveLabel(t, content.featured.subtitleKey, content.featured.subtitle)}
          imageSource={{ uri: content.featured.image }}
          isPlayingWarm={isPlaying}
        />
        <SectionHeader headerKey="featured" icon={content.sectionIcon} />
        <View style={styles.trackList}>
          {content.tracks.map((track) => (
            <MediaListItem
              key={track.id}
              title={resolveLabel(t, track.titleKey, track.title)}
              subtitle={resolveLabel(t, track.artistKey, track.artist)}
              image={{ uri: track.image }}
              onPress={() => playFromTrack(track)}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.pagePadding },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.sectionHeaderBottom,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
    gap: Space.s8,
  },
  searchWrap: { marginBottom: Space.s12 },
  segmentScrollView: { marginBottom: Space.s12 },
  segmentScroll: { gap: Space.s8, paddingRight: Space.s8 },
  segmentPill: {
    borderRadius: BorderRadius.full,
    paddingVertical: Space.s8,
    paddingHorizontal: Space.s16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    minWidth: 88,
  },
  segmentPillWide: {
    minWidth: 176,
    paddingHorizontal: Space.s16,
  },
  segmentPillActive: {
    backgroundColor: Palette.gold,
    borderColor: 'rgba(201, 147, 58, 0.32)',
  },
  segmentPillInactive: {
    backgroundColor: Palette.surfaceWarm,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  segmentLabelActive: { color: Palette.background },
  segmentLabelInactive: { color: Palette.muted },
  trackList: { paddingBottom: Space.s4 },
});
