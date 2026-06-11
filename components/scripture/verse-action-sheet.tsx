import { useEffect, useMemo, useState } from 'react';
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
import { BorderRadius, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

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

export function VerseActionSheet({
  visible,
  target,
  onClose,
  onHighlight,
  onSaveNote,
  onRemove,
}: VerseActionSheetProps) {
  const insets = useSafeAreaInsets();
  const { palette, sacred } = useThemeTokens();
  const [noteDraft, setNoteDraft] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, justifyContent: 'flex-end' },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        sheet: {
          backgroundColor: palette.sheet,
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
          color: palette.gold,
        },
        verseText: {
          marginTop: Space.s4,
          fontSize: 14,
          lineHeight: 20,
          color: sacred.creamMuted,
        },
        sectionLabel: {
          marginTop: Space.s24,
          marginBottom: Space.s12,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: palette.muted,
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
          borderColor: palette.border,
        },
        swatchActive: {
          borderWidth: 2,
          borderColor: palette.text,
        },
        swatchClear: {
          backgroundColor: 'transparent',
          borderColor: palette.border,
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
          color: palette.text,
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
          backgroundColor: palette.gold,
        },
        actionLabel: {
          fontSize: 15,
          fontWeight: '700',
        },
        removeLabel: {
          color: palette.crimson,
        },
        saveLabel: {
          color: palette.backgroundDeep,
        },
      }),
    [palette, sacred.creamMuted]
  );

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
                      {active ? <Icon name="cross" size={14} color={palette.text} /> : null}
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear highlight"
                  onPress={() => onHighlight(null)}
                  style={[styles.swatch, styles.swatchClear]}>
                  <Icon name="close" size={16} color={palette.muted} />
                </Pressable>
              </View>

              <ThemedText style={styles.sectionLabel}>Note</ThemedText>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Add a comment on this verse…"
                placeholderTextColor={palette.muted}
                multiline
                style={styles.noteInput}
              />

              <View style={styles.actions}>
                {hasSaved ? (
                  <OrthodoxPressable
                    style={[styles.actionBtn, styles.removeBtn]}
                    onPress={onRemove}
                    accessibilityLabel="Remove Highlight">
                    <Icon name="close" size={16} color={palette.crimson} />
                    <ThemedText style={[styles.actionLabel, styles.removeLabel]}>Remove Highlight</ThemedText>
                  </OrthodoxPressable>
                ) : (
                  <View style={styles.actionBtn} />
                )}

                <OrthodoxPressable
                  style={[styles.actionBtn, styles.saveBtn]}
                  onPress={() => onSaveNote(noteDraft)}
                  accessibilityLabel="Save note">
                  <Icon name="bookmark" size={16} color={palette.backgroundDeep} />
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
