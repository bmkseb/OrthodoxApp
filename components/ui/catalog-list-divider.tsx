import { StyleSheet, View } from 'react-native';

import { useThemeTokens } from '@/hooks/use-theme-tokens';

type CatalogListDividerProps = {
  /** Indent past leading avatar/icon (default matches 42px leading + gap). */
  marginLeft?: number;
};

/** Hairline separator between flat catalog list rows on See All screens. */
export function CatalogListDivider({ marginLeft = 54 }: CatalogListDividerProps) {
  const { palette } = useThemeTokens();

  return <View style={[styles.divider, { marginLeft, backgroundColor: palette.border }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
