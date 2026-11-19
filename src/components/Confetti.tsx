/**
 * A short, soft confetti burst for the morning recap after a better night
 * (when: `shouldCelebrate` in src/lib/morning.ts). Day colours, about two
 * seconds, falls behind nothing and blocks no taps. Skipped entirely when
 * the phone has Reduce Motion on. Built on Animated (no extra library).
 */
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

import { day } from '../theme/day';

const COLORS = [day.coralSoft, day.plum, day.feeding, day.coral, day.settling];
const PIECES = 28;

/** Stable pseudo-random numbers in [0, 1) so every render draws the same pieces. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function Confetti({ onDone }: { onDone?: () => void }) {
  const { width, height } = useWindowDimensions();
  const [progress] = useState(() => Array.from({ length: PIECES }, () => new Animated.Value(0)));
  const [show, setShow] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
          25,
          progress.map((p, i) =>
            Animated.timing(p, {
              toValue: 1,
              duration: 1700 + rand(i, 1) * 700,
              easing: Easing.out(Easing.quad),
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
  }, [progress, onDone]);

  if (!show) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {progress.map((p, i) => {
        const startX = width * (0.1 + rand(i, 2) * 0.8);
        const drift = (rand(i, 3) - 0.5) * 120;
        const fall = height * (0.35 + rand(i, 4) * 0.3);
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
              opacity: p.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] }),
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
