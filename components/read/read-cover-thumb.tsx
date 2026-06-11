import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PremiumBookCoverLayers } from '@/components/read/premium-book-cover-layers';
import { getCanonScriptureCover } from '@/constants/read-cover-art';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const THUMB_WIDTH = 34;
const THUMB_HEIGHT = 48;
const SPINE = 3;

type ReadCoverThumbProps = {
  bookId: string;
};

/** Small EOTC Bible jacket for rows in the 81-book catalog. */
export const ReadCoverThumb = memo(function ReadCoverThumb({ bookId }: ReadCoverThumbProps) {
  const { palette } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: THUMB_WIDTH,
          height: THUMB_HEIGHT,
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
    [palette.gold]
  );

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <PremiumBookCoverLayers
        source={getCanonScriptureCover()}
        spineWidth={SPINE}
        recyclingKey={`catalog-thumb-${bookId}`}
      />
      <View style={styles.rule} pointerEvents="none" />
    </View>
  );
});
