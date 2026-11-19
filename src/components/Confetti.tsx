/**
 * A soft confetti burst for the morning recap after a better night (when:
 * `shouldCelebrate` in src/lib/morning.ts). Day colours, about four and a half
 * seconds from first to last piece, blocks no taps. With Reduce Motion on there's
 * no confetti and no buzz. Built on Animated (no extra library).
 */
import React, { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, AppState, Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

import { day } from '../theme/day';

const COLORS = [day.coralSoft, day.plum, day.feeding, day.coral, day.settling];
const PIECES = 44;

/** Stable pseudo-random numbers in [0, 1) so every render draws the same pieces. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A small celebratory buzz with the burst: a success tap, then two lighter ones. */
function celebrateHaptics(later: (fn: () => void, ms: number) => void) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  later(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}), 350);
  later(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}), 650);
}

/**
 * Plays once, and only once the app is on screen: a recap can mount in the background
 * (a partner's silent push), and iOS drops haptics while the app is coming to the front.
 * A moment after the app is active it asks `canStart()` again (a partner's night may
 * have just synced and changed the numbers); only then does it call `onStarted` (the
 * caller remembers the night as celebrated), buzz and animate. Unmounting cancels
 * everything still pending.
 */
export function Confetti({
  canStart,
  onStarted,
  haptics = true,
}: {
  /** Re-checked right before playing, with the latest data */
  canStart: () => boolean;
  onStarted: () => void;
  haptics?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const [progress] = useState(() => Array.from({ length: PIECES }, () => new Animated.Value(0)));
  const [show, setShow] = useState(false);
  // Latest props, read when the moment comes (the effect itself runs once).
  const latest = useRef({ canStart, onStarted, haptics });
  useEffect(() => {
    latest.current = { canStart, onStarted, haptics };
  });

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(() => !cancelled && fn(), ms));
    let sub: { remove: () => void } | null = null;

    const play = async () => {
      const reduce = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      if (cancelled || AppState.currentState !== 'active' || !latest.current.canStart()) return;
      latest.current.onStarted();
      if (reduce) return; // no motion, and no buzz without anything to see
      if (latest.current.haptics) celebrateHaptics(later);
      setShow(true);
      Animated.stagger(
        25,
        progress.map((p, i) =>
          Animated.timing(p, {
            toValue: 1,
            duration: 2600 + rand(i, 1) * 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ).start(() => !cancelled && setShow(false));
    };
    // Give a just-opened app a moment (and a partner's sync time to land), then play.
    const whenActive = () => later(play, 1200);
    if (AppState.currentState === 'active') whenActive();
    else {
      sub = AppState.addEventListener('change', (st) => {
        if (st !== 'active') return;
        sub?.remove();
        sub = null;
        whenActive();
      });
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      sub?.remove();
      progress.forEach((p) => p.stopAnimation());
    };
  }, [progress]);

  if (!show) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {progress.map((p, i) => {
        const startX = width * (0.1 + rand(i, 2) * 0.8);
        const drift = (rand(i, 3) - 0.5) * 160;
        const fall = height * (0.55 + rand(i, 4) * 0.35);
        const size = 6 + rand(i, 5) * 6;
        const spin = (rand(i, 6) > 0.5 ? 1 : -1) * (180 + rand(i, 7) * 360);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: startX,
              top: height * 0.08,
              width: size,
              height: size * (rand(i, 8) > 0.5 ? 1 : 0.45),
              borderRadius: rand(i, 9) > 0.6 ? size / 2 : 1.5,
              backgroundColor: COLORS[i % COLORS.length],
              opacity: p.interpolate({ inputRange: [0, 0.06, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-20, fall] }) },
                { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
                { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
