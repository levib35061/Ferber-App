/** Moonlight-look building blocks: progress ring, check-in dots, moon icon. */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { colors, fonts, type } from "../theme/night";

const SIZE = 290;
const STROKE = 10;
const R = (SIZE - STROKE) / 2 - 3;
const CIRC = 2 * Math.PI * R;

/** Ring that fills clockwise from the top as `progress` goes 0 → 1. */
export function ProgressRing({
  progress,
  color = colors.primary,
  track = colors.buttonBg,
  children,
  accessibilityLabel,
}: {
  progress: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  /** What VoiceOver reads for the whole ring (its texts are read as one). */
  accessibilityLabel?: string;
}) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={styles.ring}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "timer" : undefined}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={track}
          strokeWidth={STROKE}
          fill="none"
        />
        {p > 0 && (
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRC} ${CIRC}`}
            strokeDashoffset={CIRC * (1 - p)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
      </Svg>
      <View style={styles.ringInner}>{children}</View>
    </View>
  );
}

/**
 * One dot per check-in this episode: done ones filled, the next one outlined
 * (or peach when it is due).
 */
export function CheckInDots({
  done,
  due,
  label,
}: {
  done: number;
  due?: boolean;
  label?: string;
}) {
  const dots = Array.from({ length: done + 1 }, (_, i) => i);
  return (
    <View
      style={styles.dotsRow}
      accessible
      accessibilityLabel={`${done} check-in${done === 1 ? "" : "s"} done${label ? `, ${label}` : ""}`}
    >
      {dots.map((i) =>
        i < done ? (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: colors.primary }]}
          />
        ) : due ? (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: colors.accent }]}
          />
        ) : (
          <View key={i} style={[styles.dot, styles.dotEmpty]} />
        ),
      )}
      {label ? (
        <Text style={styles.dotsLabel} maxFontSizeMultiplier={1.6}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export function MoonIcon({
  size = 16,
  color = colors.textDim,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotEmpty: { borderWidth: 2, borderColor: colors.dotEmpty },
  dotsLabel: {
    marginLeft: 6,
    color: colors.textDim,
    fontFamily: fonts.regular,
    fontSize: type.small + 1,
  },
});
