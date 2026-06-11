import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/theme-context';

export function ThemeGate({ children }: { children: React.ReactNode }) {
  const { ready, palette } = useTheme();
  if (!ready) {
    return <View style={[styles.placeholder, { backgroundColor: palette.background }]} />;
  }
  return children;
}

const styles = StyleSheet.create({
  placeholder: { flex: 1 },
});
