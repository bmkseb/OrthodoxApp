import { StyleSheet, View } from 'react-native';

import { Layout } from '@/constants/theme';

type CatalogListDividerProps = {
  /** Indent past leading avatar/icon (default matches 42px leading + gap). */
  marginLeft?: number;
};

/** Hairline separator between flat catalog list rows on See All screens. */
export function CatalogListDivider({ marginLeft = 54 }: CatalogListDividerProps) {
  return <View style={[styles.divider, { marginLeft }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
  },
});
