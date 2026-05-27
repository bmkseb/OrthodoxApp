import type { EdgeInsets } from 'react-native-safe-area-context';

/** Apple Music–inspired floating bottom chrome (sacred palette). */
export const FloatingBottom = {
  horizontalMargin: 20,
  tabBarHeight: 72,
  tabBarRadius: 36,
  tabBarBottomGap: 8,
  miniPlayerHeight: 64,
  miniPlayerRadius: 24,
  miniPlayerGap: 8,
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
export function getFloatingBottomInset(hasMiniPlayer: boolean, insets: EdgeInsets): number {
  return (
    getFloatingChromeHeight(hasMiniPlayer, insets.bottom) + FloatingBottom.contentExtraPadding
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
