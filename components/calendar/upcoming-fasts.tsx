import { memo } from 'react';

import { StyleSheet, View } from 'react-native';



import {

  CalendarRailCard,

  CALENDAR_RAIL_SCROLL_CONTENT,

} from '@/components/calendar/calendar-rail-card';

import { getFastRailAccent } from '@/lib/calendar-visual';

import { BookshelfSection } from '@/components/read/bookshelf-section';

import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';

import {

  HorizontalScrollIndicator,

  useHorizontalScrollIndicator,

} from '@/components/ui/scroll-indicator';

import { useTranslation } from '@/hooks/use-translation';

import { calendarRailLabels, formatGregorianDateShort } from '@/lib/calendar-i18n';
import type { UpcomingFastPeriod } from '@/lib/eotc-liturgical-calendar';

import { Space } from '@/constants/theme';



type UpcomingFastsProps = {

  fasts: UpcomingFastPeriod[];

  title: string;

  onPressFast?: (fast: UpcomingFastPeriod) => void;

  compactBottom?: boolean;

};



export const UpcomingFasts = memo(function UpcomingFasts({

  fasts,

  title,

  onPressFast,

  compactBottom = false,

}: UpcomingFastsProps) {

  const { t, mode } = useTranslation();

  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();



  if (fasts.length === 0) return null;



  return (

    <View style={[styles.wrap, compactBottom && styles.wrapCompact]}>

      <ShelfSubsectionHeader title={title} />



      <BookshelfSection

        horizontal

        scrollProps={{

          onScroll: scrollHandler,

          onLayout,

          onContentSizeChange,

          contentContainerStyle: CALENDAR_RAIL_SCROLL_CONTENT,

        }}>

        {fasts.map((fast) => {

          const startStr = formatGregorianDateShort(fast.startDate, mode);
          const endStr = formatGregorianDateShort(fast.endDate, mode);
          const accent = getFastRailAccent(fast.key);
          const labels = calendarRailLabels(fast.name, fast.nameAm, mode);

          return (

            <CalendarRailCard

              key={`${fast.key}-${fast.startDate.toISOString()}`}

              title={labels.title}

              subtitle={labels.subtitle}

              meta={`${startStr} – ${endStr}`}

              statusLabel={

                fast.isActive

                  ? t('calendar.fastInProgress')

                  : t('calendar.daysRemaining', { count: fast.daysRemaining })

              }

              statusActive={fast.isActive}

              accentColor={accent.accentColor}

              icon={accent.icon}

              panelTint={accent.panelTint}
              onPress={onPressFast ? () => onPressFast(fast) : undefined}

            />

          );

        })}

      </BookshelfSection>



      {fasts.length > 2 ? (

        <View style={styles.hint}>

          <HorizontalScrollIndicator values={values} />

        </View>

      ) : null}

    </View>

  );

});



const styles = StyleSheet.create({

  wrap: {

    marginBottom: Space.s12,

  },

  wrapCompact: {

    marginBottom: 0,

  },

  hint: {

    marginTop: Space.s8,

  },

});


