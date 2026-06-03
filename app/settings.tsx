import { StyleSheet, Text, View } from 'react-native';

import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { ThemedText } from '@/components/themed-text';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { useTranslation } from '@/hooks/use-translation';
import type { LanguageMode, TranslationKey } from '@/lib/translations';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

const MODES: LanguageMode[] = ['en', 'bilingual', 'am'];

const MODE_LABEL_KEYS: Record<LanguageMode, TranslationKey> = {
  en: 'settings.modeEn',
  bilingual: 'settings.modeBilingual',
  am: 'settings.modeAm',
};

const MODE_DESC_KEYS: Record<LanguageMode, TranslationKey> = {
  en: 'settings.modeEnDesc',
  bilingual: 'settings.modeBilingualDesc',
  am: 'settings.modeAmDesc',
};

export default function SettingsScreen() {
  const { t, mode, setMode, typography, ethiopicStyle } = useTranslation();

  return (
    <ScreenScrollView>
      <AppBackButton style={styles.backRow} />

      <ThemedText type="title" style={styles.pageTitle}>
        {t('settings.title')}
      </ThemedText>

      <ThemedText type="muted" style={[styles.description, typography.subtitle, mode === 'am' ? ethiopicStyle : undefined]}>
        {t('settings.languageDescription')}
      </ThemedText>

      <ThemedText style={[styles.sectionLabel, typography.subtitle]}>{t('settings.language')}</ThemedText>

      <View style={styles.options}>
        {MODES.map((m) => {
          const selected = mode === m;
          return (
            <OrthodoxPressable key={m} onPress={() => setMode(m)}>
              <RadialCardSurface tint="warm" style={[styles.optionCard, selected && styles.optionCardSelected]}>
                <View style={styles.optionRow}>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, typography.body, (m === 'am' || m === 'bilingual') && ethiopicStyle]}>
                      {t(MODE_LABEL_KEYS[m])}
                    </Text>
                    <ThemedText type="muted" style={[styles.optionDesc, typography.subtitle, m === 'am' ? ethiopicStyle : undefined]}>
                      {t(MODE_DESC_KEYS[m])}
                    </ThemedText>
                  </View>
                </View>
              </RadialCardSurface>
            </OrthodoxPressable>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  backRow: { marginBottom: Layout.headerContentGap },
  pageTitle: { marginBottom: Layout.headerContentGap },
  description: { marginBottom: Layout.sectionGap, lineHeight: 22 },
  sectionLabel: {
    color: Palette.mutedGold,
    marginBottom: Layout.headerContentGap,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  options: { gap: Layout.cardGap, paddingBottom: Layout.sectionGap },
  optionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ManuscriptTokens.goldBorder,
    padding: 16,
  },
  optionCardSelected: { borderColor: ManuscriptTokens.goldFaded },
  optionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, zIndex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 147, 58, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: { borderColor: Palette.gold },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.gold },
  optionText: { flex: 1, gap: 4 },
  optionTitle: { color: Palette.text, fontWeight: '600' },
  optionDesc: { lineHeight: 20 },
});
