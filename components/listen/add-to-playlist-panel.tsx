import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CreatePlaylistForm } from '@/components/listen/create-playlist-form';
import { UserPlaylistThumbnail } from '@/components/listen/user-playlist-thumbnail';
import { Icon } from '@/components/Icon';
import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Palette, Space } from '@/constants/theme';
import { userPlaylistArtistForKind } from '@/data/userPlaylists';
import type { SavedListenKind } from '@/hooks/use-saved-hymns';
import {
  addSongToUserPlaylist,
  createUserPlaylist,
  useUserPlaylists,
} from '@/hooks/use-user-playlists';
import { useTranslation } from '@/hooks/use-translation';
import { encodeRouteParam } from '@/lib/mezmur';
import { router } from 'expo-router';

type AddToPlaylistPanelProps = {
  videoId: string;
  songTitle: string;
  playlistKind?: SavedListenKind;
  onBack?: () => void;
  onDone?: () => void;
};

function normalizeVideoId(videoId: string): string {
  return videoId.trim();
}

export function AddToPlaylistPanel({
  videoId,
  songTitle,
  playlistKind = 'hymn',
  onBack,
  onDone,
}: AddToPlaylistPanelProps) {
  const { t } = useTranslation();
  const { playlists, refresh, ready } = useUserPlaylists(playlistKind);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const vid = normalizeVideoId(videoId);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setCreating(false);
    setNewTitle('');
    setBusy(false);
  }, [videoId]);

  const addToExisting = useCallback(
    async (playlistId: string) => {
      if (!vid || busy) return;
      setBusy(true);
      try {
        const ok = await addSongToUserPlaylist(playlistId, vid);
        if (ok) {
          await refresh();
          onDone?.();
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, onDone, refresh, vid]
  );

  const saveNewPlaylist = useCallback(async () => {
    const title = newTitle.trim();
    if (!title || !vid || busy) return;
    setBusy(true);
    try {
      const playlist = await createUserPlaylist(title, [vid], null, playlistKind);
      await refresh();
      onDone?.();
      router.push(
        `/listen/${encodeRouteParam(userPlaylistArtistForKind(playlistKind))}/${encodeRouteParam(playlist.id)}` as never
      );
    } finally {
      setBusy(false);
    }
  }, [busy, newTitle, onDone, playlistKind, refresh, vid]);

  if (creating) {
    return (
      <View style={styles.wrap}>
        {onBack ? (
          <AppBackButton style={styles.backRow} onPress={() => setCreating(false)} />
        ) : null}
        <CreatePlaylistForm
          title={newTitle}
          onTitleChange={setNewTitle}
          onSubmit={() => void saveNewPlaylist()}
          saving={busy}
          submitLabel={t('listen.savePlaylist')}
          showCover={false}
          embedded
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {onBack ? <AppBackButton style={styles.backRow} onPress={onBack} /> : null}

      <View style={styles.songChip}>
        <Icon name="music" size={14} color={Palette.gold} />
        <ThemedText type="muted" style={styles.songChipText} numberOfLines={2}>
          {songTitle}
        </ThemedText>
      </View>

      <ThemedText style={styles.heading}>{t('listen.addToPlaylist')}</ThemedText>

      <ThemedText style={styles.sectionLabel}>{t('listen.yourPlaylists')}</ThemedText>

      <ScrollView
        style={styles.listScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {!ready ? (
          <ThemedText type="muted" style={styles.empty}>
            …
          </ThemedText>
        ) : playlists.length === 0 ? (
          <ThemedText type="muted" style={styles.empty}>
            {t('listen.noPlaylistsYet')}
          </ThemedText>
        ) : (
          playlists.map((playlist) => {
            const hasSong = vid ? playlist.videoIds.includes(vid) : false;
            return (
              <OrthodoxPressable
                key={playlist.id}
                style={[styles.playlistRow, hasSong && styles.playlistRowDisabled]}
                onPress={() => void addToExisting(playlist.id)}
                disabled={hasSong || busy || !vid}
                accessibilityRole="button"
                accessibilityLabel={playlist.title}>
                <View style={styles.playlistIcon}>
                  <UserPlaylistThumbnail
                    playlist={playlist}
                    style={styles.playlistThumb}
                    placeholderIconSize={18}
                  />
                </View>
                <View style={styles.playlistCopy}>
                  <ThemedText style={styles.playlistTitle} numberOfLines={1}>
                    {playlist.title}
                  </ThemedText>
                  <ThemedText type="muted" style={styles.playlistMeta}>
                    {hasSong
                      ? t('listen.alreadyInPlaylist')
                      : `${playlist.videoIds.length} ${playlist.videoIds.length === 1 ? 'song' : 'songs'}`}
                  </ThemedText>
                </View>
              </OrthodoxPressable>
            );
          })
        )}

        <OrthodoxPressable
          style={styles.playlistRow}
          onPress={() => setCreating(true)}
          disabled={busy || !vid}
          accessibilityRole="button"
          accessibilityLabel={t('listen.newPlaylist')}>
          <View style={[styles.playlistIcon, styles.newPlaylistIcon]}>
            <ThemedText style={styles.plus}>+</ThemedText>
          </View>
          <View style={styles.playlistCopy}>
            <ThemedText style={styles.playlistTitle} numberOfLines={1}>
              {t('listen.newPlaylist')}
            </ThemedText>
          </View>
        </OrthodoxPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 200 },
  backRow: { marginBottom: Space.s8, paddingVertical: 0 },
  songChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    paddingVertical: Space.s12,
    paddingHorizontal: Space.s12,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
    marginBottom: Space.s12,
  },
  songChipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: Space.s12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: Space.s8,
  },
  newPlaylistIcon: {
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
    borderColor: 'rgba(201, 147, 58, 0.35)',
  },
  plus: { fontSize: 20, lineHeight: 22, fontWeight: '500', color: Palette.gold },
  listScroll: { maxHeight: 280 },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
    paddingVertical: Space.s12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(201, 147, 58, 0.1)',
  },
  playlistRowDisabled: { opacity: 0.45 },
  playlistIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(22, 19, 16, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  playlistThumb: {
    width: '100%',
    height: '100%',
  },
  playlistCopy: { flex: 1, gap: 2 },
  playlistTitle: { fontSize: 15, fontWeight: '600', color: Palette.text },
  playlistMeta: { fontSize: 12 },
  empty: { textAlign: 'center', paddingVertical: Space.s24 },
});
