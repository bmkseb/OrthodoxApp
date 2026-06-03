import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MezmurSongRow } from '@/components/listen/mezmur-song-row';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout, Space } from '@/constants/theme';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import {
  removeSavedHymn,
  useSavedHymns,
  type SavedHymn,
  type SavedListenKind,
} from '@/hooks/use-saved-hymns';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import {
  fetchSongsByArtistAlbum,
  filterByQuery,
  listeningEntryToMezmur,
  mezmurListToAudioTracks,
  mezmurToAudioTrack,
} from '@/lib/mezmur';

const MUTED_GOLD = '#8A8070';

const SAVED_KIND_META: Record<
  SavedListenKind,
  {
    titleKey: TranslationKey;
    emptyTitle: string;
    emptySuggestion: string;
    searchPlaceholder: string;
    fallbackImage: string;
    recentKey: string;
  }
> = {
  hymn: {
    titleKey: 'listen.savedHymns',
    emptyTitle: 'No saved hymns yet',
    emptySuggestion: 'Tap Save on a hymn in the player to add it here.',
    searchPlaceholder: 'Search saved hymns',
    fallbackImage: SacredImagery.listenHymns,
    recentKey: 'listen-saved-hymns',
  },
  sermon: {
    titleKey: 'listen.savedSermons',
    emptyTitle: 'No saved sermons yet',
    emptySuggestion: 'Tap Save on a sermon in the player to add it here.',
    searchPlaceholder: 'Search saved sermons',
    fallbackImage: SacredImagery.listenSermons,
    recentKey: 'listen-saved-sermons',
  },
  melody: {
    titleKey: 'listen.savedMelodies',
    emptyTitle: 'No saved chants yet',
    emptySuggestion: 'Tap Save on a chant in the player to add it here.',
    searchPlaceholder: 'Search saved chants',
    fallbackImage: SacredImagery.listenMelodies,
    recentKey: 'listen-saved-melodies',
  },
};

function parseSavedKind(value: string | string[] | undefined): SavedListenKind {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'sermon' || raw === 'melody') return raw;
  return 'hymn';
}

export default function SavedListenScreen() {
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>();
  const kind = parseSavedKind(kindParam);
  const meta = SAVED_KIND_META[kind];
  const { t } = useTranslation();
  const { playTrack } = useAudioPlayer();
  const { entries: savedItems } = useSavedHymns();
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches(meta.recentKey);

  const savedForKind = useMemo(
    () => savedItems.filter((entry) => entry.kind === kind),
    [savedItems, kind]
  );

  const filteredItems = useMemo(
    () =>
      filterByQuery(savedForKind, searchQuery, (entry) => [
        entry.title,
        entry.artist,
        entry.album,
      ]),
    [savedForKind, searchQuery]
  );

  const playSavedItem = useCallback(
    async (entry: SavedHymn) => {
      const songs = await fetchSongsByArtistAlbum(entry.artist, entry.album);
      const mezmur = listeningEntryToMezmur(entry);
      const track = { ...mezmurToAudioTrack(mezmur), saveKind: entry.kind };
      const queue = mezmurListToAudioTracks(songs.length > 0 ? songs : [mezmur]).map((item) =>
        item.id === track.id ? track : { ...item, saveKind: entry.kind }
      );
      playTrack(track, { queue, autoPlay: true, openFullPlayer: true });
    },
    [playTrack]
  );

  return (
    <ScreenScrollView includeFloatingChrome>
      <ScriptureBackBar />
      <ScriptureBookHeader
        title={t(meta.titleKey)}
        subtitle={`${savedForKind.length} saved`}
      />

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={meta.searchPlaceholder}
          placeholderTextColor={MUTED_GOLD}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearchSubmit={(term) => {
            setSearchQuery(term);
            void addRecentSearch(term);
          }}
          recentSearches={recentSearches}
        />
      </View>

      {savedForKind.length === 0 ? (
        <EmptyState title={meta.emptyTitle} suggestion={meta.emptySuggestion} />
      ) : filteredItems.length === 0 ? (
        <EmptyState title="No items match your search" suggestion="Try a different term." />
      ) : (
        <View style={styles.list}>
          {filteredItems.map((entry, index) => (
            <View key={entry.videoId}>
              <MezmurSongRow
                title={entry.title}
                subtitle={`${entry.artist} · ${entry.album}`}
                thumbnailUrl={entry.thumbnailUrl || meta.fallbackImage}
                audioTrack={mezmurToAudioTrack(listeningEntryToMezmur(entry))}
                onPress={() => void playSavedItem(entry)}
                onRemove={() => void removeSavedHymn(entry.videoId)}
                removeIcon="more-horizontal"
                removeLabel="Remove Saved Hymn"
              />
              {index < filteredItems.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: Space.s16 },
  list: { marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 68,
  },
});
