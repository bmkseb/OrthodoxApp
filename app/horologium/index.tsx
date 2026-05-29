// app/horologium/index.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';
import { HOROLOGIUM_HOURS, getCurrentHour } from '@/data/horologium';

export default function HorologiumScreen() {
  const [currentHourId, setCurrentHourId] = useState<string>('');

  useEffect(() => {
    setCurrentHourId(getCurrentHour().id);
    // Refresh every minute so current hour stays accurate
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
        subtitle="መጽሐፈ ሰዓታት · Book of Hours"
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

              <ThemedText style={[styles.geez, isCurrent && styles.geezActive]}>
                {hour.nameGeez}
              </ThemedText>

              <ThemedText style={[styles.name, isCurrent && styles.nameActive]}>
                {hour.nameEnglish}
              </ThemedText>

              <ThemedText style={[styles.time, isCurrent && styles.timeActive]}>
                {hour.timeLabel}
              </ThemedText>

              <ThemedText type="muted" style={styles.intention} numberOfLines={2}>
                {hour.intention}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  intro: {
    lineHeight: 22,
    marginBottom: Spacing.lg,
    marginHorizontal: Layout.pagePadding,
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
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  hourCellActive: {
    borderColor: Palette.gold,
    backgroundColor: Palette.card,
  },
  nowBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Palette.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  geez: {
    fontSize: 20,
    color: Palette.gold,
    marginBottom: 2,
    opacity: 0.6,
  },
  geezActive: {
    opacity: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 2,
  },
  nameActive: {
    color: Palette.gold,
  },
  time: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: Spacing.xs,
  },
  timeActive: {
    color: Palette.gold,
    opacity: 0.8,
  },
  intention: {
    fontSize: 12,
    lineHeight: 18,
  },
});
