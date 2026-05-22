import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/Icon';
import { SoftSeparator } from '@/components/sacred/soft-separator';
import { SectionHeader } from '@/components/ui/section-header';
import type { HeaderKey } from '@/lib/translations';
import { Layout } from '@/constants/theme';

type ExploreSectionFrameProps = {
  children: React.ReactNode;
  headerKey?: HeaderKey;
  title?: string;
  icon?: IconName;
  onSeeAllPress?: () => void;
  showSeparator?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ExploreSectionFrame({
  children,
  headerKey,
  title,
  icon,
  onSeeAllPress,
  showSeparator = true,
  style,
}: ExploreSectionFrameProps) {
  return (
    <View style={[styles.container, style]}>
      {showSeparator ? <SoftSeparator /> : null}
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
    marginBottom: Layout.sectionGap,
  },
});
