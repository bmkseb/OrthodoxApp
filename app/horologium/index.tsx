// app/horologium/index.tsx
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Spacing } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { HOROLOGIUM_HOURS, getCurrentHour } from '@/data/horologium';
import { useTranslation } from '@/hooks/use-translation';

export default function HorologiumScreen() {
  const { mode } = useTranslation();
  const { palette } = useThemeTokens();
  const [currentHourId, setCurrentHourId] = useState<string>('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        intro: {
          lineHeight: 22,
          marginBottom: Spacing.lg,
        },
        grid: {
          gap: 10,
          paddingHorizontal: Layout.pagePadding,
          paddingBottom: Spacing.xl,
        },
        hourCell: {
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: palette.cardBorder,
          backgroundColor: palette.card,
        },
        hourCellActive: {
          borderColor: palette.gold,
        },
        nowBadge: {
          position: 'absolute',
          top: Spacing.sm,
          right: Spacing.sm,
          backgroundColor: palette.gold,
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 2,
        },
        nowText: {
          fontSize: 10,
          fontWeight: '700',
          color: palette.backgroundDeep,
          letterSpacing: 0.5,
        },
        geez: {
          fontSize: 20,
          color: palette.gold,
          marginBottom: 2,
          opacity: 0.6,
        },
        geezActive: {
          opacity: 1,
        },
        name: {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 2,
        },
        nameActive: {
          color: palette.gold,
        },
        time: {
          fontSize: 13,
          marginBottom: Spacing.xs,
        },
        timeActive: {
          opacity: 0.72,
        },
        intention: {
          fontSize: 12,
          lineHeight: 18,
        },
        intentionActive: {
          opacity: 0.7,
        },
      }),
    [palette]
  );

  useEffect(() => {
    setCurrentHourId(getCurrentHour().id);
    const interval = setInterval(() => {
      setCurrentHourId(getCurrentHour().id);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar />
      <ScriptureBookHeader
        title="Matshafa Se'atat"
        subtitle={mode === 'en' ? 'Book of Hours' : 'መጽሐፈ ሰዓታት · Book of Hours'}
      />

      <ThemedText type="muted" style={styles.intro}>
        The seven canonical prayer hours of the Ethiopian Orthodox Tewahedo Church,
        composed by Abba Giyorgis of Gascha. Offered in perpetual praise to God at
        the appointed hours of day and night.
      </ThemedText>

      <View style={styles.grid}>
        {HOROLOGIUM_HOURS.map((hour) => {
          const isCurrent = hour.id === currentHourId;
          return (
            <OrthodoxPressable
              key={hour.id}
              style={[styles.hourCell, isCurrent && styles.hourCellActive]}
              onPress={() => router.push(`/horologium/${hour.id}`)}>

              {isCurrent && (
                <View style={styles.nowBadge}>
                  <ThemedText style={styles.nowText}>NOW</ThemedText>
                </View>
              )}

              {mode !== 'en' ? (
                <ThemedText style={[styles.geez, isCurrent && styles.geezActive]}>
                  {hour.nameGeez}
                </ThemedText>
              ) : null}

              <ThemedText style={[styles.name, isCurrent && styles.nameActive]}>
                {hour.nameEnglish}
              </ThemedText>

              <ThemedText type="muted" style={[styles.time, isCurrent && styles.timeActive]}>
                {hour.timeLabel}
              </ThemedText>

              <ThemedText type="muted" style={[styles.intention, isCurrent && styles.intentionActive]} numberOfLines={2}>
                {hour.intention}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}
