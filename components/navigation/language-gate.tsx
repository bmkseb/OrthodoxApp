import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/contexts/language-context';
import { Palette } from '@/constants/theme';

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useLanguage();
  if (!isReady) return <View style={styles.placeholder} />;
  return children;
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, backgroundColor: Palette.background },
});
