import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LiturgicalSectionDivider } from '@/components/ui/liturgical-section-divider';
import { SectionHeader } from '@/components/ui/section-header';
import type { HeaderKey } from '@/lib/translations';

type SectionBlockProps = {
  children: React.ReactNode;
  headerKey?: HeaderKey;
  title?: string;
  onSeeAllPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Ceremonial rule + cross before this section (provides sectionGap rhythm). */
  showDivider?: boolean;
};

/**
 * Canonical section layout for tab screens.
 *
 * Rhythm (from Layout tokens):
 * - sectionGapBefore + sectionGapAfter = sectionGap between sections (via divider)
 * - sectionInner = header → content (via SectionHeader)
 */
export function SectionBlock({
  children,
  headerKey,
  title,
  onSeeAllPress,
  style,
  showDivider = true,
}: SectionBlockProps) {
  return (
    <View style={[styles.block, style]}>
      {showDivider ? <LiturgicalSectionDivider /> : null}
      {(headerKey || title) && (
        <SectionHeader headerKey={headerKey} title={title} onSeeAllPress={onSeeAllPress} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 0,
    marginBottom: 0,
  },
});
