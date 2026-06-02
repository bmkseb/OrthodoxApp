import { Image } from 'expo-image';
import { useCallback, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Palette, Space } from '@/constants/theme';

const SHEET_BG = '#1A1815';
const ENTER_MS = 220;
const EXIT_MS = 180;
const DISMISS_DISTANCE = 72;
const DISMISS_VELOCITY = 650;
const SNAP_BACK_SPRING = { damping: 22, stiffness: 320 };

type MezmurSongOptionsSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  onClose: () => void;
  onPlayNow: () => void;
  onAddToQueue: () => void;
  onRemove?: () => void;
  removeLabel?: string;
};

export function MezmurSongOptionsSheet({
  visible,
  title,
  subtitle,
  thumbnailUrl,
  onClose,
  onPlayNow,
  onAddToQueue,
  onRemove,
  removeLabel = 'Remove Saved Hymn',
}: MezmurSongOptionsSheetProps) {
  const insets = useSafeAreaInsets();
  const presented = useSharedValue(0);
  const dragY = useSharedValue(0);

  const dismiss = useCallback(() => {
    presented.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          dragY.value = 0;
          runOnJS(onClose)();
        }
      }
    );
  }, [onClose, dragY, presented]);

  useEffect(() => {
    if (visible) {
      dragY.value = 0;
      presented.value = withTiming(1, {
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, dragY, presented]);

  const runAndDismiss = (action: () => void) => {
    action();
    dismiss();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-28, 28])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        dragY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        runOnJS(dismiss)();
        return;
      }

      dragY.value = withSpring(0, SNAP_BACK_SPRING);
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: presented.value * 0.6,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - presented.value) * 320 + dragY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityLabel="Dismiss"
          />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { paddingBottom: 20 + Math.max(insets.bottom, 8) }, sheetStyle]}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.handleHitArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          <View style={styles.header}>
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <ThemedText style={styles.thumbGlyph}>♪</ThemedText>
                </View>
              )}

              <View style={styles.headerCopy}>
                <ThemedText style={styles.title} numberOfLines={2}>
                  {title}
                </ThemedText>
                {subtitle ? (
                  <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <OrthodoxPressable
              style={styles.primaryBtn}
              onPress={() => runAndDismiss(onPlayNow)}
              accessibilityRole="button"
              accessibilityLabel="Play now">
              <Icon name="play" size={18} color={Palette.background} />
              <ThemedText style={styles.primaryLabel}>Play Now</ThemedText>
            </OrthodoxPressable>

            <OrthodoxPressable
              style={styles.secondaryBtn}
              onPress={() => runAndDismiss(onAddToQueue)}
              accessibilityRole="button"
              accessibilityLabel="Add to queue">
              <Icon name="list" size={18} color={Palette.gold} />
              <ThemedText style={styles.secondaryLabel}>Add to Queue</ThemedText>
            </OrthodoxPressable>

            {onRemove ? (
              <OrthodoxPressable
                style={styles.removeBtn}
                onPress={() => runAndDismiss(onRemove)}
                accessibilityRole="button"
                accessibilityLabel={removeLabel}>
                <Icon name="bookmark-filled" size={18} color={Palette.crimson} />
                <ThemedText style={styles.removeLabel}>{removeLabel}</ThemedText>
              </OrthodoxPressable>
            ) : null}

            <OrthodoxPressable
              style={styles.cancelBtn}
              onPress={dismiss}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <ThemedText style={styles.cancelLabel}>Cancel</ThemedText>
            </OrthodoxPressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const THUMB = 52;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handleHitArea: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 14,
    marginBottom: 4,
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
    gap: Space.s12,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: {
    color: Palette.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: Space.s4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.15,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    marginTop: Space.s24,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.gold,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.background,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    marginTop: Space.s12,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.gold,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    marginTop: Space.s12,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139, 26, 26, 0.5)',
    backgroundColor: 'rgba(139, 26, 26, 0.08)',
  },
  removeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.crimson,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.s12,
    height: 48,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Palette.mutedGold,
  },
});
