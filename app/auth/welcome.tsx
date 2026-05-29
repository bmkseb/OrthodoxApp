import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { useAuth } from '@/contexts/auth-context';
import { BorderRadius, Layout, Palette, Space, Typography } from '@/constants/theme';

type Stage = 'quote' | 'brand' | 'actions' | 'login';
type Mode = 'signIn' | 'signUp';

const GOLD_FOCUS = 'rgba(201, 147, 58, 0.55)';
const GOLD_IDLE = 'rgba(201, 147, 58, 0.18)';
const ANIM_CFG = { reduceMotion: ReduceMotion.Never } as const;

const QUOTE_AUTO_ADVANCE_MS = 2800;
const BRAND_AUTO_ADVANCE_MS = 2200;

function isLikelyEmail(value: string) {
  return /.+@.+\..+/.test(value.trim());
}

export default function WelcomeAuthScreen() {
  const [stage, setStage] = useState<Stage>('quote');
  const [loginMode, setLoginMode] = useState<Mode>('signIn');
  const { continueAsGuest } = useAuth();

  const goToBrand = useCallback(() => setStage('brand'), []);
  const goToActions = useCallback(() => setStage('actions'), []);
  const goToLogin = useCallback(
    (mode: Mode) => {
      setLoginMode(mode);
      setStage('login');
    },
    []
  );
  const handleGuest = useCallback(async () => {
    await continueAsGuest();
    router.replace('/(tabs)/explore');
  }, [continueAsGuest]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      {stage === 'quote' ? (
        <QuoteScreen onDone={goToBrand} />
      ) : stage === 'brand' ? (
        <BrandRevealScreen onDone={goToActions} />
      ) : stage === 'actions' ? (
        <ActionsScreen
          onContinue={() => goToLogin('signUp')}
          onSignIn={() => goToLogin('signIn')}
          onGuest={handleGuest}
        />
      ) : (
        <LoginScreen initialMode={loginMode} />
      )}
    </View>
  );
}

/* ---------------------------------------------------------------- *
 * Shared — Ethiopian cross glyph + ORTHODOX wordmark
 * ---------------------------------------------------------------- */

type BrandMarkProps = {
  crossSize: number;
  wordSize: number;
  wordSpacing: number;
  gap: number;
  showWord?: boolean;
};

function BrandMark({
  crossSize,
  wordSize,
  wordSpacing,
  gap,
  showWord = true,
}: BrandMarkProps) {
  return (
    <View style={styles.brandMark}>
      <Text
        allowFontScaling={false}
        accessibilityLabel="Ethiopian Orthodox cross"
        style={[
          styles.brandCrossGlyph,
          {
            fontSize: crossSize,
            lineHeight: crossSize * 1.05,
            marginBottom: showWord ? gap : 0,
          },
        ]}>
        ☩
      </Text>
      {showWord ? (
        <Text
          allowFontScaling={false}
          style={[
            styles.brandWord,
            { fontSize: wordSize, letterSpacing: wordSpacing, paddingLeft: wordSpacing },
          ]}>
          ORTHODOX
        </Text>
      ) : null}
    </View>
  );
}

/* ---------------------------------------------------------------- *
 * Step 1 — Quote screen
 * ---------------------------------------------------------------- */

function QuoteScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const quoteOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const quoteTranslate = useSharedValue(reduceMotion ? 0 : 16);
  const refOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const stageOpacity = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) {
      const ease = Easing.out(Easing.cubic);
      quoteOpacity.value = withTiming(1, { duration: 700, easing: ease, ...ANIM_CFG });
      quoteTranslate.value = withTiming(0, { duration: 700, easing: ease, ...ANIM_CFG });
      refOpacity.value = withDelay(
        520,
        withTiming(1, { duration: 600, easing: ease, ...ANIM_CFG })
      );
    }
    const t = setTimeout(() => {
      if (reduceMotion) {
        onDone();
        return;
      }
      stageOpacity.value = withTiming(
        0,
        { duration: 380, easing: Easing.in(Easing.quad), ...ANIM_CFG },
        (finished) => {
          if (finished) runOnJS(onDone)();
        }
      );
    }, QUOTE_AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [onDone, quoteOpacity, quoteTranslate, refOpacity, reduceMotion, stageOpacity]);

  const stageStyle = useAnimatedStyle(() => ({ opacity: stageOpacity.value }));
  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteTranslate.value }],
  }));
  const refStyle = useAnimatedStyle(() => ({ opacity: refOpacity.value }));

  return (
    <Animated.View
      style={[
        styles.stageRoot,
        stageStyle,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.quoteSpacerTop} />
      <View style={styles.quoteContent}>
        <Animated.Text allowFontScaling={false} style={[styles.quoteText, quoteStyle]}>
          {'Narrow is the way\nwhich leads to life.'}
        </Animated.Text>
        <Animated.Text allowFontScaling={false} style={[styles.quoteRef, refStyle]}>
          MATTHEW 7:14
        </Animated.Text>
      </View>
      <View style={styles.quoteSpacerBottom} />
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- *
 * Step 2 — Brand reveal screen
 * ---------------------------------------------------------------- */

function BrandRevealScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const crossOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const crossScale = useSharedValue(reduceMotion ? 1 : 0.92);
  const wordOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const wordTranslate = useSharedValue(reduceMotion ? 0 : 10);
  const subOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const stageOpacity = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) {
      const ease = Easing.out(Easing.cubic);
      crossOpacity.value = withTiming(1, { duration: 620, easing: ease, ...ANIM_CFG });
      crossScale.value = withTiming(1, {
        duration: 720,
        easing: Easing.inOut(Easing.cubic),
        ...ANIM_CFG,
      });
      wordOpacity.value = withDelay(
        420,
        withTiming(1, { duration: 460, easing: ease, ...ANIM_CFG })
      );
      wordTranslate.value = withDelay(
        420,
        withTiming(0, { duration: 460, easing: ease, ...ANIM_CFG })
      );
      subOpacity.value = withDelay(
        820,
        withTiming(1, { duration: 480, easing: ease, ...ANIM_CFG })
      );
    }
    const t = setTimeout(() => {
      if (reduceMotion) {
        onDone();
        return;
      }
      stageOpacity.value = withTiming(
        0,
        { duration: 380, easing: Easing.in(Easing.quad), ...ANIM_CFG },
        (finished) => {
          if (finished) runOnJS(onDone)();
        }
      );
    }, BRAND_AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [
    crossOpacity,
    crossScale,
    onDone,
    reduceMotion,
    stageOpacity,
    subOpacity,
    wordOpacity,
    wordTranslate,
  ]);

  const stageStyle = useAnimatedStyle(() => ({ opacity: stageOpacity.value }));
  const crossStyle = useAnimatedStyle(() => ({
    opacity: crossOpacity.value,
    transform: [{ scale: crossScale.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordTranslate.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));

  return (
    <Animated.View
      style={[
        styles.stageRoot,
        stageStyle,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.brandSpacerTop} />

      <View style={styles.brandHero}>
        <Animated.View style={[styles.brandCrossWrap, crossStyle]}>
          <View style={styles.glowOuter} pointerEvents="none" />
          <View style={styles.glowInner} pointerEvents="none" />
          <Text
            allowFontScaling={false}
            accessibilityLabel="Ethiopian Orthodox cross"
            style={styles.brandCrossLargeGlyph}>
            ☩
          </Text>
        </Animated.View>

        <Animated.Text allowFontScaling={false} style={[styles.brandWordLarge, wordStyle]}>
          ORTHODOX
        </Animated.Text>

        <Animated.Text style={[styles.brandSubtitle, subStyle]}>
          Sacred readings, hymns, and daily devotion
        </Animated.Text>
      </View>

      <View style={styles.brandSpacerBottom} />
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- *
 * Step 3 — Action screen
 * ---------------------------------------------------------------- */

type ActionsScreenProps = {
  onContinue: () => void;
  onSignIn: () => void;
  onGuest: () => void;
};

function ActionsScreen({ onContinue, onSignIn, onGuest }: ActionsScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const enterOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const enterLift = useSharedValue(reduceMotion ? 0 : 14);

  useEffect(() => {
    if (reduceMotion) return;
    enterOpacity.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
      ...ANIM_CFG,
    });
    enterLift.value = withTiming(0, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
      ...ANIM_CFG,
    });
  }, [enterLift, enterOpacity, reduceMotion]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterLift.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.stageRoot,
        enterStyle,
        {
          paddingTop: insets.top + Space.s40,
          paddingBottom: Math.max(insets.bottom, Space.s24) + Space.s24,
        },
      ]}>

      <View style={styles.actionsHeader}>
        <BrandMark crossSize={150} wordSize={26} wordSpacing={11} gap={Space.s24} />
      </View>

      <View style={styles.actionsHeading}>
        <Text style={styles.actionsTitle}>Welcome</Text>
        <Text style={styles.actionsSubtitle}>
          Begin your daily rhythm of reading, prayer, and hymnody.
        </Text>
      </View>

      {/* Flexible middle space keeps the title group lifted and the buttons anchored low */}
      <View style={styles.actionsSpacer} />

      <View style={styles.actionsButtons}>
        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinue}
          style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </OrthodoxPressable>

        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel="I already have an account"
          onPress={onSignIn}
          style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>I already have an account</Text>
        </OrthodoxPressable>

        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel="Continue as guest"
          onPress={onGuest}
          style={styles.linkBtn}>
          <Text style={styles.guestLinkText}>Continue as guest</Text>
        </OrthodoxPressable>
      </View>
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- *
 * Step 4 — Login / Create account
 * ---------------------------------------------------------------- */

function LoginScreen({ initialMode = 'signIn' as Mode }: { initialMode?: Mode }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { signIn, signUp, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fadeIn = useSharedValue(reduceMotion ? 1 : 0);
  const liftIn = useSharedValue(reduceMotion ? 0 : 16);

  useEffect(() => {
    if (reduceMotion) return;
    fadeIn.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      ...ANIM_CFG,
    });
    liftIn.value = withTiming(0, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      ...ANIM_CFG,
    });
  }, [fadeIn, liftIn, reduceMotion]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: liftIn.value }],
  }));

  const title = 'Welcome';
  const subtitle =
    mode === 'signIn'
      ? 'Continue your daily devotion'
      : 'Create an account to save your prayer rhythm';
  const primaryLabel = mode === 'signIn' ? 'Sign in' : 'Create account';
  const switchLabel =
    mode === 'signIn' ? 'New to OrthodoxApp? Create account' : 'Already have an account? Sign in';

  const canSubmit = useMemo(
    () => isLikelyEmail(email) && password.length >= 6 && !submitting,
    [email, password, submitting]
  );

  const handlePrimary = useCallback(async () => {
    if (!canSubmit) {
      Alert.alert(
        'Check your details',
        'Please enter a valid email and a password of at least 6 characters.'
      );
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signIn') await signIn(email, password);
      else await signUp(email, password);
      router.replace('/(tabs)/explore');
    } catch (err) {
      Alert.alert('Something went wrong', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, email, mode, password, signIn, signUp]);

  const handleGuest = useCallback(async () => {
    await continueAsGuest();
    router.replace('/(tabs)/explore');
  }, [continueAsGuest]);

  const handleForgot = useCallback(() => {
    Alert.alert(
      'Reset password',
      'Password recovery will be available once the cloud account service is connected.'
    );
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.loginScroll,
          {
            paddingTop: insets.top + Space.s16,
            paddingBottom: insets.bottom + Space.s40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={enterStyle}>
        <View style={styles.loginBrandHeader}>
          <BrandMark crossSize={44} wordSize={13} wordSpacing={5} gap={Space.s4} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="you@example.com"
              placeholderTextColor={Palette.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              returnKeyType="next"
              selectionColor={Palette.gold}
              cursorColor={Palette.gold}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="At least 6 characters"
              placeholderTextColor={Palette.muted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handlePrimary}
              selectionColor={Palette.gold}
              cursorColor={Palette.gold}
            />
          </View>

          {mode === 'signIn' ? (
            <OrthodoxPressable
              accessibilityRole="link"
              accessibilityLabel="Forgot password"
              onPress={handleForgot}
              style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </OrthodoxPressable>
          ) : null}

          <OrthodoxPressable
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            onPress={handlePrimary}
            style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}>
            {submitting ? (
              <ActivityIndicator color={Palette.background} />
            ) : (
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
            )}
          </OrthodoxPressable>

          <OrthodoxPressable
            accessibilityRole="button"
            accessibilityLabel={switchLabel}
            onPress={() => setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'))}
            style={styles.switchBtn}>
            <Text style={styles.switchText}>{switchLabel}</Text>
          </OrthodoxPressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel="Continue as guest"
          onPress={handleGuest}
          style={styles.guestBtn}>
          <Text style={styles.guestBtnText}>Continue as guest</Text>
        </OrthodoxPressable>

        <Text style={styles.footnote}>
          Your account keeps prayer streaks, bookmarks, and reading progress across devices. Guests
          can still read, listen, and explore.
        </Text>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------------------------------------------------------- *
 * Styles
 * ---------------------------------------------------------------- */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: { flex: 1 },
  stageRoot: {
    flex: 1,
    paddingHorizontal: Space.s24,
  },

  // Quote screen
  quoteSpacerTop: {
    flex: 0.7,
  },
  quoteContent: {
    alignItems: 'flex-start',
    gap: Space.s24,
  },
  quoteText: {
    color: Palette.text,
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 54,
    letterSpacing: -0.6,
    textAlign: 'left',
  },
  quoteRef: {
    color: Palette.gold,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  quoteSpacerBottom: {
    flex: 1,
  },

  // Brand reveal screen
  brandSpacerTop: {
    flex: 0.55,
  },
  brandHero: {
    alignItems: 'center',
  },
  brandCrossWrap: {
    width: 260,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.s32,
  },
  brandCrossLargeGlyph: {
    color: Palette.gold,
    fontSize: 160,
    lineHeight: 168,
    fontWeight: '300',
    textAlign: 'center',
    textShadowColor: 'rgba(201, 147, 58, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  glowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201, 147, 58, 0.035)',
  },
  glowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201, 147, 58, 0.06)',
    shadowColor: '#C9933A',
    shadowOpacity: 0.4,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  },
  brandWordLarge: {
    color: Palette.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 12,
    textAlign: 'center',
    paddingLeft: 12,
    marginBottom: Space.s16,
  },
  brandSubtitle: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
    letterSpacing: 0.3,
  },
  brandSpacerBottom: {
    flex: 1,
  },

  // Actions screen
  actionsHeader: {
    alignItems: 'center',
  },
  actionsHeading: {
    alignItems: 'center',
    gap: Space.s24,
    paddingTop: Space.s48, // breathing room under the large brand mark
    paddingHorizontal: Space.s8,
  },
  actionsTitle: {
    ...Typography.pageTitle,
    fontSize: 40,
    lineHeight: 46,
    color: Palette.text,
    textAlign: 'center',
  },
  actionsSubtitle: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: Palette.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  actionsSpacer: {
    flex: 1,
    minHeight: Space.s40,
  },
  actionsButtons: {
    alignItems: 'center',
    gap: Space.s24,
    paddingHorizontal: Space.s8,
  },
  continueBtn: {
    width: '88%',
    height: 60,
    borderRadius: 22,
    backgroundColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.gold,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  continueBtnText: {
    color: '#1A0F00',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  linkBtn: {
    paddingVertical: Space.s8,
    paddingHorizontal: Space.s16,
  },
  linkBtnText: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  guestLinkText: {
    color: Palette.mutedGold,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Shared brand mark
  brandMark: {
    alignItems: 'center',
  },
  brandCrossGlyph: {
    color: Palette.gold,
    fontWeight: '300',
    textAlign: 'center',
    textShadowColor: 'rgba(201, 147, 58, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  brandWord: {
    color: Palette.text,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Login
  loginScroll: {
    paddingHorizontal: Layout.pagePadding,
    gap: Space.s24,
  },
  loginBrandHeader: {
    alignItems: 'center',
    paddingTop: Space.s8,
    paddingBottom: Space.s8,
  },
  heading: {
    alignItems: 'center',
    gap: Space.s8,
  },
  title: {
    ...Typography.pageTitle,
    fontSize: 30,
    lineHeight: 36,
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Palette.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_IDLE,
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.s24,
    paddingVertical: Space.s24,
    gap: Space.s16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  fieldGroup: { gap: Space.s8 },
  label: {
    ...Typography.metadata,
    color: Palette.muted,
  },
  input: {
    height: 50,
    paddingHorizontal: Space.s16,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_IDLE,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: Palette.text,
    fontSize: 16,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: GOLD_FOCUS,
    backgroundColor: 'rgba(201, 147, 58, 0.05)',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    paddingVertical: Space.s4,
    paddingHorizontal: Space.s4,
  },
  forgotText: {
    color: Palette.mutedGold,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryBtn: {
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.s8,
    shadowColor: Palette.gold,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: {
    color: Palette.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: Space.s8,
  },
  switchText: {
    color: Palette.mutedGold,
    fontSize: 13,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201, 147, 58, 0.18)',
  },
  dividerText: {
    ...Typography.metadata,
    color: Palette.muted,
    fontSize: 10,
  },
  guestBtn: {
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_FOCUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  guestBtnText: {
    color: Palette.gold,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footnote: {
    ...Typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: Palette.muted,
    textAlign: 'center',
    paddingHorizontal: Space.s16,
  },
});
