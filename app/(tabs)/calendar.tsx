import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CalendarMonthGrid } from '@/components/calendar/calendar-month-grid';
import { SaintDetailSheet } from '@/components/calendar/saint-detail-sheet';
import { UpcomingFeasts } from '@/components/calendar/upcoming-feasts';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { GoldCrossSpinner } from '@/components/ui/gold-cross-spinner';
import { SearchBar } from '@/components/ui/search-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import {
  CALENDAR_FILTERS,
  type CalendarFilter,
  getUpcomingMajorFeasts,
  type UpcomingFeast,
} from '@/data/orthodoxCalendar';
import { Layout, Palette } from '@/constants/theme';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function CalendarScreen() {
  const { t } = useTranslation();
  const now = useMemo(() => new Date(), []);
  const today = useMemo(
    () => ({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }),
    [now]
  );

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [returningToCalendar, setReturningToCalendar] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('calendar');

  const upcomingFeasts = useMemo(() => getUpcomingMajorFeasts(5, now), [now]);

  const q = searchQuery.trim().toLowerCase();
  const filteredFeasts = useMemo(() => {
    if (!q) return upcomingFeasts;
    return upcomingFeasts.filter(
      (feast) =>
        feast.nameEn.toLowerCase().includes(q) ||
        feast.nameGeez.includes(searchQuery.trim()) ||
        feast.saint?.toLowerCase().includes(q),
    );
  }, [upcomingFeasts, q, searchQuery]);

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
  };
  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const sheetDay = selectedDay ?? today.day;

  const openSheetForDay = useCallback((day: number) => {
    setSelectedDay(day);
    setSheetVisible(true);
  }, []);

  const handleFeastPress = useCallback((feast: UpcomingFeast) => {
    setViewYear(feast.date.getFullYear());
    setViewMonth(feast.date.getMonth());
    setSelectedDay(feast.date.getDate());
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleDismissStart = useCallback(() => {
    setReturningToCalendar(true);
  }, []);

  useEffect(() => {
    if (!returningToCalendar) return;
    const timer = setTimeout(() => setReturningToCalendar(false), 320);
    return () => clearTimeout(timer);
  }, [returningToCalendar]);

  const goPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  return (
    <View style={styles.screen}>
      <ScreenScrollView>
        <View style={styles.content}>
          <PageHeader title="Calendar" geez="ቀን" />

          <View style={styles.searchWrap}>
            <SearchBar
              placeholder={t('calendar.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              recentSearches={recentSearches}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}>
            {CALENDAR_FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <OrthodoxPressable key={f.key} onPress={() => setFilter(f.key)}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {t(f.labelKey as TranslationKey)}
                  </Text>
                </OrthodoxPressable>
              );
            })}
          </ScrollView>

          <CalendarMonthGrid
            year={viewYear}
            month={viewMonth}
            selectedDay={selectedDay}
            today={today}
            filter={filter}
            onSelectDay={openSheetForDay}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            monthLabel={monthLabel}
          />

          <View style={styles.legend}>
            <LegendItem label={t('calendar.feastDay')} symbol="•" />
            <LegendItem label={t('calendar.majorFeast')} symbol="☩" />
            <LegendItem label={t('calendar.fasting')} symbol="◇" muted />
            <LegendItem label={t('calendar.today')} symbol="○" />
          </View>

          <UpcomingFeasts feasts={filteredFeasts} onPressFeast={handleFeastPress} />
        </View>
      </ScreenScrollView>

      {returningToCalendar ? (
        <View style={styles.returnOverlay} pointerEvents="none">
          <GoldCrossSpinner />
        </View>
      ) : null}

      <SaintDetailSheet
        visible={sheetVisible}
        year={viewYear}
        month={viewMonth}
        day={sheetDay}
        bookmarked={bookmarked}
        onDismissStart={handleDismissStart}
        onClose={handleCloseSheet}
        onToggleBookmark={() => setBookmarked((b) => !b)}
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
  returnOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 13, 10, 0.72)',
    zIndex: 20,
  },
  content: {},
  searchWrap: { marginBottom: Layout.sectionHeaderBottom },
  filterScroll: { marginBottom: Layout.sectionHeaderBottom },
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
    marginTop: Layout.headerContentGap,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSymbol: { color: Palette.gold, fontSize: 12 },
  legendMuted: { opacity: 0.5 },
  legendLabel: { color: Palette.muted, fontSize: 11 },
});
