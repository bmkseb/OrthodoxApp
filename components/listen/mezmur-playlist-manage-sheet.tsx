import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PlaylistCoverPicker } from '@/components/listen/playlist-cover-picker';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import type { UserPlaylist } from '@/hooks/use-user-playlists';
import {
  deleteUserPlaylist,
  renameUserPlaylist,
  setUserPlaylistCoverImage,
} from '@/hooks/use-user-playlists';
import { useTranslation } from '@/hooks/use-translation';
import type { Mezmur } from '@/lib/mezmur';

const SHEET_BG = '#1A1815';

type MezmurPlaylistManageSheetProps = {
  visible: boolean;
  playlist: UserPlaylist | null;
  songs: Mezmur[];
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

export function MezmurPlaylistManageSheet({
  visible,
  playlist,
  onClose,
  onUpdated,
  onDeleted,
}: MezmurPlaylistManageSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [renameDraft, setRenameDraft] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible && playlist) {
      setRenameDraft(playlist.title);
      setCoverUri(playlist.coverImageUri ?? null);
    }
  }, [visible, playlist]);

  const save = useCallback(async () => {
    if (!playlist) return;
    const title = renameDraft.trim();
    if (title && title !== playlist.title) {
      await renameUserPlaylist(playlist.id, title);
    }
    const prevCover = playlist.coverImageUri ?? null;
    if (coverUri !== prevCover) {
      await setUserPlaylistCoverImage(playlist.id, coverUri);
    }
    onUpdated();
    onClose();
  }, [coverUri, onClose, onUpdated, playlist, renameDraft]);

  const remove = useCallback(async () => {
    if (!playlist) return;
    await deleteUserPlaylist(playlist.id);
    onDeleted();
    onClose();
  }, [onClose, onDeleted, playlist]);

  const confirmRemove = useCallback(() => {
    if (!playlist) return;
    Alert.alert(
      t('listen.deletePlaylistConfirmTitle'),
      t('listen.deletePlaylistConfirmMessage'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('listen.deletePlaylist'),
          style: 'destructive',
          onPress: () => void remove(),
        },
      ]
    );
  }, [playlist, remove, t]);

  if (!playlist) return null;

  const footerPad = Math.max(insets.bottom, 16) + 12;
  const titleLen = renameDraft.length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={styles.sheet}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.heading}>{t('listen.managePlaylist')}</ThemedText>
            <OrthodoxPressable
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Icon name="close" size={18} color={Palette.mutedGold} />
            </OrthodoxPressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <ThemedText style={styles.fieldLabel}>{t('listen.playlistNameLabel')}</ThemedText>
              <TextInput
                value={renameDraft}
                onChangeText={setRenameDraft}
                placeholder={t('listen.playlistTitlePlaceholder')}
                placeholderTextColor="rgba(168, 160, 146, 0.55)"
                style={styles.titleInput}
                maxLength={80}
              />
              <ThemedText type="muted" style={styles.charCount}>
                {titleLen}/80
              </ThemedText>
            </View>

            <View style={styles.card}>
              <ThemedText style={styles.fieldLabel}>{t('listen.playlistCoverOptional')}</ThemedText>
              <PlaylistCoverPicker
                imageUri={coverUri}
                hasCustomCover={Boolean(coverUri)}
                onImageChange={setCoverUri}
                ui="settings"
              />
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                marginBottom: keyboardHeight,
                paddingBottom: keyboardHeight > 0 ? Space.s12 : footerPad,
              },
            ]}>
            <OrthodoxPressable style={styles.saveBtn} onPress={() => void save()}>
              <ThemedText style={styles.saveLabel}>{t('listen.savePlaylist')}</ThemedText>
            </OrthodoxPressable>

            <OrthodoxPressable style={styles.deleteBtn} onPress={confirmRemove}>
              <ThemedText style={styles.deleteLabel}>{t('listen.deletePlaylist')}</ThemedText>
            </OrthodoxPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Layout.pagePadding,
    maxHeight: '88%',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Space.s8,
    paddingBottom: Space.s4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(201, 147, 58, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.s8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  scrollContent: {
    gap: Space.s8,
    paddingBottom: Space.s4,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
    padding: Space.s12,
    gap: Space.s4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    paddingVertical: Space.s4,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(201, 147, 58, 0.25)',
  },
  charCount: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  footer: {
    paddingTop: Space.s8,
    gap: Space.s8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Layout.cardBorderThin,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.gold,
  },
  saveLabel: { fontSize: 16, fontWeight: '700', color: Palette.background },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: Space.s4,
  },
  deleteLabel: { fontSize: 15, fontWeight: '600', color: Palette.crimson },
});
