import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { type IconName } from '@/components/Icon';
import { SectionBlock } from '@/components/ui/section-block';
import type { HeaderKey } from '@/lib/translations';

type ExploreSectionFrameProps = {
  children: React.ReactNode;
  headerKey?: HeaderKey;
  title?: string;
  /** @deprecated Icons removed from ceremonial section headers. */
  icon?: IconName;
  onSeeAllPress?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  /** @deprecated Use SectionBlock — hero styling lives on content cards. */
  hero?: boolean;
  showDivider?: boolean;
};

/** @deprecated Prefer `SectionBlock` directly. Thin alias for Explore. */
export function ExploreSectionFrame(props: ExploreSectionFrameProps) {
  const { icon: _icon, compact: _compact, hero: _hero, ...rest } = props;
  return <SectionBlock {...rest} />;
}
