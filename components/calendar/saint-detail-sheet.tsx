import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { useTranslation } from '@/hooks/use-translation';
import type { HeaderKey } from '@/lib/translations';
import { getDayInfo } from '@/data/orthodoxCalendar';
import {
  getDayInfo as getLiturgicalDayInfo,
  type FeastType,
} from '@/lib/eotc-liturgical-calendar';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Opacity, Palette, Space } from '@/constants/theme';

const ETHIOPIAN_MONTHS = [
  '',
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagumen',
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;
const HERO_HEIGHT = SCREEN_HEIGHT * 0.6;
const ENTER_MS = 240;
const EXIT_MS = 180;
const DISMISS_DISTANCE = 72;
const DISMISS_VELOCITY = 650;
const FLING_VELOCITY = 900;
const SNAP_BACK_SPRING = { damping: 22, stiffness: 320 };
const DAY_SWIPE_DISTANCE = 48;
const DAY_SWIPE_VELOCITY = 500;

type SaintDetailSheetProps = {
  visible: boolean;
  year: number;
  month: number;
  day: number;
  bookmarked: boolean;
  onClose: () => void;
  onDismissStart?: () => void;
  onToggleBookmark: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
};

type ReadingSection = {
  key: string;
  headerKey: HeaderKey;
  icon: IconName;
  refs: string[];
  hint?: string;
};

type HolidayEntry = {
  name: string;
  nameAm: string;
  isMajor: boolean;
  type?: FeastType;
};

function formatFeastDetail(holidays: HolidayEntry[]): string | null {
  if (holidays.length === 0) return null;
  return holidays.map((holiday) => holiday.name).join(' · ');
}

function DayStatusCard({
  label,
  detail,
}: {
  label: string;
  detail?: string | null;
}) {
  return (
    <View style={styles.dayStatusCard}>
      <ThemedText style={styles.dayStatusLabel}>{label}</ThemedText>
      {detail ? <ThemedText style={styles.dayStatusDetail}>{detail}</ThemedText> : null}
    </View>
  );
}

function LiturgicalDayPanel({
  isFasting,
  fastingReason,
  isFeastDay,
  feastDetail,
  fastingLabel,
  feastDayLabel,
}: {
  isFasting: boolean;
  fastingReason: string | null;
  isFeastDay: boolean;
  feastDetail: string | null;
  fastingLabel: string;
  feastDayLabel: string;
}) {
  if (!isFasting && !isFeastDay) return null;

  return (
    <View style={styles.liturgicalPanel}>
      <View style={styles.dayStatusRow}>
        {isFasting ? (
          <DayStatusCard label={fastingLabel} detail={fastingReason} />
        ) : null}
        {isFeastDay ? <DayStatusCard label={feastDayLabel} detail={feastDetail} /> : null}
      </View>
    </View>
  );
}

function LectionaryPanel({ section }: { section: ReadingSection }) {
  const hasRefs = section.refs.length > 0;
  const isAnaphora = section.key === 'anaphora';

  return (
    <View style={styles.lectionaryBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionIconWrap}>
          <Icon name={section.icon} size={16} color={Palette.gold} />
        </View>
        <View style={styles.sectionLabelWrap}>
          <BilingualHeader headerKey={section.headerKey} variant="compact" />
          {section.hint ? (
            <ThemedText type="muted" style={styles.sectionHint}>
              {section.hint}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <View style={[styles.readingPanel, !hasRefs && styles.readingPanelEmpty]}>
        {!hasRefs ? (
          <ThemedText type="muted" style={styles.readingRefMuted}>
            —
          </ThemedText>
        ) : (
          section.refs.map((ref, index) => (
            <View
              key={`${section.key}-${index}-${ref}`}
              style={[styles.readingRow, index < section.refs.length - 1 && styles.readingRowBorder]}>
              {!isAnaphora ? <View style={styles.readingBullet} /> : null}
              <ThemedText
                style={[styles.readingRef, isAnaphora && styles.anaphoraRef]}
                selectable>
                {ref}
              </ThemedText>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

export function SaintDetailSheet({
  visible,
  year,
  month,
  day,
  bookmarked,
  onClose,
  onDismissStart,
  onToggleBookmark,
  onPrevDay,
  onNextDay,
}: SaintDetailSheetProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(visible);
  const closingRef = useRef(false);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrollY = useSharedValue(0);
  const daySwipeX = useSharedValue(0);
  const dayEnterX = useSharedValue(0);
  const info = useMemo(() => getDayInfo(year, month, day), [year, month, day]);
  const liturgical = useMemo(
    () => getLiturgicalDayInfo(new Date(year, month, day)),
    [year, month, day]
  );

  const holidays = useMemo(
    () =>
      [...liturgical.feasts]
        .sort((a, b) => Number(b.isMajor) - Number(a.isMajor))
        .map((feast) => ({
          name: feast.name,
          nameAm: feast.nameAm,
          isMajor: feast.isMajor,
          type: feast.type,
        })),
    [liturgical.feasts]
  );

  const isFeastDay = holidays.length > 0;
  const feastDetail = useMemo(() => formatFeastDetail(holidays), [holidays]);
  const isFasting = liturgical.isFasting;

  const sections: ReadingSection[] = useMemo(
    () => [
      {
        key: 'morning',
        headerKey: 'content.morning',
        icon: 'sun',
        refs: info.lectionary.morning,
      },
      {
        key: 'liturgical',
        headerKey: 'content.qidase',
        icon: 'church',
        refs: info.lectionary.liturgical,
      },
      {
        key: 'anaphora',
        headerKey: 'content.anaphora',
        icon: 'book',
        refs: info.lectionary.anaphora ?? [],
        hint: '4–14',
      },
      {
        key: 'evening',
        headerKey: 'content.evening',
        icon: 'moon',
        refs: info.lectionary.evening,
      },
    ],
    [info]
  );

  const finishUnmount = useCallback(() => {
    closingRef.current = false;
    setMounted(false);
    translateY.value = SCREEN_HEIGHT;
    scrollY.value = 0;
  }, [scrollY, translateY]);

  const animateClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onDismissStart?.();
    onClose();

    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: EXIT_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishUnmount)();
      }
    );
  }, [finishUnmount, onClose, onDismissStart, translateY]);

  useEffect(() => {
    if (!visible) return;
    closingRef.current = false;
    setMounted(true);
    scrollY.value = 0;
    translateY.value = withTiming(0, {
      duration: ENTER_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, scrollY, translateY]);

  useEffect(() => {
    if (!visible) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    dayEnterX.value = 14;
    dayEnterX.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [year, month, day, visible, dayEnterX]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SCREEN_HEIGHT], [0.55, 0], Extrapolation.CLAMP),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const dayContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: daySwipeX.value + dayEnterX.value }],
  }));

  const goToPrevDay = useCallback(() => {
    Haptics.selectionAsync();
    onPrevDay();
  }, [onPrevDay]);

  const goToNextDay = useCallback(() => {
    Haptics.selectionAsync();
    onNextDay();
  }, [onNextDay]);

  const scrollGesture = Gesture.Native();

  const dayPanGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-18, 18])
    .simultaneousWithExternalGesture(scrollGesture)
    .onUpdate((event) => {
      daySwipeX.value = event.translationX * 0.4;
    })
    .onEnd((event) => {
      const goNext =
        event.translationX < -DAY_SWIPE_DISTANCE || event.velocityX < -DAY_SWIPE_VELOCITY;
      const goPrev =
        event.translationX > DAY_SWIPE_DISTANCE || event.velocityX > DAY_SWIPE_VELOCITY;

      if (goNext) {
        runOnJS(goToNextDay)();
      } else if (goPrev) {
        runOnJS(goToPrevDay)();
      }

      daySwipeX.value = withSpring(0, SNAP_BACK_SPRING);
    })
    .onFinalize(() => {
      daySwipeX.value = withSpring(0, SNAP_BACK_SPRING);
    });

  const panGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(scrollGesture)
    .activeOffsetY(8)
    .failOffsetX([-28, 28])
    .onUpdate((e) => {
      const atTop = scrollY.value <= 1;
      const flingDown = e.velocityY > FLING_VELOCITY && e.translationY > 20;

      if (e.translationY > 0 && (atTop || flingDown || translateY.value > 0)) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > DISMISS_DISTANCE ||
        e.velocityY > DISMISS_VELOCITY ||
        (e.velocityY > FLING_VELOCITY && e.translationY > 28);

      if (shouldDismiss) {
        runOnJS(animateClose)();
        return;
      }

      if (translateY.value > 0) {
        translateY.value = withSpring(0, SNAP_BACK_SPRING);
      }
    });

  const sheetGesture = Gesture.Exclusive(dayPanGesture, panGesture);

  const ethiopianDateLabel = useMemo(() => {
    const ethMonth = liturgical.ethiopianDate.month ?? info.ethiopianMonth;
    const ethDay = liturgical.ethiopianDate.day ?? info.ethiopianDay;
    if (!ethMonth || !ethDay) return null;
    const monthName =
      liturgical.ethiopianDate.monthName ||
      ETHIOPIAN_MONTHS[ethMonth] ||
      `Month ${ethMonth}`;
    return `${monthName} ${ethDay}`;
  }, [info.ethiopianDay, info.ethiopianMonth, liturgical.ethiopianDate]);

  const handleShare = async () => {
    const lines = [
      `Saint of the Day: ${info.saint}`,
      `${month + 1}/${day}/${year}`,
      ethiopianDateLabel ? `Ethiopian: ${ethiopianDateLabel}` : null,
      isFasting
        ? `Fasting Day${liturgical.fastingReason ? ` (${liturgical.fastingReason})` : ''}`
        : null,
      isFeastDay
        ? `Feast Day${feastDetail ? ` (${feastDetail})` : ''}`
        : null,
      info.lectionaryHiatus
        ? 'Readings: Festal hiatus'
        : [
            info.lectionary.morning.length
              ? `Morning: ${info.lectionary.morning.join('; ')}`
              : null,
            info.lectionary.liturgical.length
              ? `Liturgy: ${info.lectionary.liturgical.join('; ')}`
              : null,
            info.lectionary.anaphora?.length
              ? `Anaphora: ${info.lectionary.anaphora.join('; ')}`
              : null,
            info.lectionary.evening.length
              ? `Evening: ${info.lectionary.evening.join('; ')}`
              : null,
          ]
            .filter(Boolean)
            .join('\n'),
      info.lectionarySourceUrl,
    ].filter(Boolean);

    await Share.share({ message: lines.join('\n') });
  };

  const openLectionarySource = useCallback(() => {
    if (!info.lectionarySourceUrl) return;
    void WebBrowser.openBrowserAsync(info.lectionarySourceUrl);
  }, [info.lectionarySourceUrl]);

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={animateClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={animateClose}
            accessibilityLabel="Close day"
          />
        </Animated.View>

        <GestureDetector gesture={sheetGesture}>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <View style={styles.handleRow}>
              <View style={styles.handle} />
              <OrthodoxPressable
                onPress={animateClose}
                style={styles.closeBtn}
                accessibilityLabel="Close day">
                <Icon name="chevron-down" size={22} color={Palette.gold} />
              </OrthodoxPressable>
            </View>

            <GestureDetector gesture={scrollGesture}>
              <Animated.ScrollView
                ref={scrollRef}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                bounces
                contentContainerStyle={styles.scrollContent}>
                <Animated.View style={dayContentStyle}>
                <View style={styles.hero}>
                  <Image
                    source={{ uri: `https://picsum.photos/800/1200?random=${day + month * 31}` }}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.92)']}
                    style={styles.heroGradient}
                  />
                  <View style={styles.heroActions}>
                    <OrthodoxPressable onPress={handleShare} style={styles.actionBtn}>
                      <Icon name="share" size={20} />
                    </OrthodoxPressable>
                    <OrthodoxPressable onPress={onToggleBookmark} style={styles.actionBtn}>
                      <Icon
                        name="bookmark"
                        size={20}
                        color={bookmarked ? Palette.gold : Palette.muted}
                      />
                    </OrthodoxPressable>
                  </View>
                  <View style={styles.heroText}>
                    <Text style={styles.saintLabel}>
                      {t('sections.saintOfTheDay').toUpperCase()}
                    </Text>
                    <Text style={styles.saintName}>{info.saint}</Text>
                    {ethiopianDateLabel ? (
                      <Text style={styles.ethiopianDate}>Ethiopian calendar · {ethiopianDateLabel}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.body}>
                  <LiturgicalDayPanel
                    isFasting={isFasting}
                    fastingReason={liturgical.fastingReason}
                    isFeastDay={isFeastDay}
                    feastDetail={feastDetail}
                    fastingLabel="Fasting Day"
                    feastDayLabel="Feast Day"
                  />
                  <BilingualHeader headerKey="lectionaries" variant="section" />
                  {info.lectionaryHiatus ? (
                    <Text style={styles.hiatusNote}>
                      Festal hiatus — no standard readings for this day per the annual lectionary.
                    </Text>
                  ) : null}
                  <View style={styles.lectionaryGrid}>
                    {sections.map((section) => (
                      <LectionaryPanel key={section.key} section={section} />
                    ))}
                  </View>
                  {info.lectionarySourceUrl ? (
                    <OrthodoxPressable
                      onPress={openLectionarySource}
                      style={styles.sourceLink}
                      accessibilityRole="link"
                      accessibilityLabel="Open annual lectionary source">
                      <Text style={styles.sourceLinkText}>
                        Annual readings from Ethiopian Orthodox Church
                      </Text>
                    </OrthodoxPressable>
                  ) : null}
                </View>
                </Animated.View>
              </Animated.ScrollView>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Palette.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    zIndex: 2,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.gold,
    opacity: 0.35,
  },
  closeBtn: {
    position: 'absolute',
    right: Layout.pagePadding,
    top: 4,
    padding: 6,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroActions: {
    position: 'absolute',
    top: 16,
    right: Layout.pagePadding,
    flexDirection: 'row',
    gap: 12,
    zIndex: 2,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  heroText: {
    position: 'absolute',
    left: Layout.pagePadding,
    right: Layout.pagePadding,
    bottom: 28,
  },
  saintLabel: {
    fontSize: 13,
    letterSpacing: 1,
    color: Palette.mutedGold,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  saintName: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 8,
  },
  ethiopianDate: {
    fontSize: 14,
    color: Palette.mutedGold,
    fontWeight: '500',
  },
  hiatusNote: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.mutedGold,
    marginBottom: Space.s8,
  },
  body: {
    padding: Layout.pagePadding,
    gap: Space.s24,
    paddingBottom: 40,
  },
  liturgicalPanel: {
    gap: Space.s16,
    padding: Space.s16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    borderLeftWidth: 3,
    borderLeftColor: Palette.gold,
    backgroundColor: Palette.card,
    overflow: 'hidden',
  },
  dayStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.s12,
  },
  dayStatusCard: {
    flex: 1,
    minWidth: 140,
    gap: Space.s4,
    padding: Space.s12,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Layout.cardBorderThin,
  },
  dayStatusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: 0.2,
  },
  dayStatusDetail: {
    fontSize: 12,
    color: Palette.gold,
    fontWeight: '500',
  },
  lectionaryGrid: {
    gap: Space.s24,
  },
  lectionaryBlock: {
    gap: Space.s12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  },
  sectionLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Space.s8,
  },
  sectionHint: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  readingPanel: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    borderLeftWidth: 3,
    borderLeftColor: Palette.gold,
    backgroundColor: Palette.card,
    overflow: 'hidden',
  },
  readingPanelEmpty: {
    paddingVertical: Space.s12,
    paddingHorizontal: Space.s16,
    minHeight: 44,
    justifyContent: 'center',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.s12,
    paddingVertical: Space.s12,
    paddingHorizontal: Space.s16,
  },
  readingRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Layout.cardBorder,
  },
  readingBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
    backgroundColor: Palette.gold,
    flexShrink: 0,
  },
  readingRef: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: Palette.text,
    letterSpacing: 0.1,
  },
  anaphoraRef: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.gold,
    lineHeight: 28,
    paddingVertical: Space.s4,
  },
  readingRefMuted: {
    fontSize: 15,
    fontStyle: 'italic',
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s12,
  },
  sourceLink: {
    alignSelf: 'center',
    paddingVertical: Space.s12,
  },
  sourceLinkText: {
    fontSize: 13,
    color: Palette.gold,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
