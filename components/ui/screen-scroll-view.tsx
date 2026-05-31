import React, { forwardRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';

type ScreenScrollViewProps = ScrollViewProps & {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** When false, omits floating tab bar / mini player inset (stack screens). */
  includeFloatingChrome?: boolean;
  /** Skip default SacredAtmosphere (e.g. Explore uses its own). */
  hideAtmosphere?: boolean;
};

export const ScreenScrollView = forwardRef<ScrollView, ScreenScrollViewProps>(function ScreenScrollView(
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

  return (
    <ThemedView style={[styles.screen, style]} pointerEvents="box-none">
      {hideAtmosphere ? null : <SacredAtmosphere />}
      <ParchmentGrainOverlay />
      <ScrollView
        ref={ref}
        style={styles.scroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Palette.gold} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: bottomPadding,
            paddingTop: insets.top + Spacing.md,
          },
          contentContainerStyle,
        ]}
        {...props}>
        {children}
      </ScrollView>
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
