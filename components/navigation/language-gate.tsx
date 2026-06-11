import { StyleSheet, View } from 'react-native';

import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useLanguage();
  const { palette } = useTheme();
  if (!isReady) {
    return <View style={[styles.placeholder, { backgroundColor: palette.background }]} />;
  }
  return children;
}

const styles = StyleSheet.create({
  placeholder: { flex: 1 },
});
