import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Spacing } from '@/constants/theme';
import { FONT_SCALE_DEFAULT, FONT_SCALE_LEVELS, useFontScale } from '@/hooks/use-font-scale';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const PREVIEW_TEXT =
  'In the beginning God created the heaven and the earth. And the Spirit of God moved upon the face of the waters.';

/**
 * Reading-text size control. Renders an "Aa" trigger (for a reader's top bar)
 * that opens a bottom sheet with tappable size levels, +/- steppers, and a live
 * preview. The chosen size persists globally across all reader screens.
 */
export function TextSizeControl() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { palette } = useThemeTokens();
  const { scale, setScale, increase, decrease, canIncrease, canDecrease } = useFontScale();

  const percent = Math.round(scale * 100);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        triggerBtn: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 1,
          height: 30,
          paddingHorizontal: 2,
        },
        triggerSmall: {
          fontSize: 13,
          fontWeight: '700',
          color: palette.muted,
          lineHeight: 16,
        },
        triggerLarge: {
          fontSize: 19,
          fontWeight: '700',
          color: palette.muted,
          lineHeight: 20,
        },
        overlay: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        },
        sheet: {
          backgroundColor: palette.card,
          borderTopLeftRadius: BorderRadius.xl,
          borderTopRightRadius: BorderRadius.xl,
          paddingTop: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.cardBorder,
        },
        handle: {
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: palette.muted,
          opacity: 0.4,
          marginBottom: Spacing.md,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: Spacing.lg,
        },
        title: {
          fontSize: 17,
          fontWeight: '600',
        },
        closeBtn: {
          width: 30,
          height: 30,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 15,
        },
        controlRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        },
        stepBtn: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.cardBorder,
          backgroundColor: 'rgba(201, 147, 58, 0.08)',
        },
        stepBtnDisabled: {
          opacity: 0.4,
        },
        stepSmall: { fontSize: 14, fontWeight: '700' },
        stepLarge: { fontSize: 22, fontWeight: '700' },
        track: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        tick: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
        },
        dot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: palette.muted,
          opacity: 0.5,
        },
        dotActive: {
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: palette.gold,
          opacity: 1,
        },
        percent: {
          textAlign: 'center',
          fontSize: 13,
          fontWeight: '600',
          color: palette.gold,
          marginTop: Spacing.sm,
        },
        preview: {
          marginTop: Spacing.lg,
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.cardBorder,
          backgroundColor: palette.backgroundDeep,
        },
        previewLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          color: palette.muted,
          marginBottom: Spacing.sm,
        },
        previewText: {},
        resetBtn: {
          alignSelf: 'center',
          marginTop: Spacing.lg,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
        },
        resetLabel: {
          fontSize: 14,
          fontWeight: '500',
          color: palette.muted,
        },
      }),
    [palette]
  );

  return (
    <>
      <OrthodoxPressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Text size"
        hitSlop={10}
        style={styles.triggerBtn}>
        <ThemedText style={styles.triggerSmall}>A</ThemedText>
        <ThemedText style={styles.triggerLarge}>A</ThemedText>
      </OrthodoxPressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <ThemedText style={styles.title}>Text Size</ThemedText>
              <OrthodoxPressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={10}
                style={styles.closeBtn}>
                <Icon name="close" size={16} color={palette.muted} />
              </OrthodoxPressable>
            </View>

            <View style={styles.controlRow}>
              <OrthodoxPressable
                onPress={() => void decrease()}
                disabled={!canDecrease}
                accessibilityRole="button"
                accessibilityLabel="Decrease text size"
                style={[styles.stepBtn, !canDecrease && styles.stepBtnDisabled]}>
                <ThemedText style={styles.stepSmall}>A</ThemedText>
              </OrthodoxPressable>

              <View style={styles.track}>
                {FONT_SCALE_LEVELS.map((level) => {
                  const active = level === scale;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => void setScale(level)}
                      accessibilityRole="button"
                      accessibilityLabel={`${Math.round(level * 100)} percent`}
                      hitSlop={8}
                      style={styles.tick}>
                      <View style={[styles.dot, active && styles.dotActive]} />
                    </Pressable>
                  );
                })}
              </View>

              <OrthodoxPressable
                onPress={() => void increase()}
                disabled={!canIncrease}
                accessibilityRole="button"
                accessibilityLabel="Increase text size"
                style={[styles.stepBtn, !canIncrease && styles.stepBtnDisabled]}>
                <ThemedText style={styles.stepLarge}>A</ThemedText>
              </OrthodoxPressable>
            </View>

            <ThemedText style={styles.percent}>{percent}%</ThemedText>

            <View style={styles.preview}>
              <ThemedText style={styles.previewLabel}>PREVIEW</ThemedText>
              <ThemedText style={[styles.previewText, { fontSize: 17 * scale, lineHeight: 28 * scale }]}>
                {PREVIEW_TEXT}
              </ThemedText>
            </View>

            {scale !== FONT_SCALE_DEFAULT ? (
              <OrthodoxPressable
                onPress={() => void setScale(FONT_SCALE_DEFAULT)}
                accessibilityRole="button"
                style={styles.resetBtn}>
                <ThemedText style={styles.resetLabel}>Reset to default</ThemedText>
              </OrthodoxPressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
