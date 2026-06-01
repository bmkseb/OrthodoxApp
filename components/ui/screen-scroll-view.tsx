import React, { forwardRef } from 'react';
import {
  RefreshControl,
  StyleSheet,
  type ScrollView as RNScrollView,
  type ScrollViewProps,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { FloatingBottom } from '@/constants/floating-bottom';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type ScreenScrollViewProps = ScrollViewProps & {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** When false, omits floating tab bar / mini player inset (stack screens). */
  includeFloatingChrome?: boolean;
  /** Skip default SacredAtmosphere (e.g. Explore uses its own). */
  hideAtmosphere?: boolean;
  /** Additional space below content beyond tab bar / mini player clearance. Default 16. */
  contentExtraPadding?: number;
  /** Reports furthest scroll fraction (0..1), quantized to 5% steps. */
  onScrollProgress?: (fraction: number) => void;
};

export const ScreenScrollView = forwardRef<RNScrollView, ScreenScrollViewProps>(function ScreenScrollView(
  {
    children,
    contentContainerStyle,
    refreshing,
    onRefresh,
    includeFloatingChrome = true,
    hideAtmosphere = false,
    contentExtraPadding = FloatingBottom.contentExtraPadding,
    onScrollProgress,
    style,
    ...props
  },
  ref
) {
  const insets = useSafeAreaInsets();
  const floatingInset = useFloatingBottomInset(includeFloatingChrome, contentExtraPadding);
  const bottomPadding = includeFloatingChrome
    ? floatingInset
    : insets.bottom + Spacing.xl;
  const topPadding = insets.top + Spacing.md;
  const { values, scrollHandler } = useScrollIndicator();

  // Derive a quantized read-progress fraction off the indicator's shared values
  // so callers can persist reading progress without owning the scroll handler.
  const lastReported = useSharedValue(-1);
  useDerivedValue(() => {
    if (!onScrollProgress) return;
    const max = Math.max(values.contentHeight.value - values.layoutHeight.value, 1);
    const fraction = Math.min(Math.max(values.scrollY.value / max, 0), 1);
    const stepped = Math.round(fraction * 20) / 20;
    if (stepped !== lastReported.value) {
      lastReported.value = stepped;
      runOnJS(onScrollProgress)(stepped);
    }
  });

  return (
      <ThemedView style={[styles.screen, style]} pointerEvents="box-none">
        {hideAtmosphere ? null : <SacredAtmosphere />}
      <AnimatedScrollView
        ref={ref as React.Ref<React.ComponentRef<typeof AnimatedScrollView>>}
        style={styles.scroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Palette.gold} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: bottomPadding,
            paddingTop: topPadding,
          },
          contentContainerStyle,
        ]}
        {...props}>
        {children}
      </AnimatedScrollView>

      <ScrollIndicator
        values={values}
        trackInsetTop={topPadding}
        trackInsetBottom={bottomPadding}
      />
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.pagePadding,
  },
});
