import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { useTranslation } from '@/hooks/use-translation';
import type { HeaderKey } from '@/lib/translations';
import { getDayInfo } from '@/data/orthodoxCalendar';
import { Animation, Layout, Opacity, Palette } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.6;

type SaintDetailSheetProps = {
  visible: boolean;
  year: number;
  month: number;
  day: number;
  bookmarked: boolean;
  onClose: () => void;
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
  onToggleBookmark,
}: SaintDetailSheetProps) {
  const { t } = useTranslation();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const info = getDayInfo(year, month, day);

  const sections: ReadingSection[] = [
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
  ];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 200, mass: 0.8 });
    } else {
      translateY.value = SCREEN_HEIGHT;
    }
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    translateY.value = withSpring(SCREEN_HEIGHT, { damping: 22, stiffness: 200 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const handleShare = async () => {
    await Share.share({
      message: `Saint of the Day: ${info.saint}\n${month + 1}/${day}/${year}\nMorning: ${info.lectionary.morning.join(', ')}`,
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.hero}>
            <Image
              source={{ uri: `https://picsum.photos/800/1200?random=${day + month * 31}` }}
              style={styles.heroImage}
              contentFit="cover"
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
                <Icon name="bookmark" size={20} color={bookmarked ? Palette.gold : Palette.muted} />
              </OrthodoxPressable>
            </View>
            <View style={styles.heroText}>
              <Text style={styles.saintLabel}>{t('sections.saintOfTheDay').toUpperCase()}</Text>
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
                  <Image source={{ uri: section.imageUri }} style={styles.cardBg} contentFit="cover" />
                  <LinearGradient colors={[...section.gradient, 'rgba(0,0,0,0.75)']} style={styles.cardOverlay} />
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
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.92,
    backgroundColor: Palette.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
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
