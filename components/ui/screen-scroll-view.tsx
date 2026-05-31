import React, { forwardRef } from 'react';
import {
  RefreshControl,
  StyleSheet,
  type ScrollView as RNScrollView,
  type ScrollViewProps,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { Layout, Palette, Spacing } from '@/constants/theme';
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
};

export const ScreenScrollView = forwardRef<RNScrollView, ScreenScrollViewProps>(function ScreenScrollView(
  {
    children,
    contentContainerStyle,
    refreshing,
    onRefresh,
    includeFloatingChrome = true,
    hideAtmosphere = false,
    style,
    ...props
  },
  ref
) {
  const insets = useSafeAreaInsets();
  const floatingInset = useFloatingBottomInset();
  const bottomPadding = includeFloatingChrome
    ? floatingInset
    : insets.bottom + Spacing.xl;
  const topPadding = insets.top + Spacing.md;
  const { values, scrollHandler } = useScrollIndicator();

  return (
    <ThemedView style={[styles.screen, style]} pointerEvents="box-none">
      {hideAtmosphere ? null : <SacredAtmosphere />}
      <ParchmentGrainOverlay />
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
