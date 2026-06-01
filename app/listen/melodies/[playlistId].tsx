import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import { findYaredPlaylist } from '@/data/yaredMelodiesCatalog';
import { useTranslation } from '@/hooks/use-translation';

export default function YaredMelodyPlaylistScreen() {
  const { t, mode } = useTranslation();
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const match = typeof playlistId === 'string' ? findYaredPlaylist(playlistId) : null;

  if (!match) {
    return (
      <ScreenScrollView includeFloatingChrome>
        <EmptyState title="Playlist not found" suggestion="Return to the Chants catalog." />
      </ScreenScrollView>
    );
  }

  const { shelf, playlist } = match;

  return (
    <ScreenScrollView includeFloatingChrome>
      <OrthodoxPressable
        style={styles.topBar}
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.push({ pathname: '/listen/melodies', params: { shelf: shelf.id } } as never);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('settings.back')}>
        <ThemedText type="seeAll">← {t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      <ThemedText style={styles.eyebrow}>{t(shelf.titleKey)}</ThemedText>
      <ThemedText style={styles.pageTitle}>{t(playlist.titleKey)}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>{playlist.geez}</ThemedText> : null}

      <EmptyState
        title={t('listen.yaredPlaylistComingSoon')}
        suggestion={t('listen.yaredPlaylistComingSoonHint')}
      />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 17,
    color: Palette.gold,
    marginBottom: 4,
  },
});
