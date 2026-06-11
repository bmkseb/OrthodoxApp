import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingBottom, getFloatingBottomInset } from '@/constants/floating-bottom';
import { useOptionalAudioPlayer } from '@/contexts/audio-player-context';

/**
 * Bottom padding for scroll content above floating tab bar + mini player.
 *
 * When `includeFloatingChrome` is true, always reserves tab bar height + bottom
 * gap + safe-area inset + buffer — do not gate on route segments (that caused
 * tab screens to under-pad and content to sit under the pill).
 */
export function useFloatingBottomInset(
  includeFloatingChrome = true,
  contentExtraPadding = FloatingBottom.contentExtraPadding
): number {
  const insets = useSafeAreaInsets();
  const isMiniPlayerVisible = useOptionalAudioPlayer()?.isMiniPlayerVisible ?? false;

  if (!includeFloatingChrome) {
    return insets.bottom + contentExtraPadding;
  }

  return getFloatingBottomInset(isMiniPlayerVisible, insets, contentExtraPadding);
}
