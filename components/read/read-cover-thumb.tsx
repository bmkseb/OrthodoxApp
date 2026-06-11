import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PremiumBookCoverLayers } from '@/components/read/premium-book-cover-layers';
import {
  getCanonScriptureCover,
  type ReadCoverFocus,
  type ReadCoverSource,
  type ReadCoverTone,
} from '@/constants/read-cover-art';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const DEFAULT_WIDTH = 34;
const DEFAULT_HEIGHT = 48;
const SPINE = 3;

type ReadCoverThumbProps = {
  bookId: string;
  source?: ReadCoverSource;
  tone?: ReadCoverTone;
  focus?: ReadCoverFocus;
  width?: number;
  height?: number;
};

/** Small book jacket for catalog list rows. */
export const ReadCoverThumb = memo(function ReadCoverThumb({
  bookId,
  source,
  tone,
  focus,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: ReadCoverThumbProps) {
  const { palette } = useThemeTokens();
  const coverSource = source ?? getCanonScriptureCover();
  const spine = Math.max(2, Math.round(width * 0.09));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width,
          height,
          borderRadius: 3,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${palette.gold}33`,
        },
        rule: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1.5,
          backgroundColor: palette.gold,
          zIndex: 2,
        },
      }),
    [height, palette.gold, width]
  );

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <PremiumBookCoverLayers
        source={coverSource}
        tone={tone}
        focus={focus}
        spineWidth={spine}
        recyclingKey={`catalog-thumb-${bookId}`}
      />
      <View style={styles.rule} pointerEvents="none" />
    </View>
  );
});
