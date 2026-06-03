import { Image } from 'expo-image';

import { useCallback, useState } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { Icon } from '@/components/Icon';

import { OrthodoxPressable } from '@/components/orthodox-pressable';

import { ThemedText } from '@/components/themed-text';

import { BorderRadius, Layout, Palette, Space, Spacing } from '@/constants/theme';

import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

import { useTranslation } from '@/hooks/use-translation';

import { pickPlaylistCoverImage } from '@/lib/pick-playlist-cover';



/** Full-screen create flow — slightly above the compact layout. */

const COVER_W_FULL = 92;

const COVER_H_FULL = Math.round((COVER_W_FULL * 9) / 16);

const COVER_W_EMBEDDED = 88;

const COVER_H_EMBEDDED = Math.round((COVER_W_EMBEDDED * 9) / 16);



type CreatePlaylistFormProps = {

  title: string;

  onTitleChange: (value: string) => void;

  coverUri?: string | null;

  onCoverChange?: (uri: string | null) => void;

  onSubmit: () => void;

  saving?: boolean;

  submitLabel?: string;

  /** Hide cover row (quick create from Add to Playlist). */

  showCover?: boolean;

  /** Inline in a bottom sheet — less top padding. */

  embedded?: boolean;

};



export function CreatePlaylistForm({

  title,

  onTitleChange,

  coverUri = null,

  onCoverChange,

  onSubmit,

  saving = false,

  submitLabel,

  showCover = true,

  embedded = false,

}: CreatePlaylistFormProps) {

  const { t } = useTranslation();

  const insets = useSafeAreaInsets();

  const keyboardHeight = useKeyboardHeight();

  const [pickingCover, setPickingCover] = useState(false);



  const pickCover = useCallback(async () => {

    if (!onCoverChange) return;

    setPickingCover(true);

    try {

      const uri = await pickPlaylistCoverImage();

      if (uri) onCoverChange(uri);

    } finally {

      setPickingCover(false);

    }

  }, [onCoverChange]);



  const canSave = title.trim().length > 0 && !saving;

  const footerPad = Math.max(insets.bottom, 10) + 8;

  const coverW = embedded ? COVER_W_EMBEDDED : COVER_W_FULL;

  const coverH = embedded ? COVER_H_EMBEDDED : COVER_H_FULL;



  return (

    <View style={styles.flex}>

      <ScrollView

        style={styles.flex}

        contentContainerStyle={[

          styles.scrollGrow,

          embedded ? styles.scrollEmbedded : styles.scrollFull,

        ]}

        keyboardShouldPersistTaps="handled"

        showsVerticalScrollIndicator={false}>

        {!embedded ? (

          <View style={styles.hero}>

            <View style={styles.heroIcon}>

              <Icon name="music" size={22} color={Palette.gold} />

            </View>

            <ThemedText style={styles.heroTitle}>{t('listen.newPlaylist')}</ThemedText>

          </View>

        ) : null}



        <View style={[styles.card, !embedded && styles.cardFull]}>

          <ThemedText style={styles.fieldLabel}>{t('listen.playlistNameLabel')}</ThemedText>

          <TextInput

            value={title}

            onChangeText={onTitleChange}

            placeholder={t('listen.playlistTitlePlaceholder')}

            placeholderTextColor="rgba(168, 160, 146, 0.55)"

            style={[styles.titleInput, !embedded && styles.titleInputFull]}

            autoFocus={!embedded}

            maxLength={80}

            returnKeyType="done"

            onSubmitEditing={() => {

              if (canSave) onSubmit();

            }}

            editable={!saving}

          />

          <ThemedText type="muted" style={styles.charCount}>

            {title.length}/80

          </ThemedText>

        </View>



        {showCover && onCoverChange ? (

          <View style={[styles.card, !embedded && styles.cardFull]}>

            <ThemedText style={styles.fieldLabel}>{t('listen.playlistCoverOptional')}</ThemedText>

            <View style={styles.coverRow}>

              <OrthodoxPressable

                style={[styles.coverFrame, { width: coverW, height: coverH }]}

                onPress={() => void pickCover()}

                disabled={pickingCover}

                accessibilityRole="button"

                accessibilityLabel={t('listen.choosePlaylistCover')}>

                {coverUri ? (

                  <Image source={{ uri: coverUri }} style={styles.coverImage} contentFit="cover" />

                ) : (

                  <View style={styles.coverEmpty}>

                    <Icon name="music" size={24} color={Palette.mutedGold} />

                  </View>

                )}

                {pickingCover ? (

                  <View style={styles.coverLoading}>

                    <ActivityIndicator color={Palette.gold} size="small" />

                  </View>

                ) : null}

              </OrthodoxPressable>



              <View style={styles.coverActions}>

                <OrthodoxPressable

                  style={[styles.coverBtn, !embedded && styles.coverBtnFull]}

                  onPress={() => void pickCover()}

                  disabled={pickingCover}>

                  <ThemedText style={styles.coverBtnLabel}>

                    {coverUri ? t('listen.changePlaylistCover') : t('listen.choosePlaylistCover')}

                  </ThemedText>

                </OrthodoxPressable>

                {coverUri ? (

                  <OrthodoxPressable

                    style={styles.coverBtnSecondary}

                    onPress={() => onCoverChange(null)}

                    disabled={pickingCover}>

                    <ThemedText type="muted" style={styles.coverBtnSecondaryLabel}>

                      {t('listen.removeCover')}

                    </ThemedText>

                  </OrthodoxPressable>

                ) : null}

              </View>

            </View>

          </View>

        ) : null}

      </ScrollView>



      <View

        style={[

          styles.footer,

          !embedded && styles.footerFull,

          {

            marginBottom: keyboardHeight,

            paddingBottom: keyboardHeight > 0 ? Space.s8 : footerPad,

          },

        ]}>

        <OrthodoxPressable

          style={[styles.submitBtn, !embedded && styles.submitBtnFull, !canSave && styles.submitBtnDisabled]}

          onPress={onSubmit}

          disabled={!canSave}

          accessibilityRole="button"

          accessibilityLabel={submitLabel ?? t('listen.savePlaylist')}>

          <ThemedText style={styles.submitLabel}>

            {saving ? '…' : (submitLabel ?? t('listen.savePlaylist'))}

          </ThemedText>

        </OrthodoxPressable>

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  flex: { flex: 1 },

  scrollGrow: {

    flexGrow: 1,

  },

  scrollFull: {

    paddingTop: 0,

    gap: Space.s8,

  },

  scrollEmbedded: {

    paddingTop: 0,

    gap: Space.s12,

  },

  hero: {

    alignItems: 'center',

    paddingVertical: Space.s12,

    paddingHorizontal: Space.s8,

    gap: Space.s8,

  },

  heroIcon: {

    width: 48,

    height: 48,

    borderRadius: 24,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(201, 147, 58, 0.12)',

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: 'rgba(201, 147, 58, 0.35)',

  },

  heroTitle: {

    fontSize: 21,

    fontWeight: '700',

    color: Palette.text,

    letterSpacing: -0.2,

  },

  card: {

    borderRadius: BorderRadius.lg,

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: Layout.cardBorder,

    backgroundColor: Palette.card,

    padding: Space.s16,

    gap: Space.s8,

  },

  cardFull: {

    padding: Space.s12,

    gap: Space.s8,

  },

  fieldLabel: {

    fontSize: 11,

    fontWeight: '600',

    letterSpacing: 0.6,

    textTransform: 'uppercase',

    color: Palette.mutedGold,

  },

  titleInput: {

    fontSize: 20,

    fontWeight: '600',

    color: Palette.text,

    paddingVertical: Space.s12,

    paddingHorizontal: 0,

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: 'rgba(201, 147, 58, 0.25)',

  },

  titleInputFull: {

    fontSize: 18,

    paddingVertical: Space.s8,

  },

  charCount: {

    fontSize: 11,

    alignSelf: 'flex-end',

  },

  coverRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: Space.s12,

    marginTop: Space.s8,

  },

  coverFrame: {

    borderRadius: BorderRadius.md,

    overflow: 'hidden',

    backgroundColor: 'rgba(22, 19, 16, 0.9)',

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: 'rgba(201, 147, 58, 0.28)',

  },

  coverImage: { width: '100%', height: '100%' },

  coverEmpty: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

  },

  coverLoading: {

    ...StyleSheet.absoluteFillObject,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(0,0,0,0.4)',

  },

  coverActions: {

    flex: 1,

    minWidth: 0,

    gap: Space.s8,

  },

  coverBtn: {

    paddingVertical: Space.s12,

    paddingHorizontal: Space.s12,

    borderRadius: BorderRadius.md,

    backgroundColor: 'rgba(201, 147, 58, 0.1)',

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: 'rgba(201, 147, 58, 0.35)',

  },

  coverBtnFull: {

    paddingVertical: Space.s12,

    paddingHorizontal: Space.s12,

  },

  coverBtnLabel: {

    fontSize: 14,

    fontWeight: '600',

    color: Palette.gold,

  },

  coverBtnSecondary: {

    paddingVertical: Space.s4,

  },

  coverBtnSecondaryLabel: {

    fontSize: 12,

  },

  footer: {

    paddingHorizontal: 0,

    paddingTop: Space.s12,

    borderTopWidth: StyleSheet.hairlineWidth,

    borderTopColor: Layout.cardBorderThin,

    backgroundColor: 'transparent',

  },

  footerFull: {

    paddingTop: Space.s8,

  },

  submitBtn: {

    alignItems: 'center',

    justifyContent: 'center',

    height: 52,

    borderRadius: BorderRadius.md,

    backgroundColor: Palette.gold,

  },

  submitBtnFull: {

    height: 46,

  },

  submitBtnDisabled: {

    opacity: 0.4,

  },

  submitLabel: {

    fontSize: 15,

    fontWeight: '700',

    color: Palette.background,

  },

});


