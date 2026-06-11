import { Platform, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { SerifFamily, getManuscriptEdgeTokens } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const EYEBROW_SIZE = 11;
const EYEBROW_TRACKING = EYEBROW_SIZE * 0.16;

type ManuscriptEdgeEyebrowProps = {
  label: string;
  style?: StyleProp<TextStyle>;
};

/** Small-caps gold label above a Manuscript Edge card. */
export function ManuscriptEdgeEyebrow({ label, style }: ManuscriptEdgeEyebrowProps) {
  const { colorScheme } = useThemeTokens();
  const edge = getManuscriptEdgeTokens(colorScheme);

  return (
    <Text
      style={[
        styles.eyebrow,
        {
          color: edge.eyebrow,
        },
        style,
      ]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: SerifFamily,
    fontSize: EYEBROW_SIZE,
    fontWeight: '600',
    letterSpacing: EYEBROW_TRACKING,
    marginBottom: 8,
    ...Platform.select({
      ios: { fontVariant: ['small-caps' as const], textTransform: 'none' as const },
      default: { textTransform: 'uppercase' as const },
    }),
  },
});
