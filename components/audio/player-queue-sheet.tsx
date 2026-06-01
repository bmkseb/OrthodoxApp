import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';
import { useAudioPlayer, type AudioTrack } from '@/contexts/audio-player-context';

const SHEET_BG = '#1A1815';
const ENTER_MS = 220;
const EXIT_MS = 180;
const DISMISS_DISTANCE = 72;
const DISMISS_VELOCITY = 650;
const SNAP_BACK_SPRING = { damping: 22, stiffness: 320 };
const SHIFT_SPRING = { damping: 24, stiffness: 320 };
const ROW_HEIGHT = 73;

type PlayerQueueSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type QueueRowProps = {
  track: AudioTrack;
  index: number;
  isActive: boolean;
  isLast: boolean;
  queueLength: number;
  dragIndex: SharedValue<number>;
  dragOffset: SharedValue<number>;
  onDragActiveChange: (active: boolean) => void;
  onPress: () => void;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function computeHoverIndex(from: number, offsetY: number, length: number) {
  const offset = Math.round(offsetY / ROW_HEIGHT);
  return Math.min(Math.max(from + offset, 0), length - 1);
}

function hoverIndex(from: number, offsetY: number, length: number) {
  'worklet';
  const offset = Math.round(offsetY / ROW_HEIGHT);
  return Math.min(Math.max(from + offset, 0), length - 1);
}

function QueueRow({
  track,
  index,
  isActive,
  isLast,
  queueLength,
  dragIndex,
  dragOffset,
  onDragActiveChange,
  onPress,
  onRemove,
  onReorder,
}: QueueRowProps) {
  const finishDrag = useCallback(
    (from: number, translationY: number) => {
      const to = computeHoverIndex(from, translationY, queueLength);
      if (to !== from) {
        onReorder(from, to);
      }
    },
    [onReorder, queueLength]
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(120)
    .onStart(() => {
      dragIndex.value = index;
      dragOffset.value = 0;
      runOnJS(onDragActiveChange)(true);
    })
    .onUpdate((event) => {
      dragOffset.value = event.translationY;
    })
    .onEnd((event) => {
      const from = dragIndex.value;
      if (from < 0) return;
      runOnJS(finishDrag)(from, event.translationY);
      dragIndex.value = -1;
      dragOffset.value = 0;
      runOnJS(onDragActiveChange)(false);
    })
    .onFinalize(() => {
      if (dragIndex.value === index) {
        dragIndex.value = -1;
        dragOffset.value = 0;
        runOnJS(onDragActiveChange)(false);
      }
    });

  const rowStyle = useAnimatedStyle(() => {
    const from = dragIndex.value;
    if (from === -1) {
      return { transform: [{ translateY: 0 }], zIndex: 0 };
    }

    const hover = hoverIndex(from, dragOffset.value, queueLength);

    if (index === from) {
      return {
        transform: [{ translateY: dragOffset.value }],
        zIndex: 20,
        elevation: 20,
      };
    }

    let shift = 0;
    if (from < hover) {
      if (index > from && index <= hover) shift = -ROW_HEIGHT;
    } else if (from > hover) {
      if (index >= hover && index < from) shift = ROW_HEIGHT;
    }

    return {
      transform: [{ translateY: withSpring(shift, SHIFT_SPRING) }],
      zIndex: 0,
    };
  });

  return (
    <Animated.View style={[styles.rowShell, rowStyle]}>
      <OrthodoxPressable
        style={[styles.row, isActive && styles.rowActive]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Play ${track.title}`}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandle} accessibilityLabel="Reorder">
            <Icon name="list" size={16} color={Palette.mutedGold} />
          </View>
        </GestureDetector>

        {track.artworkUri ? (
          <Image source={{ uri: track.artworkUri }} style={styles.thumb} contentFit="contain" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <ThemedText style={styles.thumbGlyph}>♪</ThemedText>
          </View>
        )}

        <View style={styles.copy}>
          <ThemedText style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>
            {track.title}
          </ThemedText>
          <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
            {track.artist}
          </ThemedText>
        </View>

        {isActive ? (
          <View style={styles.nowPlayingBadge}>
            <Icon name="play" size={12} color={Palette.background} />
          </View>
        ) : null}

        <OrthodoxPressable
          style={styles.removeBtn}
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${track.title} from queue`}>
          <Icon name="close" size={14} color={Palette.mutedGold} />
        </OrthodoxPressable>
      </OrthodoxPressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </Animated.View>
  );
}

export function PlayerQueueSheet({ visible, onClose }: PlayerQueueSheetProps) {
  const insets = useSafeAreaInsets();
  const presented = useSharedValue(0);
  const sheetDragY = useSharedValue(0);
  const dragIndex = useSharedValue(-1);
  const dragOffset = useSharedValue(0);
  const [listScrollEnabled, setListScrollEnabled] = useState(true);
  const { queue, queueIndex, playQueueItem, removeFromQueue, reorderQueue } = useAudioPlayer();

  const handleDragActiveChange = useCallback((active: boolean) => {
    setListScrollEnabled(!active);
  }, []);

  const dismiss = useCallback(() => {
    presented.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          sheetDragY.value = 0;
          runOnJS(onClose)();
        }
      }
    );
  }, [onClose, presented, sheetDragY]);

  useEffect(() => {
    if (visible) {
      sheetDragY.value = 0;
      dragIndex.value = -1;
      dragOffset.value = 0;
      presented.value = withTiming(1, {
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, dragIndex, dragOffset, presented, sheetDragY]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-28, 28])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        sheetDragY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        runOnJS(dismiss)();
        return;
      }

      sheetDragY.value = withSpring(0, SNAP_BACK_SPRING);
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: presented.value * 0.6,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - presented.value) * 420 + sheetDragY.value }],
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
            accessibilityLabel="Dismiss queue"
          />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 12), maxHeight: '78%' },
              sheetStyle,
            ]}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>Queue</ThemedText>
              <ThemedText type="muted" style={styles.headerCount}>
                {queue.length} {queue.length === 1 ? 'song' : 'songs'}
              </ThemedText>
            </View>

            <ThemedText type="muted" style={styles.hint}>
              Long-press the handle to drag and reorder.
            </ThemedText>

            {queue.length === 0 ? (
              <View style={styles.empty}>
                <ThemedText style={styles.emptyTitle}>Queue is empty</ThemedText>
                <ThemedText type="muted" style={styles.emptyCopy}>
                  Open a song menu and tap Add to Queue.
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={listScrollEnabled}>
                {queue.map((track, index) => (
                  <QueueRow
                    key={track.id}
                    track={track}
                    index={index}
                    isActive={index === queueIndex}
                    isLast={index === queue.length - 1}
                    queueLength={queue.length}
                    dragIndex={dragIndex}
                    dragOffset={dragOffset}
                    onDragActiveChange={handleDragActiveChange}
                    onPress={() => {
                      playQueueItem(index);
                      dismiss();
                    }}
                    onRemove={() => removeFromQueue(track.id)}
                    onReorder={reorderQueue}
                  />
                ))}
              </ScrollView>
            )}

            <OrthodoxPressable
              style={styles.doneBtn}
              onPress={dismiss}
              accessibilityRole="button"
              accessibilityLabel="Done">
              <ThemedText style={styles.doneLabel}>Done</ThemedText>
            </OrthodoxPressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const THUMB = 44;

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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(201, 147, 58, 0.3)',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  headerCount: {
    fontSize: 13,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Space.s12,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: Space.s8,
  },
  rowShell: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Space.s8,
  },
  rowActive: {
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    borderRadius: BorderRadius.md,
    marginHorizontal: -6,
    paddingHorizontal: 6,
  },
  dragHandle: {
    width: 28,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 20,
  },
  titleActive: {
    color: Palette.gold,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  nowPlayingBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 36,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Space.s32,
    gap: Space.s8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: Space.s16,
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: Space.s8,
  },
  doneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.gold,
  },
});
