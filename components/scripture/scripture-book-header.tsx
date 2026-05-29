import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Palette } from '@/constants/theme';

type ScriptureBookHeaderProps = {
  title: string;
  subtitle?: string;
};

/** Book title block with wrapping so long Amharic/Ge'ez names are not clipped. */
export function ScriptureBookHeader({ title, subtitle }: ScriptureBookHeaderProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText type="muted" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Layout.sectionGap,
    paddingTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Palette.text,
    lineHeight: 34,
    flexShrink: 1,
  },
  subtitle: {
    marginTop: Layout.titleSubtitleGap,
    lineHeight: 20,
  },
});
