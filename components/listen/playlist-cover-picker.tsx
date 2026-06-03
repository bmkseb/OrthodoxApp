import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThumbnailCollage } from '@/components/listen/thumbnail-collage';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { MEZMUR_ALBUM_HERO_FRAME, MEZMUR_ALBUM_LIST_FRAME } from '@/constants/mezmur-album-art';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { pickPlaylistCoverImage } from '@/lib/pick-playlist-cover';

const SETTINGS_COVER_W = MEZMUR_ALBUM_HERO_FRAME.width;
const SETTINGS_COVER_H = MEZMUR_ALBUM_HERO_FRAME.height;

type PlaylistCoverPickerProps = {
  imageUri?: string | null;
  /** Automatic 2×2 art when no custom cover. */
  collageUris?: string[];
  /** When true, offer to remove the custom cover photo. */
  hasCustomCover?: boolean;
  onImageChange: (uri: string | null) => void;
  /** Text buttons, settings row, or centered overlay. */
  ui?: 'buttons' | 'overlay' | 'settings';
  /** Compact row style vs larger block on create screen. */
  variant?: 'row' | 'block';
};

export function PlaylistCoverPicker({
  imageUri,
  collageUris,
  hasCustomCover = false,
  onImageChange,
  ui = 'buttons',
  variant = 'block',
}: PlaylistCoverPickerProps) {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);

  const pick = useCallback(async () => {
    setPicking(true);
    try {
      const uri = await pickPlaylistCoverImage();
      if (uri) onImageChange(uri);
    } finally {
      setPicking(false);
    }
  }, [onImageChange]);

  const clear = useCallback(() => onImageChange(null), [onImageChange]);

  const openOverlayMenu = useCallback(() => {
    const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
      { text: t('listen.changePlaylistCover'), onPress: () => void pick() },
    ];
    if (hasCustomCover) {
      buttons.push({
        text: t('listen.removeCover'),
        style: 'destructive',
        onPress: clear,
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(t('listen.playlistCoverOptional'), undefined, buttons);
  }, [clear, hasCustomCover, pick, t]);

  const onPress =
    ui === 'overlay' || ui === 'settings' ? openOverlayMenu : () => void pick();

  const coverFrame = (
    <OrthodoxPressable
      style={[
        styles.frame,
        ui === 'settings'
          ? styles.frameSettings
          : ui === 'overlay'
            ? styles.frameOverlay
            : variant === 'block'
              ? styles.frameBlock
              : styles.frameRow,
      ]}
      onPress={onPress}
      disabled={picking}
      accessibilityRole="button"
      accessibilityLabel={
        ui === 'overlay' || ui === 'settings'
          ? t('listen.changePlaylistCover')
          : t('listen.choosePlaylistCover')
      }>
      {imageUri ? (
        <>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, (ui === 'overlay' || ui === 'settings') && styles.imageSoftDim]}
            contentFit="cover"
          />
          {ui === 'overlay' || ui === 'settings' ? (
            <View style={styles.editOverlay} pointerEvents="none">
              <View style={styles.pencilBadge}>
                <Icon name="pencil" size={18} color={Palette.text} strokeWidth={2} />
              </View>
            </View>
          ) : null}
        </>
      ) : (collageUris?.filter(Boolean).length ?? 0) > 0 ? (
        <>
          <ThumbnailCollage uris={collageUris!} style={styles.image} />
          {ui === 'overlay' || ui === 'settings' ? (
            <View style={styles.editOverlay} pointerEvents="none">
              <View style={styles.pencilBadge}>
                <Icon name="pencil" size={18} color={Palette.text} strokeWidth={2} />
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <Icon name="music" size={ui === 'settings' ? 24 : 28} color={Palette.mutedGold} />
          {ui !== 'settings' ? (
            <ThemedText type="muted" style={styles.placeholderText}>
              {t('listen.playlistCoverHint')}
            </ThemedText>
          ) : null}
        </View>
      )}

      {picking ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Palette.gold} />
        </View>
      ) : null}
    </OrthodoxPressable>
  );

  if (ui === 'settings') {
    return (
      <View style={styles.settingsRow}>
        {coverFrame}
        <View style={styles.settingsCopy}>
          <ThemedText type="muted" style={styles.settingsHint}>
            {t('listen.editCoverHint')}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={
        ui === 'overlay'
          ? styles.overlayWrap
          : variant === 'block'
            ? styles.blockWrap
            : styles.rowWrap
      }>
      {coverFrame}

      {ui === 'buttons' ? (
        <View style={styles.actions}>
          <OrthodoxPressable style={styles.actionBtn} onPress={() => void pick()} disabled={picking}>
            <ThemedText style={styles.actionLabel}>
              {imageUri ? t('listen.changePlaylistCover') : t('listen.choosePlaylistCover')}
            </ThemedText>
          </OrthodoxPressable>
          {hasCustomCover ? (
            <OrthodoxPressable style={styles.actionBtn} onPress={clear}>
              <ThemedText type="muted" style={styles.clearLabel}>
                {t('listen.removeCover')}
              </ThemedText>
            </OrthodoxPressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  blockWrap: { marginBottom: Space.s16, gap: Space.s12 },
  rowWrap: { marginBottom: Space.s16, gap: Space.s12 },
  overlayWrap: { marginBottom: Space.s16, alignItems: 'center' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
  },
  settingsCopy: {
    flex: 1,
    minWidth: 0,
    gap: Space.s4,
  },
  settingsHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  frame: {
    borderRadius: MEZMUR_ALBUM_LIST_FRAME.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    backgroundColor: 'rgba(22, 19, 16, 0.9)',
    overflow: 'hidden',
  },
  frameBlock: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
    aspectRatio: 16 / 9,
  },
  frameRow: {
    width: MEZMUR_ALBUM_LIST_FRAME.width * 2,
    height: MEZMUR_ALBUM_LIST_FRAME.height * 2,
    alignSelf: 'flex-start',
  },
  frameOverlay: {
    width: MEZMUR_ALBUM_LIST_FRAME.width,
    height: MEZMUR_ALBUM_LIST_FRAME.height,
    alignSelf: 'center',
    borderRadius: MEZMUR_ALBUM_LIST_FRAME.borderRadius,
  },
  frameSettings: {
    width: SETTINGS_COVER_W,
    height: SETTINGS_COVER_H,
    borderRadius: BorderRadius.md,
  },
  image: { width: '100%', height: '100%' },
  imageSoftDim: { opacity: 0.88 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    padding: Space.s12,
  },
  placeholderText: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 14, 12, 0.35)',
  },
  pencilBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 28, 22, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  actions: { gap: Space.s8 },
  actionBtn: { paddingVertical: Space.s4 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: Palette.gold },
  clearLabel: { fontSize: 13 },
});
