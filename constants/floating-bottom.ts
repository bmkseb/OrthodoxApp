import type { EdgeInsets } from 'react-native-safe-area-context';

/** Apple Music–inspired floating bottom chrome (sacred palette). */
export const FloatingBottom = {
  horizontalMargin: 20,
  tabBarHeight: 72,
  tabBarRadius: 36,
  /** Gap between tab pill bottom and home-indicator safe area. */
  tabBarBottomGap: 8,
  miniPlayerHeight: 58,
  miniPlayerRadius: 22,
  miniPlayerGap: 10,
  /** Breathing room below last scroll item (above tab bar clearance). */
  contentExtraPadding: 16,
  /** @deprecated Use contentExtraPadding — kept for callers that referenced the buffer. */
  scrollClearanceBuffer: 0,
} as const;

/** Vertical space the floating tab bar occupies above the home indicator. */
export function getTabBarOccupiedHeight(safeBottom: number): number {
  return FloatingBottom.tabBarHeight + FloatingBottom.tabBarBottomGap + safeBottom;
}

export function getFloatingChromeHeight(hasMiniPlayer: boolean, safeBottom: number): number {
  const tabStack = getTabBarOccupiedHeight(safeBottom);
  const miniStack = hasMiniPlayer
    ? FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap
    : 0;
  return tabStack + miniStack;
}

/** ScrollView paddingBottom so content clears floating tab bar + optional mini player. */
export function getFloatingBottomInset(
  hasMiniPlayer: boolean,
  insets: EdgeInsets,
  contentExtraPadding = FloatingBottom.contentExtraPadding
): number {
  const miniStack = hasMiniPlayer
    ? FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap
    : 0;

  return (
    FloatingBottom.tabBarHeight +
    FloatingBottom.tabBarBottomGap +
    insets.bottom +
    contentExtraPadding +
    miniStack
  );
}

export function getMiniPlayerBottom(insets: EdgeInsets): number {
  return (
    insets.bottom +
    FloatingBottom.tabBarBottomGap +
    FloatingBottom.tabBarHeight +
    FloatingBottom.miniPlayerGap
  );
}

export function getTabBarBottom(insets: EdgeInsets): number {
  return insets.bottom + FloatingBottom.tabBarBottomGap;
}
