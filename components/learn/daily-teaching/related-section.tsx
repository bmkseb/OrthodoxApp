import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import type { DailyTeachingRelatedLink } from '@/data/daily-teachings';
import { learnText } from '@/lib/learn-i18n';
import { useTranslation } from '@/hooks/use-translation';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type RelatedItem = {
  key: string;
  icon: 'cross' | 'calendar' | 'flame' | 'book';
  link: DailyTeachingRelatedLink;
};

type DailyTeachingRelatedSectionProps = {
  label: string;
  saint?: DailyTeachingRelatedLink;
  feast?: DailyTeachingRelatedLink;
  fast?: DailyTeachingRelatedLink;
  bibleReading?: DailyTeachingRelatedLink & { bookId: string; chapter: number };
};

export function DailyTeachingRelatedSection({
  label,
  saint,
  feast,
  fast,
  bibleReading,
}: DailyTeachingRelatedSectionProps) {
  const { mode } = useTranslation();

  const items: RelatedItem[] = [
    saint ? { key: 'saint', icon: 'cross', link: saint } : null,
    feast ? { key: 'feast', icon: 'calendar', link: feast } : null,
    fast ? { key: 'fast', icon: 'flame', link: fast } : null,
    bibleReading
      ? { key: 'bible', icon: 'book', link: bibleReading }
      : null,
  ].filter((item): item is RelatedItem => item !== null);

  if (items.length === 0) return null;

  const open = (item: RelatedItem) => {
    if (item.key === 'bible' && bibleReading) {
      router.push(`/book/${bibleReading.bookId}/${bibleReading.chapter}` as never);
      return;
    }
    router.push(item.link.href as never);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <OrthodoxPressable key={item.key} style={styles.row} onPress={() => open(item)}>
            <View style={styles.iconBox}>
              <Icon name={item.icon} size={16} color={Palette.mutedGold} />
            </View>
            <Text style={styles.rowText}>
              {learnText(item.link.labelEn, item.link.labelAm, mode)}
            </Text>
            <Icon name="chevron-right" size={16} color={Palette.muted} />
          </OrthodoxPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.muted,
    marginBottom: Space.s12,
  },
  list: {
    gap: Space.s8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
    paddingVertical: Space.s12,
    paddingHorizontal: Space.s12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 20,
  },
});
