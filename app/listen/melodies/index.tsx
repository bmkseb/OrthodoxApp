import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CatalogBookRow } from '@/components/read/catalog-book-row';
import { CatalogListDivider } from '@/components/ui/catalog-list-divider';
import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import { YARED_MELODY_SHELVES, shelfForYaredMelody } from '@/data/yaredMelodiesCatalog';
import { useTranslation } from '@/hooks/use-translation';

export default function YaredMelodiesCatalogScreen() {
  const { t, mode } = useTranslation();
  const { shelf: shelfParam } = useLocalSearchParams<{ shelf?: string }>();
  const shelf = shelfForYaredMelody(typeof shelfParam === 'string' ? shelfParam : undefined);

  return (
    <ScreenScrollView includeFloatingChrome>
      <AppBackButton
        style={styles.topBar}
        onFallback={() => router.push('/(tabs)/listen')}
      />

      <ThemedText style={styles.eyebrow}>{t('listen.melodiesCatalog')}</ThemedText>
      <ThemedText style={styles.pageTitle}>{t(shelf.titleKey)}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>{shelf.geez}</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {t('listen.yaredMelodySubtitle')}
      </ThemedText>

      <View style={styles.switcher}>
        {YARED_MELODY_SHELVES.map((option) => {
          const active = option.id === shelf.id;
          return (
            <OrthodoxPressable
              key={option.id}
              style={[styles.switchTab, active && styles.switchTabActive]}
              onPress={() => router.setParams({ shelf: option.id })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <ThemedText style={[styles.switchLabel, active && styles.switchLabelActive]}>
                {t(option.titleKey)}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {shelf.playlists.map((playlist, index) => (
          <View key={playlist.id}>
            <CatalogBookRow
              title={t(playlist.titleKey)}
              subtitle={t('listen.yaredMelodySubtitle')}
              geez={playlist.geez}
              showGeez={mode !== 'en'}
              icon="music"
              onPress={() => router.push(`/listen/melodies/${playlist.id}` as never)}
            />
            {index < shelf.playlists.length - 1 ? <CatalogListDivider /> : null}
          </View>
        ))}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 17,
    color: Palette.gold,
    marginBottom: 4,
  },
  description: {
    marginBottom: Spacing.md,
    lineHeight: 21,
  },
  switcher: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  switchTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.3)',
  },
  switchTabActive: {
    backgroundColor: 'rgba(201, 147, 58, 0.16)',
    borderColor: Palette.gold,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.muted,
  },
  switchLabelActive: {
    color: Palette.text,
  },
  list: {
    marginTop: 2,
  },
});
