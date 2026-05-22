import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/hooks/use-language';
import { Palette } from '@/constants/theme';

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useLanguage();
  if (!isReady) return <View style={styles.placeholder} />;
  return children;
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, backgroundColor: Palette.background },
});
