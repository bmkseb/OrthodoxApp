import { router, Stack } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { EthiopicCrossWatermark } from '@/components/sacred/ethiopic-cross-watermark';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { useAuth } from '@/contexts/auth-context';
import { BorderRadius, Layout, Palette, Space, Typography } from '@/constants/theme';

const GOLD_BORDER = 'rgba(201, 147, 58, 0.18)';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest, signOut } = useAuth();
  const { values: scrollIndicator, scrollHandler } = useScrollIndicator();
  const scrollBottomPadding = insets.bottom + Space.s40;

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out', 'Sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/welcome');
        },
      },
    ]);
  }, [signOut]);

  const handleSignIn = useCallback(() => {
    router.push('/auth/welcome');
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  }, []);

  const initial = user?.displayName?.charAt(0)?.toUpperCase() ?? (isGuest ? 'G' : '☩');
  const heading = user?.displayName ?? (isGuest ? 'Guest reader' : 'Profile');
  const detail = user?.email ?? (isGuest ? 'Sign in to sync your devotion' : '');

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <EthiopicCrossWatermark />

      <View style={[styles.topBar, { paddingTop: insets.top + Space.s8 }]}>
        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={handleBack}
          style={styles.iconBtn}>
          <Icon name="chevron-down" size={22} color={Palette.text} />
        </OrthodoxPressable>
        <Text style={styles.topTitle}>Account</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.scrollArea}>
      <AnimatedScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
        <View style={styles.profileBlock}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
          <Text style={styles.heading}>{heading}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>PERSONALIZATION</Text>
          <Text style={styles.cardTitle}>
            {isGuest ? 'Sign in to unlock your rhythm' : 'Your devotion is synced'}
          </Text>
          <Text style={styles.cardBody}>
            {isGuest
              ? 'Streaks, bookmarks, and prayer reminders save to your account so you can pick up where you left off on any device.'
              : 'Streaks, bookmarks, and reading progress are stored safely with your account.'}
          </Text>
        </View>

        {isGuest ? (
          <OrthodoxPressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={handleSignIn}
            style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Sign in or create account</Text>
          </OrthodoxPressable>
        ) : (
          <OrthodoxPressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={handleSignOut}
            style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Sign out</Text>
          </OrthodoxPressable>
        )}
      </AnimatedScrollView>

        <ScrollIndicator values={scrollIndicator} trackInsetBottom={scrollBottomPadding} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  topBar: {
    paddingHorizontal: Layout.pagePadding,
    paddingBottom: Space.s12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...Typography.metadata,
    color: Palette.mutedGold,
  },
  scrollArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Layout.pagePadding,
    gap: Space.s24,
    paddingTop: Space.s24,
  },
  profileBlock: {
    alignItems: 'center',
    gap: Space.s12,
    paddingTop: Space.s16,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Palette.gold,
    fontSize: 32,
    fontWeight: '700',
  },
  heading: {
    ...Typography.sectionTitle,
    color: Palette.text,
    textAlign: 'center',
  },
  detail: {
    ...Typography.body,
    color: Palette.muted,
    textAlign: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_BORDER,
    backgroundColor: Palette.surface,
    padding: Space.s24,
    gap: Space.s8,
  },
  cardEyebrow: {
    ...Typography.metadata,
    color: Palette.mutedGold,
  },
  cardTitle: {
    ...Typography.cardTitle,
    color: Palette.text,
  },
  cardBody: {
    ...Typography.body,
    color: Palette.muted,
  },
  primaryBtn: {
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: Palette.background,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineBtn: {
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: Palette.gold,
    fontSize: 15,
    fontWeight: '600',
  },
});
