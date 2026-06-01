import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { HIGHLIGHT_COLORS } from '@/constants/highlight-colors';
import { BorderRadius, Palette, Space } from '@/constants/theme';

export type VerseActionTarget = {
  reference: string;
  text: string;
  color: string | null;
  note: string | null;
};

type VerseActionSheetProps = {
  visible: boolean;
  target: VerseActionTarget | null;
  onClose: () => void;
  onHighlight: (color: string | null) => void;
  onSaveNote: (note: string) => void;
  onRemove: () => void;
};

const SHEET_BG = '#1A1815';

export function VerseActionSheet({
  visible,
  target,
  onClose,
  onHighlight,
  onSaveNote,
  onRemove,
}: VerseActionSheetProps) {
  const insets = useSafeAreaInsets();
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (visible) setNoteDraft(target?.note ?? '');
  }, [visible, target?.note]);

  const hasSaved = Boolean(target?.color || target?.note);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />

        <View style={[styles.sheet, { paddingBottom: 20 + Math.max(insets.bottom, 8) }]}>
          <View style={styles.handle} />

          {target ? (
            <>
              <ThemedText style={styles.reference}>{target.reference}</ThemedText>
              <ThemedText style={styles.verseText} numberOfLines={3}>
                {target.text}
              </ThemedText>

              <ThemedText style={styles.sectionLabel}>Highlight</ThemedText>
              <View style={styles.swatchRow}>
                {HIGHLIGHT_COLORS.map((c) => {
                  const active = target.color === c.value;
                  return (
                    <Pressable
                      key={c.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Highlight ${c.key}`}
                      onPress={() => onHighlight(active ? null : c.value)}
                      style={[
                        styles.swatch,
                        { backgroundColor: c.swatch },
                        active && styles.swatchActive,
                      ]}>
                      {active ? <Icon name="cross" size={14} color={Palette.text} /> : null}
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear highlight"
                  onPress={() => onHighlight(null)}
                  style={[styles.swatch, styles.swatchClear]}>
                  <Icon name="close" size={16} color={Palette.muted} />
                </Pressable>
              </View>

              <ThemedText style={styles.sectionLabel}>Note</ThemedText>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Add a comment on this verse…"
                placeholderTextColor={Palette.muted}
                multiline
                style={styles.noteInput}
              />

              <View style={styles.actions}>
                {hasSaved ? (
                  <OrthodoxPressable
                    style={[styles.actionBtn, styles.removeBtn]}
                    onPress={onRemove}
                    accessibilityLabel="Remove Highlight">
                    <Icon name="close" size={16} color={Palette.crimson} />
                    <ThemedText style={[styles.actionLabel, styles.removeLabel]}>Remove Highlight</ThemedText>
                  </OrthodoxPressable>
                ) : (
                  <View style={styles.actionBtn} />
                )}

                <OrthodoxPressable
                  style={[styles.actionBtn, styles.saveBtn]}
                  onPress={() => onSaveNote(noteDraft)}
                  accessibilityLabel="Save note">
                  <Icon name="bookmark" size={16} color={Palette.background} />
                  <ThemedText style={[styles.actionLabel, styles.saveLabel]}>Save</ThemedText>
                </OrthodoxPressable>
              </View>
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(201, 147, 58, 0.3)',
    marginBottom: 18,
  },
  reference: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.gold,
  },
  verseText: {
    marginTop: Space.s4,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(245, 236, 215, 0.78)',
  },
  sectionLabel: {
    marginTop: Space.s24,
    marginBottom: Space.s12,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.muted,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: Palette.text,
  },
  swatchClear: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  noteInput: {
    minHeight: 80,
    maxHeight: 160,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.25)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: Space.s12,
    paddingTop: Space.s12,
    paddingBottom: Space.s12,
    color: Palette.text,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s12,
    marginTop: Space.s24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  removeBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139, 26, 26, 0.5)',
  },
  saveBtn: {
    backgroundColor: Palette.gold,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  removeLabel: {
    color: Palette.crimson,
  },
  saveLabel: {
    color: Palette.background,
  },
});
