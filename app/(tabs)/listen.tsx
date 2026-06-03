import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListenRecentSearchesPanel } from '@/components/listen/listen-recent-searches-panel';
import {
  MezmurCatalogShelf,
  type MezmurCatalogRailItem,
} from '@/components/listen/mezmur-catalog-shelf';
import { YaredMelodyShelf } from '@/components/listen/yared-melody-shelf';
import { MezmurSongRow } from '@/components/listen/mezmur-song-row';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { FeaturedCarousel, type FeaturedItem } from '@/components/sacred/featured-carousel';
import { ContentSearchResults } from '@/components/search/content-search-results';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { PlaylistRailCard } from '@/components/listen/playlist-rail-card';
import {
  isSquareAlbumArt,
  mezmurAlbumImageSource,
} from '@/constants/mezmur-album-art';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useListenRecentSearches, type ListenRecentSearchEntry } from '@/hooks/use-listen-recent-searches';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import {
  removeListeningProgress,
  useListeningProgress,
  type ListeningProgressEntry,
} from '@/hooks/use-listening-progress';
import {
  removeSavedHymn,
  useSavedHymns,
  type SavedHymn,
  type SavedListenKind,
} from '@/hooks/use-saved-hymns';
import { useTranslation } from '@/hooks/use-translation';
import {
  encodeRouteParam,
  fetchAllMezmur,
  fetchArtists,
  formatMezmurChannelSubtitle,
  fetchSongsByArtistAlbum,
  findMezmurByTitleNeedle,
  listeningEntryToMezmur,
  mezmurListToAudioTracks,
  mezmurToAudioTrack,
  searchMezmurCatalog,
  type Mezmur,
  type MezmurArtist,
  type MezmurSearchResults,
} from '@/lib/mezmur';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout, Palette, Space } from '@/constants/theme';
import { LISTEN_FEATURED_SEEDS } from '@/data/listenFeatured';
import { USER_PLAYLIST_ARTIST } from '@/data/userPlaylists';
import { useUserPlaylists } from '@/hooks/use-user-playlists';
import { userPlaylistThumbnail } from '@/lib/user-playlists';
import { YARED_MELODY_SHELVES } from '@/data/yaredMelodiesCatalog';
import { translate, type LanguageMode, type TranslationKey } from '@/lib/translations';
import type { IconName } from '@/components/Icon';


type ListenTab = 'hymns' | 'sermons' | 'melodies';
const TAB_KEYS: ListenTab[] = ['hymns', 'sermons', 'melodies'];
const MUTED_GOLD = '#8A8070';
const PILL_SPRING = { damping: 18, stiffness: 240, mass: 0.6 } as const;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const { width: WINDOW_WIDTH } = Dimensions.get('window');

const EMPTY_SEARCH: MezmurSearchResults = { channels: [], playlists: [], songs: [] };
const SAVED_HYMNS_PREVIEW_LIMIT = 3;

const TAB_TO_SAVED_KIND: Record<ListenTab, SavedListenKind> = {
  hymns: 'hymn',
  sermons: 'sermon',
  melodies: 'melody',
};

const LISTEN_CONTINUE_ICON: IconName = 'play-outline';
const LISTEN_CATALOG_ICON: IconName = 'scroll';

const TAB_SECTION_META: Record<
  ListenTab,
  {
    continueTitleKey: TranslationKey;
    featuredTitleKey: TranslationKey;
    catalogTitleKey: TranslationKey;
    savedTitleKey: TranslationKey;
    savedIcon: IconName;
    fallbackImage: string;
  }
> = {
  hymns: {
    continueTitleKey: 'listen.continueListening',
    featuredTitleKey: 'listen.featuredHymns',
    catalogTitleKey: 'listen.hymnsCatalog',
    savedTitleKey: 'listen.savedHymns',
    savedIcon: 'bookmark-filled',
    fallbackImage: SacredImagery.listenHymns,
  },
  sermons: {
    continueTitleKey: 'listen.continueListening',
    featuredTitleKey: 'listen.featuredSermons',
    catalogTitleKey: 'listen.sermonCatalog',
    savedTitleKey: 'listen.savedSermons',
    savedIcon: 'church',
    fallbackImage: SacredImagery.listenSermons,
  },
  melodies: {
    continueTitleKey: 'listen.continueListening',
    featuredTitleKey: 'listen.featuredMelodies',
    catalogTitleKey: 'listen.melodiesCatalog',
    savedTitleKey: 'listen.savedMelodies',
    savedIcon: 'music',
    fallbackImage: SacredImagery.listenMelodies,
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
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBlurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mezmurChannels, setMezmurChannels] = useState<MezmurArtist[]>([]);
  const { playlists: userPlaylists } = useUserPlaylists();
  const [mezmurCatalog, setMezmurCatalog] = useState<Mezmur[]>([]);
  const [searchResults, setSearchResults] = useState<MezmurSearchResults>(EMPTY_SEARCH);
  const [searchLoading, setSearchLoading] = useState(false);
  const { entries: continueEntries } = useListeningProgress();
  const { entries: savedItems } = useSavedHymns();
  const savedKind = TAB_TO_SAVED_KIND[activeTab];
  const savedForTab = useMemo(
    () => savedItems.filter((entry) => entry.kind === savedKind),
    [savedItems, savedKind]
  );
  const savedPreview = useMemo(
    () => savedForTab.slice(0, SAVED_HYMNS_PREVIEW_LIMIT),
    [savedForTab]
  );
  const {
    entries: recentSearchEntries,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useListenRecentSearches();
  const { playTrack } = useAudioPlayer();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = useFloatingBottomInset();
  const {
    values: scrollIndicator,
    scrollHandler,
    onLayout: onScrollShellLayout,
    onContentSizeChange: onScrollContentSizeChange,
  } = useScrollIndicator();
  const featuredWidth = WINDOW_WIDTH - Layout.pagePadding * 2;
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const trimmedSearchQuery = searchQuery.trim();
  const showRecentLayout = searchFocused && !trimmedSearchQuery;
  const keyboardHeight = useKeyboardHeight();
  const searchKeyboardActive = keyboardHeight > 0 && (showRecentLayout || Boolean(trimmedSearchQuery));
  const searchResultsQueryRef = useRef('');
  const pendingQuerySaveRef = useRef<string | null>(null);
  const lastSavedQueryRef = useRef('');

  useEffect(() => {
    return () => {
      if (searchBlurTimerRef.current) clearTimeout(searchBlurTimerRef.current);
    };
  }, []);

  const handleSearchFocusChange = useCallback((focused: boolean) => {
    if (searchBlurTimerRef.current) clearTimeout(searchBlurTimerRef.current);
    if (focused) {
      setSearchFocused(true);
      return;
    }
    searchBlurTimerRef.current = setTimeout(() => setSearchFocused(false), 150);
  }, []);

  useEffect(() => {
    let active = true;
    fetchArtists()
      .then((rows) => {
        if (active) setMezmurChannels(rows);
      })
      .catch(() => {
        if (active) setMezmurChannels([]);
      });
    fetchAllMezmur()
      .then((songs) => {
        if (active) setMezmurCatalog(songs);
      })
      .catch(() => {
        if (active) setMezmurCatalog([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(EMPTY_SEARCH);
      setSearchLoading(false);
      searchResultsQueryRef.current = '';
      return;
    }

    let active = true;
    const query = debouncedQuery;
    setSearchResults(EMPTY_SEARCH);
    setSearchLoading(true);
    searchResultsQueryRef.current = '';

    searchMezmurCatalog(query)
      .then((results) => {
        if (active) {
          setSearchResults(results);
          searchResultsQueryRef.current = query;
        }
      })
      .catch(() => {
        if (active) {
          setSearchResults(EMPTY_SEARCH);
          searchResultsQueryRef.current = query;
        }
      })
      .finally(() => {
        if (active) setSearchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const playContinueEntry = useCallback(
    async (entry: ListeningProgressEntry) => {
      const songs = await fetchSongsByArtistAlbum(entry.artist, entry.album);
      const queue = mezmurListToAudioTracks(songs.length > 0 ? songs : [listeningEntryToMezmur(entry)]).map(
        (item) => ({ ...item, saveKind: entry.kind })
      );
      const track = { ...mezmurToAudioTrack(listeningEntryToMezmur(entry)), saveKind: entry.kind };
      playTrack(track, {
        queue,
        autoPlay: true,
        startSeconds: entry.positionSeconds,
        openFullPlayer: true,
      });
    },
    [playTrack]
  );

  const playSong = useCallback(
    async (song: Mezmur, kind: SavedListenKind = TAB_TO_SAVED_KIND[activeTab]) => {
      const songs = await fetchSongsByArtistAlbum(song.artist, song.album);
      const queue = mezmurListToAudioTracks(songs.length > 0 ? songs : [song]).map((track) => ({
        ...track,
        saveKind: kind,
      }));
      const track = { ...mezmurToAudioTrack(song), saveKind: kind };
      playTrack(track, { queue, autoPlay: true, openFullPlayer: true });
    },
    [activeTab, playTrack]
  );

  const continueForTab = useMemo(
    () => continueEntries.filter((entry) => entry.kind === savedKind),
    [continueEntries, savedKind]
  );

  const playSavedItem = useCallback(
    (entry: SavedHymn) => {
      void playSong(listeningEntryToMezmur(entry), entry.kind);
    },
    [playSong]
  );

  const featuredItemsForTab = useMemo<FeaturedItem[]>(() => {
    const badgeLabel = getListenTabLabel(t, mode, activeTab);
    const kind = TAB_TO_SAVED_KIND[activeTab];

    return LISTEN_FEATURED_SEEDS[activeTab].map((seed) => {
      const matched = seed.videoId
        ? mezmurCatalog.find((song) => song.videoId === seed.videoId)
        : seed.titleNeedle
          ? findMezmurByTitleNeedle(mezmurCatalog, seed.titleNeedle)
          : undefined;

      return {
        id: seed.id,
        title: resolveLabel(t, seed.titleKey, seed.title ?? matched?.title),
        subtitle: resolveLabel(t, seed.subtitleKey, seed.subtitle ?? matched?.artist),
        badgeLabel,
        imageUri: matched?.thumbnailUrl ?? seed.image,
        onPress: () => {
          if (seed.melodyPlaylistId) {
            router.push(`/listen/melodies/${seed.melodyPlaylistId}` as never);
            return;
          }
          if (matched) void playSong(matched, kind);
        },
      };
    });
  }, [activeTab, mezmurCatalog, mode, playSong, t]);

  const hasSearchHits =
    searchResults.channels.length > 0 ||
    searchResults.playlists.length > 0 ||
    searchResults.songs.length > 0;

  const trySaveSubmittedQuery = useCallback(() => {
    const pending = pendingQuerySaveRef.current;
    if (!pending || pending !== debouncedQuery) return;
    if (searchLoading) return;
    if (searchResultsQueryRef.current !== debouncedQuery) return;

    pendingQuerySaveRef.current = null;
    if (!hasSearchHits) return;
    if (lastSavedQueryRef.current === debouncedQuery) return;

    lastSavedQueryRef.current = debouncedQuery;
    void addRecentSearch({
      kind: 'query',
      title: debouncedQuery,
      query: debouncedQuery,
    });
  }, [addRecentSearch, debouncedQuery, hasSearchHits, searchLoading]);

  useEffect(() => {
    trySaveSubmittedQuery();
  }, [trySaveSubmittedQuery]);

  const handleSearchSubmit = useCallback((term: string) => {
    const trimmed = term.trim();
    setSearchQuery(trimmed);
    pendingQuerySaveRef.current = trimmed || null;
  }, []);

  const saveChannelRecent = useCallback(
    (channel: MezmurArtist) => {
      void addRecentSearch({
        kind: 'channel',
        title: channel.name,
        subtitle: formatMezmurChannelSubtitle(
          channel.name,
          channel.albumCount,
          channel.songCount
        ),
        thumbnailUrl: channel.thumbnailUrl ?? undefined,
        channelName: channel.name,
      });
    },
    [addRecentSearch]
  );

  const savePlaylistRecent = useCallback(
    (artist: string, album: { name: string; thumbnailUrl?: string | null }) => {
      void addRecentSearch({
        kind: 'playlist',
        title: album.name,
        subtitle: artist,
        thumbnailUrl: album.thumbnailUrl ?? undefined,
        artist,
        album: album.name,
      });
    },
    [addRecentSearch]
  );

  const saveSongRecent = useCallback(
    (song: Mezmur, kind: ListenRecentSearchEntry['kind'] = 'song') => {
      void addRecentSearch({
        kind,
        title: song.title,
        subtitle: `${song.artist} · ${song.album}`,
        thumbnailUrl: song.thumbnailUrl ?? undefined,
        videoId: song.videoId,
        artist: song.artist,
        album: song.album,
      });
    },
    [addRecentSearch]
  );

  const handleRecentEntryPress = useCallback(
    (entry: ListenRecentSearchEntry) => {
      Keyboard.dismiss();
      switch (entry.kind) {
        case 'query':
          setSearchQuery(entry.query ?? entry.title);
          return;
        case 'channel':
          router.push(`/listen/${encodeRouteParam(entry.channelName ?? entry.title)}` as never);
          return;
        case 'playlist':
          if (entry.artist && entry.album) {
            router.push(
              `/listen/${encodeRouteParam(entry.artist)}/${encodeRouteParam(entry.album)}` as never
            );
          }
          return;
        case 'song':
        case 'sermon':
        case 'video':
        case 'melody':
          if (entry.videoId && entry.artist && entry.album) {
            void playSong(
              listeningEntryToMezmur({
                videoId: entry.videoId,
                title: entry.title,
                artist: entry.artist,
                album: entry.album,
                thumbnailUrl: entry.thumbnailUrl ?? '',
              })
            );
          }
          return;
        default:
          return;
      }
    },
    [playSong]
  );

  const tabSections = TAB_SECTION_META[activeTab];
  const showSavedSection = savedForTab.length > 0;
  const keyboardContentGap = Space.s12;
  const recentBottomInset = keyboardHeight > 0 ? keyboardContentGap : scrollBottomPadding;
  const searchResultsBottomInset = keyboardHeight > 0 ? keyboardContentGap : scrollBottomPadding;
  const listenScrollTrackRight = -Layout.pagePadding + 4;

  const playlistRailItems = useMemo(() => {
    const items: MezmurCatalogRailItem[] = [];

    for (const playlist of userPlaylists) {
      const songLabel =
        playlist.videoIds.length === 1
          ? t('listen.oneSong')
          : t('listen.nSongs').replace('{n}', String(playlist.videoIds.length));
      items.push({
        key: `user-${playlist.id}`,
        title: playlist.title,
        subtitle: songLabel,
        imageUri: userPlaylistThumbnail(playlist),
        onPress: () =>
          router.push(
            `/listen/${encodeRouteParam(USER_PLAYLIST_ARTIST)}/${encodeRouteParam(playlist.id)}` as never
          ),
      });
    }

    items.push({
      key: 'create-playlist',
      variant: 'create',
      title: t('listen.createYourPlaylist'),
      subtitle: t('listen.createYourPlaylistDescription'),
      onPress: () => router.push('/listen/my-playlist/new' as never),
    });

    return items;
  }, [t, userPlaylists]);

  return (
    <ThemedView style={styles.root}>
      <SacredAtmosphere />
      <KeyboardAvoidingView
        style={[
          styles.keyboardAvoid,
          Platform.OS === 'android' &&
            searchKeyboardActive &&
            { paddingBottom: keyboardHeight },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={searchKeyboardActive && Platform.OS === 'ios'}>
        <View
          style={[
            styles.screenBody,
            {
              paddingTop: insets.top + Space.s8,
              paddingBottom:
                showRecentLayout && keyboardHeight === 0 ? scrollBottomPadding : 0,
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
              hideRecentChips
              onFocusChange={handleSearchFocusChange}
            />
          </View>

          {showRecentLayout ? (
            <ListenRecentSearchesPanel
              entries={recentSearchEntries}
              onPressEntry={handleRecentEntryPress}
              onRemoveEntry={(id) => void removeRecentSearch(id)}
              onClearAll={() => void clearRecentSearches()}
              bottomInset={recentBottomInset}
              showScrollIndicator={keyboardHeight > 0}
            />
          ) : (
            <View style={styles.scrollShell} onLayout={onScrollShellLayout}>
              <AnimatedScrollView
                style={styles.scroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onContentSizeChange={onScrollContentSizeChange}
                contentContainerStyle={{ paddingBottom: searchResultsBottomInset }}>
                {trimmedSearchQuery ? (
                <>
                  <ContentSearchResults
                    heading="Channels"
                    hits={searchResults.channels.map((channel) => ({
                      id: `channel-${channel.name}`,
                      title: channel.name,
                      subtitle: formatMezmurChannelSubtitle(
          channel.name,
          channel.albumCount,
          channel.songCount
        ),
                      imageUri: channel.thumbnailUrl,
                      circularImage: true,
                      isHeader: true,
                      onPress: () => {
                        saveChannelRecent(channel);
                        router.push(`/listen/${encodeRouteParam(channel.name)}` as never);
                      },
                    }))}
                  />
                  <ContentSearchResults
                    heading="Playlists"
                    hits={searchResults.playlists.map(({ artist, album }) => {
                      const bundled = isSquareAlbumArt(artist);
                      return {
                      id: `playlist-${artist}-${album.name}`,
                      title: album.name,
                      subtitle: artist,
                      imageUri: album.thumbnailUrl,
                      imageSource: bundled
                        ? mezmurAlbumImageSource(artist, album.name, album.thumbnailUrl)
                        : undefined,
                      albumArt: true,
                      wideImage: false,
                      isHeader: true,
                      onPress: () => {
                        savePlaylistRecent(artist, album);
                        router.push(
                          `/listen/${encodeRouteParam(artist)}/${encodeRouteParam(album.name)}` as never
                        );
                      },
                    };
                    })}
                  />
                  <ContentSearchResults
                    heading="Songs"
                    hits={searchResults.songs.map((song) => ({
                      id: `song-${song.videoId}`,
                      videoId: song.videoId,
                      title: song.title,
                      subtitle: `${song.artist} · ${song.album}`,
                      imageUri: song.thumbnailUrl || null,
                      onPress: () => {
                        saveSongRecent(song);
                        void playSong(song);
                      },
                    }))}
                    loading={searchLoading}
                    emptyLabel={
                      !searchLoading && !hasSearchHits ? 'No mezmur found on Listen.' : undefined
                    }
                  />
                </>
              ) : (
                <>
                  <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />

                  <View style={styles.section}>
                    <SectionHeader title={t(tabSections.featuredTitleKey)} icon="sparkle" />
                    <FeaturedCarousel
                      items={featuredItemsForTab}
                      width={featuredWidth}
                      autoRotateMs={3200}
                      cardHeight={Layout.featuredCardHeight}
                    />
                  </View>

                  {continueForTab.length > 0 ? (
                    <View style={styles.section}>
                      <SectionHeader
                        title={t(tabSections.continueTitleKey)}
                        icon={LISTEN_CONTINUE_ICON}
                      />
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.rail}>
                        {continueForTab.map((entry) => (
                          <PlaylistRailCard
                            key={entry.videoId}
                            title={entry.title}
                            subtitle={`${entry.artist} · ${entry.album}`}
                            imageUri={entry.thumbnailUrl || tabSections.fallbackImage}
                            fallbackImageUri={tabSections.fallbackImage}
                            onPress={() => void playContinueEntry(entry)}
                            onRemove={() => void removeListeningProgress(entry.videoId)}
                            removeLabel={`Remove ${entry.title}`}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  ) : null}

                  <View style={[styles.section, !showSavedSection && styles.lastSection]}>
                    <SectionHeader
                      title={t(tabSections.catalogTitleKey)}
                      icon={LISTEN_CATALOG_ICON}
                    />
                    {activeTab === 'hymns' ? (
                      <>
                        <MezmurCatalogShelf
                          title={t('listen.mezmurPlaylistsShelf')}
                          items={playlistRailItems}
                          compactBottom={mezmurChannels.length > 0}
                          onSeeAll={() =>
                            router.push({
                              pathname: '/listen/catalog',
                              params: { section: 'playlists' },
                            } as never)
                          }
                        />
                        <MezmurCatalogShelf
                          title={t('listen.mezmurChannelsShelf')}
                          artists={mezmurChannels}
                          compactBottom={!showSavedSection}
                          onSeeAll={() =>
                            router.push({
                              pathname: '/listen/catalog',
                              params: { section: 'channels' },
                            } as never)
                          }
                        />
                      </>
                    ) : activeTab === 'melodies' ? (
                      YARED_MELODY_SHELVES.map((shelf, index, shelves) => (
                        <YaredMelodyShelf
                          key={shelf.id}
                          shelf={shelf}
                          compactBottom={showSavedSection && index === shelves.length - 1}
                          onSeeAll={() =>
                            router.push({
                              pathname: '/listen/melodies',
                              params: { shelf: shelf.id },
                            } as never)
                          }
                        />
                      ))
                    ) : (
                      <ThemedText type="muted" style={styles.catalogPlaceholder}>
                        {t('listen.catalogComingSoon')}
                      </ThemedText>
                    )}
                  </View>

                  {showSavedSection ? (
                    <View style={[styles.section, styles.lastSection]}>
                      <SectionHeader
                        title={t(tabSections.savedTitleKey)}
                        icon={tabSections.savedIcon}
                        onSeeAllPress={() =>
                          router.push({
                            pathname: '/listen/saved',
                            params: { kind: savedKind },
                          } as never)
                        }
                      />
                      <View style={styles.savedHymnsList}>
                        {savedPreview.map((entry, index) => (
                          <View key={entry.videoId}>
                            <MezmurSongRow
                              title={entry.title}
                              subtitle={`${entry.artist} · ${entry.album}`}
                              thumbnailUrl={entry.thumbnailUrl || tabSections.fallbackImage}
                              audioTrack={mezmurToAudioTrack(listeningEntryToMezmur(entry))}
                              onPress={() => playSavedItem(entry)}
                              onRemove={() => void removeSavedHymn(entry.videoId)}
                              removeIcon="more-horizontal"
                              removeLabel="Remove Saved Hymn"
                            />
                            {index < savedPreview.length - 1 ? (
                              <View style={styles.savedHymnDivider} />
                            ) : null}
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </>
              )}
              </AnimatedScrollView>

              {(trimmedSearchQuery && keyboardHeight > 0) || !trimmedSearchQuery ? (
                <ScrollIndicator
                  values={scrollIndicator}
                  persistent={Boolean(trimmedSearchQuery && keyboardHeight > 0)}
                  trackRight={listenScrollTrackRight}
                  trackInsetBottom={scrollBottomPadding}
                />
              ) : null}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  keyboardAvoid: { flex: 1 },
  screenBody: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: Layout.pagePadding,
  },
  scroll: { flex: 1 },
  scrollShell: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
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
  lastSection: { marginBottom: 0 },
  savedHymnsList: { marginTop: 2 },
  savedHymnDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 68,
  },
  catalogPlaceholder: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 2,
  },
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
    marginRight: -Layout.pagePadding,
  },
});
