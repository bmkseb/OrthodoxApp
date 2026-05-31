import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { InteractionManager, type ScrollView, type View } from 'react-native';

/** Parse expo-router query params that may arrive as string or string[]. */
export function parseScrollTarget(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

type ScrollViewLike = {
  scrollTo: (options: { y: number; animated?: boolean }) => void;
};

/**
 * Scroll to a numbered anchor once content is mounted.
 * Uses measureLayout (more reliable than summing onLayout offsets).
 */
export function useScrollToTarget(
  scrollRef: RefObject<ScrollViewLike | null>,
  contentRef: RefObject<View | null>,
  target: number | undefined,
  contentReady: boolean,
  offset = 48
) {
  const targetRefs = useRef<Map<number, View>>(new Map());
  const didScrollRef = useRef(false);

  useEffect(() => {
    didScrollRef.current = false;
    targetRefs.current.clear();
  }, [target]);

  const scrollToTarget = useCallback(() => {
    if (target == null || !Number.isFinite(target) || !contentReady) return;
    const node = targetRefs.current.get(target);
    const content = contentRef.current;
    const scroll = scrollRef.current;
    if (!node || !content || !scroll) return;

    node.measureLayout(
      content,
      (_x, y) => {
        scroll.scrollTo({ y: Math.max(0, y - offset), animated: true });
        didScrollRef.current = true;
      },
      () => {
        // Layout not ready yet — retry timers below will try again.
      }
    );
  }, [target, contentReady, scrollRef, contentRef, offset]);

  const registerTargetRef = useCallback(
    (id: number, node: View | null) => {
      if (node) {
        targetRefs.current.set(id, node);
      } else {
        targetRefs.current.delete(id);
      }

      if (node && id === target && contentReady && !didScrollRef.current) {
        requestAnimationFrame(() => {
          scrollToTarget();
        });
      }
    },
    [target, contentReady, scrollToTarget]
  );

  useEffect(() => {
    if (!contentReady || target == null || !Number.isFinite(target)) return;

    const run = () => {
      if (!didScrollRef.current) scrollToTarget();
    };

    run();
    const interaction = InteractionManager.runAfterInteractions(run);
    const timers = [100, 250, 500, 900, 1500].map((ms) => setTimeout(run, ms));

    return () => {
      interaction.cancel();
      for (const timer of timers) clearTimeout(timer);
    };
  }, [contentReady, target, scrollToTarget]);

  return { registerTargetRef, scrollTarget: target };
}
