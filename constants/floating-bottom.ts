import type { EdgeInsets } from 'react-native-safe-area-context';

/** Apple Music–inspired floating bottom chrome (sacred palette). */
export const FloatingBottom = {
  horizontalMargin: 20,
  tabBarHeight: 72,
  tabBarRadius: 36,
  tabBarBottomGap: 8,
  miniPlayerHeight: 58,
  miniPlayerRadius: 22,
  miniPlayerGap: 10,
  contentExtraPadding: 16,
} as const;

export function getFloatingChromeHeight(hasMiniPlayer: boolean, safeBottom: number): number {
  const tabStack = FloatingBottom.tabBarHeight + FloatingBottom.tabBarBottomGap + safeBottom;
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
  return getFloatingChromeHeight(hasMiniPlayer, insets.bottom) + contentExtraPadding;
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
