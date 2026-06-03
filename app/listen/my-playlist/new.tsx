import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreatePlaylistForm } from '@/components/listen/create-playlist-form';
import { AppBackButton } from '@/components/ui/app-back-button';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { Layout, Spacing } from '@/constants/theme';
import { userPlaylistArtistForKind } from '@/data/userPlaylists';
import type { SavedListenKind } from '@/hooks/use-saved-hymns';
import { createUserPlaylist } from '@/hooks/use-user-playlists';
import { encodeRouteParam } from '@/lib/mezmur';

function parsePlaylistKind(raw: string | string[] | undefined): SavedListenKind {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'sermon' || value === 'melody') return value;
  return 'hymn';
}

export default function NewUserPlaylistScreen() {
  const insets = useSafeAreaInsets();
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>();
  const playlistKind = useMemo(() => parsePlaylistKind(kindParam), [kindParam]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const playlist = await createUserPlaylist(trimmed, [], null, playlistKind);
      router.replace(
        `/listen/${encodeRouteParam(userPlaylistArtistForKind(playlistKind))}/${encodeRouteParam(playlist.id)}` as never
      );
    } finally {
      setSaving(false);
    }
  }, [playlistKind, saving, title]);

  return (
    <ThemedView style={styles.screen}>
      <SacredAtmosphere />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }]}>
        <AppBackButton style={styles.backBtn} />
      </View>

      <View style={styles.form}>
        <CreatePlaylistForm
          title={title}
          onTitleChange={setTitle}
          onSubmit={() => void save()}
          saving={saving}
          showCover={false}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.pagePadding,
    paddingBottom: 0,
  },
  backBtn: {
    marginLeft: -2,
    paddingVertical: 0,
  },
  form: {
    flex: 1,
    paddingHorizontal: Layout.pagePadding,
  },
});
