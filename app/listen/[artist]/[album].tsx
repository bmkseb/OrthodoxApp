import { router, useLocalSearchParams } from 'expo-router';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';



import { Icon } from '@/components/Icon';

import { MezmurAlbumHero } from '@/components/listen/mezmur-album-hero';

import { MezmurPlaylistManageSheet } from '@/components/listen/mezmur-playlist-manage-sheet';

import { MezmurSongRow } from '@/components/listen/mezmur-song-row';

import { OrthodoxPressable } from '@/components/orthodox-pressable';

import { EmptyState } from '@/components/ui/empty-state';

import { ScreenScrollView } from '@/components/ui/screen-scroll-view';

import { SearchBar } from '@/components/ui/search-bar';

import { pickAlbumThumbnailUrl } from '@/constants/mezmur-album-art';

import { Layout, Palette, Space, Spacing } from '@/constants/theme';

import { isUserPlaylistArtist } from '@/data/userPlaylists';

import { useAudioPlayer } from '@/contexts/audio-player-context';

import { usePlaylistOwnerLabel } from '@/hooks/use-playlist-owner';

import type { UserPlaylist } from '@/hooks/use-user-playlists';

import {

  fetchUserPlaylists,

  removeSongFromUserPlaylist,

} from '@/hooks/use-user-playlists';

import { useRecentSearches } from '@/hooks/use-recent-searches';

import { useTranslation } from '@/hooks/use-translation';

import {

  decodeRouteParam,

  fetchSongsByArtistAlbum,

  filterByQuery,

  mezmurListToAudioTracks,

  mezmurToAudioTrack,

  type Mezmur,

} from '@/lib/mezmur';

import { resolveUserPlaylistSongs, userPlaylistThumbnail } from '@/lib/user-playlists';



const MUTED_GOLD = '#8A8070';



export default function ListenSongsScreen() {

  const { t } = useTranslation();

  const { playTrack } = useAudioPlayer();

  const { artist: artistParam, album: albumParam } = useLocalSearchParams<{

    artist: string;

    album: string;

  }>();

  const artist = decodeRouteParam(artistParam);

  const album = decodeRouteParam(albumParam);

  const isUserPlaylist = isUserPlaylistArtist(artist);
  const playlistOwnerName = usePlaylistOwnerLabel();

  const [playlistTitle, setPlaylistTitle] = useState(album);

  const [userPlaylist, setUserPlaylist] = useState<UserPlaylist | null>(null);

  const [manageVisible, setManageVisible] = useState(false);



  const [songs, setSongs] = useState<Mezmur[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const { recentSearches, addRecentSearch } = useRecentSearches(

    `listen-songs-${artist}-${album}`

  );



  const load = useCallback(async () => {

    if (!artist || !album) return;

    setLoading(true);

    setError(null);

    try {

      if (isUserPlaylist) {

        const all = await fetchUserPlaylists();

        const playlist = all.find((p) => p.id === album);

        if (!playlist) {

          setSongs([]);

          setPlaylistTitle(album);

          setUserPlaylist(null);

          return;

        }

        setUserPlaylist(playlist);

        setPlaylistTitle(playlist.title);

        setSongs(await resolveUserPlaylistSongs(playlist));

        return;

      }

      const rows = await fetchSongsByArtistAlbum(artist, album);

      setSongs(rows);

      setPlaylistTitle(album);

      setUserPlaylist(null);

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Could not load songs.');

      setSongs([]);

    } finally {

      setLoading(false);

    }

  }, [album, artist, isUserPlaylist]);



  useEffect(() => {

    void load();

  }, [load]);



  const filteredSongs = useMemo(

    () => filterByQuery(songs, searchQuery, (song) => [song.title, song.language]),

    [searchQuery, songs]

  );



  const albumThumbnailUrl = useMemo(() => {

    if (isUserPlaylist && userPlaylist) {

      return userPlaylistThumbnail(userPlaylist);

    }

    if (artist && album) return pickAlbumThumbnailUrl(artist, album, songs);

    return null;

  }, [album, artist, isUserPlaylist, songs, userPlaylist]);



  const playSong = useCallback(

    (song: Mezmur) => {

      const queue = mezmurListToAudioTracks(songs);

      playTrack(mezmurToAudioTrack(song), { queue, autoPlay: true, openFullPlayer: true });

    },

    [playTrack, songs]

  );



  const playAll = useCallback(() => {

    const first = songs[0];

    if (!first) return;

    playSong(first);

  }, [playSong, songs]);



  if (!artist || !album) {

    return (

      <ScreenScrollView includeFloatingChrome>

        <EmptyState title="Playlist not found" />

      </ScreenScrollView>

    );

  }



  return (

    <ScreenScrollView includeFloatingChrome>

      <MezmurAlbumHero

        artist={isUserPlaylist ? playlistOwnerName : artist}

        album={playlistTitle}

        songCount={songs.length}

        thumbnailUrl={albumThumbnailUrl}

        channelHref={isUserPlaylist ? '/profile' : undefined}

        useProfileChannel={isUserPlaylist}

        onMenuPress={isUserPlaylist ? () => setManageVisible(true) : undefined}

      />



      <View style={styles.searchRow}>

        {songs.length > 0 ? (

          <OrthodoxPressable

            style={styles.playButton}

            onPress={playAll}

            accessibilityRole="button"

            accessibilityLabel="Play album">

            <Icon name="play" size={20} color={Palette.background} />

          </OrthodoxPressable>

        ) : null}

        <View style={styles.searchField}>

          <SearchBar

            placeholder="Search songs"

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

      </View>



      {loading ? (

        <ActivityIndicator color={Palette.gold} style={styles.spinner} />

      ) : error ? (

        <EmptyState title={error} suggestion={t('scripture.tryAgain')} />

      ) : songs.length === 0 ? (

        <EmptyState

          title={isUserPlaylist ? t('listen.emptyUserPlaylist') : 'No songs found'}

          suggestion={

            isUserPlaylist ? t('listen.addSongsFromMenu') : 'Try again later.'

          }

        />

      ) : filteredSongs.length === 0 ? (

        <EmptyState title="No songs match your search" suggestion="Try a different term." />

      ) : (

        <View style={styles.list}>

          {filteredSongs.map((song, index) => (

            <View key={song.videoId}>

              <MezmurSongRow

                title={song.title}

                subtitle={song.language ?? undefined}

                thumbnailUrl={song.thumbnailUrl}

                videoId={song.videoId}

                audioTrack={mezmurToAudioTrack(song)}

                onPress={() => playSong(song)}

                onRemove={

                  isUserPlaylist

                    ? () => {

                        void removeSongFromUserPlaylist(album, song.videoId).then(() => void load());

                      }

                    : undefined

                }

                removeLabel={isUserPlaylist ? 'Remove from playlist' : undefined}

              />

              {index < filteredSongs.length - 1 ? <View style={styles.divider} /> : null}

            </View>

          ))}

        </View>

      )}



      {isUserPlaylist ? (

        <MezmurPlaylistManageSheet

          visible={manageVisible}

          playlist={userPlaylist}

          songs={songs}

          onClose={() => setManageVisible(false)}

          onUpdated={() => void load()}

          onDeleted={() => router.back()}

        />

      ) : null}

    </ScreenScrollView>

  );

}



const styles = StyleSheet.create({

  searchRow: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: Space.s12,

    marginBottom: Space.s16,

  },

  searchField: {

    flex: 1,

    minWidth: 0,

  },

  playButton: {

    width: Layout.searchBarHeight,

    height: Layout.searchBarHeight,

    borderRadius: Layout.searchBarHeight / 2,

    backgroundColor: Palette.gold,

    alignItems: 'center',

    justifyContent: 'center',

    paddingLeft: 2,

    marginTop: 0,

  },

  spinner: { marginTop: Spacing.xxl },

  list: { marginTop: 2 },

  divider: {

    height: StyleSheet.hairlineWidth,

    backgroundColor: Layout.cardBorder,

    marginLeft: 68,

  },

});

