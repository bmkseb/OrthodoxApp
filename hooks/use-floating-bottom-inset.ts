import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFloatingBottomInset } from '@/constants/floating-bottom';
import { usePlayback } from '@/contexts/playback-context';

/** Bottom padding for scroll content above floating tab bar + mini player. */
export function useFloatingBottomInset(includeMiniPlayer = true): number {
  const insets = useSafeAreaInsets();
  const { isMiniPlayerVisible } = usePlayback();
  return getFloatingBottomInset(includeMiniPlayer && isMiniPlayerVisible, insets);
}
