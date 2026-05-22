import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedView } from '@/components/themed-view';
import { FeaturedHeroCard } from '@/components/ui/featured-hero-card';
import { MediaListItem } from '@/components/ui/media-list-item';
import { MiniPlayer } from '@/components/ui/mini-player';
import { SearchBar } from '@/components/ui/search-bar';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { SectionHeader } from '@/components/ui/section-header';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

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
    featured: { title: 'Covenant of Mercy', subtitle: 'Helena Alemu', image: 'https://picsum.photos/800/400?random=21' },
    tracks: [
      { id: '1', title: 'Covenant of Mercy', artist: 'Helena Alemu', image: 'https://picsum.photos/80/80?random=22' },
      { id: '2', title: 'Your Graciousness has Sustained Me', artist: 'Various Artists', image: 'https://picsum.photos/80/80?random=23' },
      { id: '3', title: 'Holy Holy Holy', artist: 'Orthodox Choir', image: 'https://picsum.photos/80/80?random=24' },
    ],
  },
  sermons: {
    sectionIcon: 'sparkle',
    featured: { title: 'The Path of Repentance', subtitle: 'Fr. Daniel Habtemariam', image: 'https://picsum.photos/800/400?random=26' },
    tracks: [
      { id: '1', title: 'The Path of Repentance', artist: 'Fr. Daniel Habtemariam', image: 'https://picsum.photos/80/80?random=27' },
      { id: '2', title: 'Living in Christ', artist: 'Fr. Tekle Mariam', image: 'https://picsum.photos/80/80?random=28' },
    ],
  },
  melodies: {
    sectionIcon: 'sparkle',
    featured: {
      titleKey: 'listen.yaredMelody',
      subtitleKey: 'listen.yaredMelodyArtist',
      image: 'https://picsum.photos/800/400?random=30',
    },
    tracks: [
      { id: '1', titleKey: 'listen.yaredMelody', artistKey: 'listen.yaredMelodyArtist', image: 'https://picsum.photos/80/80?random=31' },
      { id: '2', title: 'Ancient Chant I', artist: 'Monastery Choir', image: 'https://picsum.photos/80/80?random=32' },
    ],
  },
};

function resolveLabel(t: (k: TranslationKey) => string, key?: TranslationKey, fallback?: string) {
  return key ? t(key) : (fallback ?? '');
}

function SegmentedTabs({ activeTab, onChange }: { activeTab: ListenTab; onChange: (t: ListenTab) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.segmentedRow}>
      {TAB_KEYS.map((key) => {
        const isActive = activeTab === key;
        return (
          <OrthodoxPressable
            key={key}
            style={[styles.segmentPill, isActive ? styles.segmentPillActive : styles.segmentPillInactive]}
            onPress={() => onChange(key)}>
            <Text
              style={[styles.segmentLabel, isActive ? styles.segmentLabelActive : styles.segmentLabelInactive]}
              numberOfLines={1}>
              {t(`listen.${key}` as TranslationKey)}
            </Text>
          </OrthodoxPressable>
        );
      })}
    </View>
  );
}

export default function ListenScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ListenTab>('hymns');
  const [isPlaying, setIsPlaying] = useState(true);
  const insets = useSafeAreaInsets();
  const content = TAB_CONTENT[activeTab];
  const nowPlaying = useMemo(() => content.tracks[0], [content.tracks]);

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8, paddingBottom: Layout.sectionGap }]}>
        <View style={styles.titleRow}>
          <View style={styles.pageTitleRow}>
            <Icon name="music" size={22} />
            <BilingualHeader headerKey="listen" variant="page" />
          </View>
          <SettingsNavButton />
        </View>
        <View style={styles.searchWrap}>
          <SearchBar placeholder={t('listen.searchPlaceholder')} recentSearches={RECENT_SEARCHES} />
        </View>
        <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
        <FeaturedHeroCard
          title={resolveLabel(t, content.featured.titleKey, content.featured.title)}
          subtitle={resolveLabel(t, content.featured.subtitleKey, content.featured.subtitle)}
          imageSource={{ uri: content.featured.image }}
          style={styles.hero}
        />
        <SectionHeader headerKey="featured" icon={content.sectionIcon} />
        <View style={styles.trackList}>
          {content.tracks.map((track) => (
            <MediaListItem
              key={track.id}
              title={resolveLabel(t, track.titleKey, track.title)}
              subtitle={resolveLabel(t, track.artistKey, track.artist)}
              image={{ uri: track.image }}
            />
          ))}
        </View>
      </ScrollView>
      <MiniPlayer
        title={resolveLabel(t, nowPlaying.titleKey, nowPlaying.title)}
        artist={resolveLabel(t, nowPlaying.artistKey, nowPlaying.artist)}
        artworkUri={nowPlaying.image}
        progress={0.35}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.pagePadding },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: Layout.headerContentGap },
  pageTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, flex: 1 },
  searchWrap: { marginBottom: Layout.sectionGap },
  segmentedRow: { flexDirection: 'row', gap: 8, marginBottom: Layout.sectionGap },
  segmentPill: { flex: 1, borderRadius: BorderRadius.full, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  segmentPillActive: { backgroundColor: Palette.gold },
  segmentPillInactive: { backgroundColor: Palette.card },
  segmentLabel: { fontSize: 13, fontWeight: '600' },
  segmentLabelActive: { color: Palette.background },
  segmentLabelInactive: { color: Palette.muted },
  hero: { marginBottom: Layout.sectionGap },
  trackList: { paddingBottom: 8 },
});
