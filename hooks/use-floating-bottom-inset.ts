import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingBottom, getFloatingBottomInset } from '@/constants/floating-bottom';
import { useOptionalAudioPlayer } from '@/contexts/audio-player-context';

/** Bottom padding for scroll content above floating tab bar + mini player. */
export function useFloatingBottomInset(
  includeFloatingChrome = true,
  contentExtraPadding = FloatingBottom.contentExtraPadding
): number {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const onTabs = segments[0] === '(tabs)';
  const isMiniPlayerVisible = useOptionalAudioPlayer()?.isMiniPlayerVisible ?? false;

  const miniStack =
    includeFloatingChrome && isMiniPlayerVisible
      ? FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap
      : 0;

  if (!onTabs) {
    return miniStack + insets.bottom + contentExtraPadding;
  }

  return getFloatingBottomInset(
    includeFloatingChrome && isMiniPlayerVisible,
    insets,
    contentExtraPadding
  );
}
