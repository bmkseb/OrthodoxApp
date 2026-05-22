import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SacredImage } from '@/components/sacred/sacred-image';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { Animation, Layout, Palette } from '@/constants/theme';
import { DayInfo } from '@/data/orthodoxCalendar';
import { useTranslation } from '@/hooks/use-translation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.6;

type SaintDetailSheetProps = {
  visible: boolean;
  dayInfo: DayInfo | null;
  onClose: () => void;
};

type ReadingCardProps = {
  headerKey: 'content.morning' | 'content.liturgical' | 'content.evening';
  refs: string[];
  gradientColors: [string, string];
};

function ReadingCard({ headerKey, refs, gradientColors }: ReadingCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.readingSection}>
      <BilingualHeader headerKey={headerKey} variant="compact" />
      <View style={styles.readingCardOuter}>
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
        {Platform.OS === 'ios' ? (
          <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.readingCardInner}>
          <Text style={styles.readingsLabel}>{t('common.readings')}</Text>
          <Text style={styles.readingsRefs}>{refs.join('\n')}</Text>
        </View>
      </View>
    </View>
  );
}

function SaintDetailSheetComponent({ visible, dayInfo, onClose }: SaintDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    translateY.value = visible
      ? withSpring(0, { damping: 22, stiffness: 220, mass: 0.9 })
      : withSpring(SCREEN_HEIGHT, { damping: 24, stiffness: 260 });
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!dayInfo?.primaryEvent) return null;

  const event = dayInfo.primaryEvent;
  const saintName = event.saint ?? event.nameEn;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('sections.saintOfTheDay')}: ${saintName}\n${event.lectionaries.morning.join(', ')}`,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + Layout.pagePadding }, sheetStyle]}>
          <View style={styles.handle} />

          <View style={styles.sheetActions}>
            <TouchableOpacity onPress={handleShare} accessibilityLabel={t('calendar.shareReading')}>
              <Text style={styles.actionText}>{t('calendar.shareReading')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.actionText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.hero}>
              <SacredImage source={event.image ?? ''} style={styles.heroImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.92)']}
                style={styles.heroGradient}
              />
              <View style={styles.heroText}>
                <Text style={styles.heroLabel}>{t('sections.saintOfTheDay').toUpperCase()}</Text>
                <Text style={styles.heroName}>{saintName}</Text>
                <TouchableOpacity>
                  <Text style={styles.continueLink}>{t('common.continueToReading')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.content}>
              <BilingualHeader headerKey="lectionaries" variant="section" />

              <ReadingCard
                headerKey="content.morning"
                refs={event.lectionaries.morning}
                gradientColors={['rgba(30, 40, 60, 0.85)', 'rgba(15, 20, 35, 0.95)']}
              />
              <ReadingCard
                headerKey="content.liturgical"
                refs={event.lectionaries.liturgical}
                gradientColors={['rgba(40, 28, 18, 0.85)', 'rgba(20, 14, 10, 0.95)']}
              />
              <ReadingCard
                headerKey="content.evening"
                refs={event.lectionaries.evening}
                gradientColors={['rgba(18, 22, 40, 0.85)', 'rgba(8, 10, 22, 0.95)']}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export const SaintDetailSheet = memo(SaintDetailSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.94,
    backgroundColor: Palette.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.gold,
    opacity: 0.3,
    marginTop: 10,
    marginBottom: 4,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.pagePadding,
    paddingVertical: 8,
  },
  actionText: {
    color: Palette.gold,
    fontSize: 13,
    fontWeight: '500',
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
  heroText: {
    position: 'absolute',
    left: Layout.pagePadding,
    right: Layout.pagePadding,
    bottom: 28,
  },
  heroLabel: {
    color: 'rgba(201, 147, 58, 0.85)',
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroName: {
    color: Palette.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
  continueLink: {
    color: Palette.gold,
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    padding: Layout.pagePadding,
    gap: 20,
  },
  readingSection: {
    gap: 10,
  },
  readingCardOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.15)',
  },
  readingCardInner: {
    padding: 20,
    backgroundColor: 'rgba(20, 18, 16, 0.72)',
  },
  readingsLabel: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  readingsRefs: {
    color: 'rgba(245, 236, 215, 0.78)',
    fontSize: 14,
    lineHeight: 22.4,
  },
});
