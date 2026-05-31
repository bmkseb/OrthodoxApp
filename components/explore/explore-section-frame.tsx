import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/Icon';
import { SectionHeader } from '@/components/ui/section-header';
import type { HeaderKey } from '@/lib/translations';
import { Layout } from '@/constants/theme';

type ExploreSectionFrameProps = {
  children: React.ReactNode;
  headerKey?: HeaderKey;
  title?: string;
  icon?: IconName;
  onSeeAllPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Tighter vertical rhythm for dense Explore layouts. */
  compact?: boolean;
};

export function ExploreSectionFrame({
  children,
  headerKey,
  title,
  icon,
  onSeeAllPress,
  style,
  compact = false,
}: ExploreSectionFrameProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {(headerKey || title) && (
        <SectionHeader
          headerKey={headerKey}
          title={title}
          icon={icon}
          onSeeAllPress={onSeeAllPress}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.sectionContentBottom,
  },
  containerCompact: {
    marginBottom: Layout.sectionContentBottom / 2,
  },
});
