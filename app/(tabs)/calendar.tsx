import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarMonthGrid } from '@/components/calendar/calendar-month-grid';
import { CalendarRecentSearchesPanel } from '@/components/calendar/calendar-recent-searches-panel';
import { SaintDetailSheet } from '@/components/calendar/saint-detail-sheet';
import { UpcomingFeasts } from '@/components/calendar/upcoming-feasts';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ContentSearchResults } from '@/components/search/content-search-results';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GoldCrossSpinner } from '@/components/ui/gold-cross-spinner';
import { SearchBar } from '@/components/ui/search-bar';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { useCalendarRecentSearches, type CalendarRecentSearchEntry } from '@/hooks/use-calendar-recent-searches';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTranslation } from '@/hooks/use-translation';
import {
  getUpcomingMajorFeasts,
  type UpcomingFeast,
} from '@/data/orthodoxCalendar';
import {
  hasCalendarSearchResults,
  searchCalendar,
  type CalendarSearchHit,
} from '@/lib/calendar-search';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';

function CalendarLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={styles.legendLine} />
        <Text style={styles.legendLabel}>Fasting day</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={styles.legendRing} />
        <Text style={styles.legendLabel}>Feast day</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={styles.legendFill} />
        <Text style={styles.legendLabel}>Today</Text>
      </View>
    </View>
  );
}

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
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = useFloatingBottomInset();
  const now = useMemo(() => new Date(), []);
  const today = useMemo(
    () => ({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }),
    [now]
  );

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [returningToCalendar, setReturningToCalendar] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBlurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    entries: recentSearchEntries,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useCalendarRecentSearches();

  const {
    values: scrollIndicator,
    scrollHandler,
    onLayout: onScrollShellLayout,
    onContentSizeChange: onScrollContentSizeChange,
  } = useScrollIndicator();

  const upcomingFeasts = useMemo(() => getUpcomingMajorFeasts(5, now), [now]);
  const trimmedSearchQuery = searchQuery.trim();
  const debouncedQuery = useDebouncedValue(trimmedSearchQuery, 300);
  const showRecentLayout = searchFocused && !trimmedSearchQuery;
  const keyboardHeight = useKeyboardHeight();
  const searchKeyboardActive =
    keyboardHeight > 0 && (showRecentLayout || Boolean(trimmedSearchQuery));

  const searchResults = useMemo(() => {
    if (!debouncedQuery) return { feasts: [], fasting: [] };
    return searchCalendar(debouncedQuery, now);
  }, [debouncedQuery, now]);

  const hasSearchHits = hasCalendarSearchResults(searchResults);
  const recentBottomInset = keyboardHeight > 0 ? keyboardHeight + Space.s16 : scrollBottomPadding;
  const searchResultsBottomInset =
    keyboardHeight > 0 ? keyboardHeight + Space.s16 : scrollBottomPadding;

  useEffect(() => {
    return () => {
      if (searchBlurTimerRef.current) clearTimeout(searchBlurTimerRef.current);
    };
  }, []);

  const handleSearchFocusChange = useCallback((focused: boolean) => {
    if (searchBlurTimerRef.current) clearTimeout(searchBlurTimerRef.current);
    if (focused) {
      setSearchFocused(true);
      return;
    }
    searchBlurTimerRef.current = setTimeout(() => setSearchFocused(false), 150);
  }, []);

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const sheetDay = selectedDay ?? today.day;

  const goToDate = useCallback(
    (date: Date, hit?: CalendarSearchHit) => {
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
      setSelectedDay(date.getDate());
      setSheetVisible(true);
      setSearchQuery('');
      setSearchFocused(false);

      if (hit) {
        void addRecentSearch({
          kind: hit.group === 'fasting' ? 'fasting' : 'feast',
          title: hit.title,
          subtitle: hit.subtitle,
          dateIso: hit.date.toISOString(),
        });
      }
    },
    [addRecentSearch]
  );

  const openSheetForDay = useCallback((day: number) => {
    setSelectedDay(day);
    setSheetVisible(true);
  }, []);

  const handleSearchSubmit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      void addRecentSearch({
        kind: 'query',
        title: trimmed,
        query: trimmed,
        subtitle: 'Search',
      });
    },
    [addRecentSearch]
  );

  const handleRecentEntryPress = useCallback(
    (entry: CalendarRecentSearchEntry) => {
      if (entry.kind === 'query') {
        const query = entry.query ?? entry.title;
        setSearchQuery(query);
        setSearchFocused(true);
        return;
      }

      if (entry.dateIso) {
        goToDate(new Date(entry.dateIso));
      }
    },
    [goToDate]
  );

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

  const goPrevYear = useCallback(() => {
    setViewYear((y) => y - 1);
  }, []);

  const goNextYear = useCallback(() => {
    setViewYear((y) => y + 1);
  }, []);

  const goToToday = useCallback(() => {
    setViewYear(today.year);
    setViewMonth(today.month);
    setSelectedDay(today.day);
  }, [today]);

  const navigateDay = useCallback(
    (delta: number) => {
      const currentDay = selectedDay ?? today.day;
      const next = new Date(viewYear, viewMonth, currentDay + delta);
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
      setSelectedDay(next.getDate());
    },
    [selectedDay, today.day, viewMonth, viewYear]
  );

  const isViewingToday = viewYear === today.year && viewMonth === today.month;

  return (
    <ThemedView style={styles.screen}>
      <SacredAtmosphere />
      <KeyboardAvoidingView
        style={[
          styles.keyboardAvoid,
          Platform.OS === 'android' &&
            searchKeyboardActive && { paddingBottom: keyboardHeight },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={searchKeyboardActive && Platform.OS === 'ios'}>
        <View
          style={[
            styles.screenBody,
            {
              paddingTop: insets.top + Space.s8,
              paddingBottom:
                showRecentLayout && keyboardHeight === 0 ? scrollBottomPadding : 0,
            },
          ]}>
          <PageHeader title="Calendar" geez="ቀን" />

          <View style={styles.searchWrap}>
            <SearchBar
              placeholder={t('calendar.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              hideRecentChips
              onFocusChange={handleSearchFocusChange}
            />
          </View>

          {showRecentLayout ? (
            <CalendarRecentSearchesPanel
              entries={recentSearchEntries}
              onPressEntry={handleRecentEntryPress}
              onRemoveEntry={(id) => void removeRecentSearch(id)}
              onClearAll={() => void clearRecentSearches()}
              bottomInset={recentBottomInset}
              showScrollIndicator={keyboardHeight > 0}
            />
          ) : (
            <View style={styles.scrollShell} onLayout={onScrollShellLayout}>
              <Animated.ScrollView
                style={styles.scroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onContentSizeChange={onScrollContentSizeChange}
                contentContainerStyle={{ paddingBottom: searchResultsBottomInset }}>
                {trimmedSearchQuery ? (
                  <>
                    {!hasSearchHits && debouncedQuery === trimmedSearchQuery ? (
                      <ThemedText type="muted" style={styles.searchEmpty}>
                        No feasts or fasting days matched that search.
                      </ThemedText>
                    ) : (
                      <>
                        <ContentSearchResults
                          heading="Feasts & Holidays"
                          hits={searchResults.feasts.map((hit) => ({
                            id: hit.id,
                            title: hit.title,
                            subtitle: hit.subtitle,
                            isHeader: true,
                            onPress: () => goToDate(hit.date, hit),
                          }))}
                        />
                        <ContentSearchResults
                          heading="Fasting Days"
                          hits={searchResults.fasting.map((hit) => ({
                            id: hit.id,
                            title: hit.title,
                            subtitle: hit.subtitle,
                            isHeader: true,
                            onPress: () => goToDate(hit.date, hit),
                          }))}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <CalendarMonthGrid
                      year={viewYear}
                      month={viewMonth}
                      today={today}
                      isViewingToday={isViewingToday}
                      todayLabel={t('calendar.today')}
                      onSelectDay={openSheetForDay}
                      onPrevMonth={goPrevMonth}
                      onNextMonth={goNextMonth}
                      onPrevYear={goPrevYear}
                      onNextYear={goNextYear}
                      onGoToToday={goToToday}
                      monthLabel={monthLabel}
                    />

                    <CalendarLegend />

                    <UpcomingFeasts feasts={upcomingFeasts} onPressFeast={handleFeastPress} />
                  </>
                )}
              </Animated.ScrollView>

              {(trimmedSearchQuery && keyboardHeight > 0) || !trimmedSearchQuery ? (
                <ScrollIndicator
                  values={scrollIndicator}
                  persistent={Boolean(trimmedSearchQuery && keyboardHeight > 0)}
                  trackRight={-Layout.pagePadding + 4}
                  trackInsetBottom={scrollBottomPadding}
                />
              ) : null}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

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
        onPrevDay={() => navigateDay(-1)}
        onNextDay={() => navigateDay(1)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  screenBody: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: Layout.pagePadding,
  },
  returnOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 13, 10, 0.72)',
    zIndex: 20,
  },
  searchWrap: { marginBottom: Layout.sectionHeaderBottom },
  searchEmpty: {
    fontSize: 14,
    lineHeight: 21,
    paddingTop: Space.s8,
  },
  scrollShell: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  scroll: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: Layout.headerContentGap,
    marginBottom: Layout.sectionHeaderBottom,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: Palette.gold,
  },
  legendRing: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Palette.gold,
  },
  legendFill: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.gold,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.muted,
    letterSpacing: 0.2,
  },
});
