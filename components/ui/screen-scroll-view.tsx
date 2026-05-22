import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { ThemedView } from '@/components/themed-view';
import { Layout, Spacing } from '@/constants/theme';

type ScreenScrollViewProps = ScrollViewProps & {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  includeTabBarSafe?: boolean;
};

export function ScreenScrollView({
  children,
  contentContainerStyle,
  refreshing,
  onRefresh,
  includeTabBarSafe = true,
  ...props
}: ScreenScrollViewProps) {
  const insets = useSafeAreaInsets();
  const tabBarPadding = includeTabBarSafe ? Layout.tabBarSafe : 0;

  return (
    <ThemedView style={styles.screen}>
      <ParchmentGrainOverlay />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#C9933A" />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + Spacing.lg + tabBarPadding,
            paddingTop: insets.top + Spacing.sm,
          },
          contentContainerStyle,
        ]}
        {...props}>
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.pagePadding,
  },
});
