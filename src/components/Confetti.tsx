/**
 * A short, soft confetti burst for the morning recap after a better night
 * (when: `shouldCelebrate` in src/lib/morning.ts). Day colours, about four
 * seconds, falls behind nothing and blocks no taps. Skipped entirely when
 * the phone has Reduce Motion on. Built on Animated (no extra library).
 */
import React, { useEffect, useState } from 'react';
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

/**
 * A small celebratory buzz with the burst: a success tap, then two lighter ones.
 * iOS drops haptics while the app is still coming to the front, so this waits until
 * the app is active and a moment has passed.
 */
function celebrateHaptics() {
  const play = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}), 350);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}), 650);
  };
  const later = () => setTimeout(play, 400);
  if (AppState.currentState === 'active') return later();
  const sub = AppState.addEventListener('change', (st) => {
    if (st !== 'active') return;
    sub.remove();
    later();
  });
}

export function Confetti({ onDone, haptics = true }: { onDone?: () => void; haptics?: boolean }) {
  const { width, height } = useWindowDimensions();
  const [progress] = useState(() => Array.from({ length: PIECES }, () => new Animated.Value(0)));
  const [show, setShow] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (haptics) celebrateHaptics();
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          setShow(false);
          onDone?.();
          return;
        }
        Animated.stagger(
          45,
          progress.map((p, i) =>
            Animated.timing(p, {
              toValue: 1,
              duration: 3200 + rand(i, 1) * 1400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ).start(() => {
          if (cancelled) return;
          setShow(false);
          onDone?.();
        });
      });
    return () => {
      cancelled = true;
    };
  }, [progress, onDone, haptics]);

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
