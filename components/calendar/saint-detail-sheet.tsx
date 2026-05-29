import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
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
import { Layout, Opacity, Palette } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;
const HERO_HEIGHT = SCREEN_HEIGHT * 0.6;
const ENTER_MS = 240;
const EXIT_MS = 180;
const DISMISS_DISTANCE = 72;
const DISMISS_VELOCITY = 650;
const FLING_VELOCITY = 900;
const SNAP_BACK_SPRING = { damping: 22, stiffness: 320 };

type SaintDetailSheetProps = {
  visible: boolean;
  year: number;
  month: number;
  day: number;
  bookmarked: boolean;
  onClose: () => void;
  onDismissStart?: () => void;
  onToggleBookmark: () => void;
};

type ReadingSection = {
  key: string;
  headerKey: HeaderKey;
  icon: IconName;
  refs: string[];
  gradient: [string, string];
  imageUri: string;
};

export function SaintDetailSheet({
  visible,
  year,
  month,
  day,
  bookmarked,
  onClose,
  onDismissStart,
  onToggleBookmark,
}: SaintDetailSheetProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(visible);
  const closingRef = useRef(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrollY = useSharedValue(0);
  const info = useMemo(() => getDayInfo(year, month, day), [year, month, day]);

  const sections: ReadingSection[] = useMemo(
    () => [
      {
        key: 'morning',
        headerKey: 'content.morning',
        icon: 'sun',
        refs: info.lectionary.morning,
        gradient: ['#4A6FA5', '#8BB8E8'],
        imageUri: 'https://picsum.photos/600/400?random=101',
      },
      {
        key: 'liturgical',
        headerKey: 'content.liturgical',
        icon: 'church',
        refs: info.lectionary.liturgical,
        gradient: ['#3D2817', '#8B6914'],
        imageUri: 'https://picsum.photos/600/400?random=102',
      },
      {
        key: 'evening',
        headerKey: 'content.evening',
        icon: 'moon',
        refs: info.lectionary.evening,
        gradient: ['#1A1A2E', '#4A4A8A'],
        imageUri: 'https://picsum.photos/600/400?random=103',
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

  const scrollGesture = Gesture.Native();

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

  const handleShare = async () => {
    await Share.share({
      message: `Saint of the Day: ${info.saint}\n${month + 1}/${day}/${year}\nMorning: ${info.lectionary.morning.join(', ')}`,
    });
  };

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

        <GestureDetector gesture={panGesture}>
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
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                bounces
                contentContainerStyle={styles.scrollContent}>
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
                    <OrthodoxPressable>
                      <Text style={styles.continueLink}>{t('common.continueToReading')}</Text>
                    </OrthodoxPressable>
                  </View>
                </View>

                <View style={styles.body}>
                  <BilingualHeader headerKey="lectionaries" variant="section" />
                  {sections.map((section) => (
                    <View key={section.key} style={styles.section}>
                      <View style={styles.sectionTitleRow}>
                        <Icon name={section.icon} size={18} />
                        <BilingualHeader headerKey={section.headerKey} variant="compact" />
                      </View>
                      <View style={styles.readingCard}>
                        <Image
                          source={{ uri: section.imageUri }}
                          style={styles.cardBg}
                          contentFit="cover"
                          transition={200}
                        />
                        <LinearGradient
                          colors={[...section.gradient, 'rgba(0,0,0,0.75)']}
                          style={styles.cardOverlay}
                        />
                        {Platform.OS === 'ios' ? (
                          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                        ) : null}
                        <View style={styles.cardGlass} />
                        <View style={styles.cardContent}>
                          <Text style={styles.readingsHeading}>{t('common.readings')}</Text>
                          {section.refs.map((ref) => (
                            <Text key={ref} style={styles.readingRef}>
                              {ref}
                            </Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
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
    marginBottom: 12,
  },
  continueLink: {
    fontSize: 15,
    color: Palette.gold,
    fontWeight: '600',
  },
  body: {
    padding: Layout.pagePadding,
    gap: Layout.sectionGap,
    paddingBottom: 40,
  },
  section: {
    gap: Layout.headerContentGap,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  readingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    minHeight: 140,
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 18, 16, 0.55)',
  },
  cardContent: {
    padding: 20,
    zIndex: 1,
  },
  readingsHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 10,
  },
  readingRef: {
    fontSize: 15,
    color: 'rgba(245, 236, 215, 0.85)',
    lineHeight: 15 * 1.6,
    marginBottom: 4,
  },
});
