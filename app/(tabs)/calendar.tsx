import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CalendarMonthGrid } from '@/components/calendar/calendar-month-grid';
import { SaintDetailSheet } from '@/components/calendar/saint-detail-sheet';
import { UpcomingFeasts } from '@/components/calendar/upcoming-feasts';
import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { SearchBar } from '@/components/ui/search-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import {
  CALENDAR_FILTERS,
  CalendarEvent,
  CalendarFilterId,
  getDayInfo,
} from '@/data/orthodoxCalendar';
import { Layout, Palette } from '@/constants/theme';

export default function CalendarScreen() {
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [filter, setFilter] = useState<CalendarFilterId>('all');
  const [sheetVisible, setSheetVisible] = useState(false);

  const dayInfo = useMemo(() => getDayInfo(selectedDate), [selectedDate]);

  const openSheet = useCallback((date: Date) => {
    setSelectedDate(date);
    setSheetVisible(true);
  }, []);

  const handleFeastPress = useCallback((event: CalendarEvent) => {
    setSelectedDate(event.date);
    setSheetVisible(true);
  }, []);

  return (
    <View style={styles.screen}>
      <ScreenScrollView includeTabBarSafe={false}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.pageTitleRow}>
              <Icon name="calendar" size={22} />
              <BilingualHeader headerKey="calendar" variant="page" />
            </View>
            <SettingsNavButton />
          </View>

          <View style={styles.searchWrap}>
            <SearchBar placeholder={t('calendar.searchPlaceholder')} recentSearches={['Feast', 'Lent']} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}>
            {CALENDAR_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <OrthodoxPressable key={f.id} onPress={() => setFilter(f.id)}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {t(f.labelKey)}
                  </Text>
                </OrthodoxPressable>
              );
            })}
          </ScrollView>

          <CalendarMonthGrid
            selectedDate={selectedDate}
            onSelectDate={openSheet}
            activeFilter={filter}
          />

          <View style={styles.legend}>
            <LegendItem label={t('calendar.feastDay')} symbol="•" />
            <LegendItem label={t('calendar.majorFeast')} symbol="☩" />
            <LegendItem label={t('calendar.fasting')} symbol="◇" muted />
            <LegendItem label={t('calendar.today')} symbol="○" />
          </View>

          <BilingualHeader headerKey="upcomingFeasts" variant="section" />
          <UpcomingFeasts onPressFeast={handleFeastPress} />
        </View>
      </ScreenScrollView>

      <SaintDetailSheet
        visible={sheetVisible}
        dayInfo={dayInfo}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

function LegendItem({
  label,
  symbol,
  muted,
}: {
  label: string;
  symbol: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <Text style={[styles.legendSymbol, muted && styles.legendMuted]}>{symbol}</Text>
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: Layout.sectionGap },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.headerContentGap,
  },
  pageTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, flex: 1 },
  searchWrap: { marginBottom: Layout.sectionGap },
  filterScroll: { marginBottom: Layout.sectionGap },
  filterRow: { gap: 10, paddingRight: Layout.pagePadding },
  filterText: {
    color: Palette.muted,
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.15)',
    overflow: 'hidden',
  },
  filterTextActive: {
    color: Palette.text,
    borderColor: 'rgba(201, 147, 58, 0.45)',
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: Layout.sectionGap,
    marginTop: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSymbol: { color: Palette.gold, fontSize: 12 },
  legendMuted: { opacity: 0.5 },
  legendLabel: { color: Palette.muted, fontSize: 11 },
});
