import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreatePlaylistForm } from '@/components/listen/create-playlist-form';
import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { USER_PLAYLIST_ARTIST } from '@/data/userPlaylists';
import { createUserPlaylist } from '@/hooks/use-user-playlists';
import { useTranslation } from '@/hooks/use-translation';
import { encodeRouteParam } from '@/lib/mezmur';

export default function NewUserPlaylistScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const playlist = await createUserPlaylist(trimmed, [], coverUri);
      router.replace(
        `/listen/${encodeRouteParam(USER_PLAYLIST_ARTIST)}/${encodeRouteParam(playlist.id)}` as never
      );
    } finally {
      setSaving(false);
    }
  }, [coverUri, saving, title]);

  return (
    <ThemedView style={styles.screen}>
      <SacredAtmosphere />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }]}>
        <OrthodoxPressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('settings.back')}>
          <Icon name="chevron-left" size={20} color={Palette.text} />
        </OrthodoxPressable>
      </View>

      <View style={styles.form}>
        <CreatePlaylistForm
          title={title}
          onTitleChange={setTitle}
          coverUri={coverUri}
          onCoverChange={setCoverUri}
          onSubmit={() => void save()}
          saving={saving}
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  form: {
    flex: 1,
    paddingHorizontal: Layout.pagePadding,
  },
});
