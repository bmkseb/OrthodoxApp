import React, { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import { ManuscriptEdgeFrame } from '@/components/sacred/manuscript-edge-frame';

type ScripturePanelFrameProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  panelStyle?: StyleProp<ViewStyle>;
  /** @deprecated Manuscript Edge uses fixed parchment/umber fills. */
  backgroundColor?: string;
};

/** @deprecated Use ManuscriptEdgeFrame — kept for existing imports. */
export function ScripturePanelFrame({
  children,
  style,
  panelStyle,
}: ScripturePanelFrameProps) {
  return (
    <ManuscriptEdgeFrame style={style} contentStyle={panelStyle}>
      {children}
    </ManuscriptEdgeFrame>
  );
}

/** @deprecated Manuscript Edge uses spine + hairline tokens from theme. */
export function getScripturePanelBorders() {
  return { outer: 'transparent', inner: 'transparent' };
}
