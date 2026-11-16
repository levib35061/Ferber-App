/**
 * The one-time unlock ($4.99). Shown when starting a night after the free
 * nights, or from Settings → Unlock. Purchases are wired to RevenueCat after
 * Apple approval; until then the buttons explain that (and, in development,
 * offer a test unlock).
 */
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useNightStore } from '../data/NightStore';
import { FREE_NIGHTS, UNLOCK_PRICE } from '../lib/trial';
import { makeStyles, useTheme } from '../theme';

const PERKS = [
  'Unlimited nights and training rounds',
  'Partner sharing on both phones',
  'Progress chart and your own interval chart',
  'Use it again for every baby after this one',
];

export default function UnlockScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { unlocked, freeNightsLeft, updateSetting } = useNightStore();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const purchase = () => {
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [{ text: 'OK', style: 'cancel' }];
    if (__DEV__) {
      buttons.push({
        text: 'Test unlock (dev)',
        onPress: async () => {
          await updateSetting('devUnlocked', true);
          close();
        },
      });
    }
    Alert.alert('Purchases open soon', 'Buying the unlock will be available once the app is in the App Store.', buttons);
  };

  const restore = () =>
    Alert.alert(
      'Restore purchases',
      "Purchases aren't live yet, so there's nothing to restore. This will work once the app is in the App Store.",
    );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} style={styles.closeBtn}>
          <Text style={styles.closeText}>Not now</Text>
        </Pressable>

        <Image source={require('../../assets/icon.png')} style={styles.icon} accessibilityIgnoresInvertColors />

        <Text style={styles.title}>
          {unlocked
            ? 'Check In is unlocked'
            : freeNightsLeft === 0
              ? `Your ${FREE_NIGHTS} free nights are done`
              : 'Unlock Check In'}
        </Text>
        <Text style={styles.sub}>
          {unlocked
            ? 'Thanks for supporting the app. Every night, for every baby, on both phones.'
            : 'Keep going for as many nights as it takes. Most families see real progress within about a week.'}
        </Text>

        <View style={styles.card}>
          {PERKS.map((p) => (
            <View key={p} style={styles.perk}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke={colors.primary}
                  strokeWidth={2.6}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        {!unlocked && (
          <>
            <Text style={styles.price}>{UNLOCK_PRICE} once</Text>
            <Text style={styles.priceSub}>No subscription, no ads. One purchase covers both parents.</Text>
            <Pressable
              onPress={purchase}
              accessibilityRole="button"
              style={({ pressed }) => [styles.buy, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.buyText}>Unlock for {UNLOCK_PRICE}</Text>
            </Pressable>
            <Pressable onPress={restore} accessibilityRole="button" style={styles.restore} hitSlop={8}>
              <Text style={styles.restoreText}>Restore purchases</Text>
            </Pressable>
            <Text style={styles.footnote}>
              Your history, Today and Progress stay viewable either way. Family Sharing is supported.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' },
    closeBtn: { alignSelf: 'flex-end', paddingVertical: 12 },
    closeText: { color: colors.textDim, fontFamily: fonts.bold, fontSize: type.body },
    icon: { width: 96, height: 96, borderRadius: 22, marginTop: 8 },
    title: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, textAlign: 'center', marginTop: 20 },
    sub: {
      color: colors.textDim,
      fontFamily: fonts.regular,
      fontSize: type.body,
      lineHeight: 24,
      textAlign: 'center',
      marginTop: 8,
    },
    card: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: 22, padding: 18, gap: 14, marginTop: 24 },
    perk: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    perkText: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: type.body },
    price: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 30, marginTop: 26 },
    priceSub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15, textAlign: 'center', marginTop: 4 },
    buy: {
      alignSelf: 'stretch',
      minHeight: 60,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    buyText: { color: colors.onPrimary, fontFamily: fonts.extrabold, fontSize: 19 },
    restore: { paddingVertical: 14 },
    restoreText: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 15 },
    footnote: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  }),
);
