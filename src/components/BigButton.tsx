import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { makeStyles } from "../theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "alert" | "link";
  style?: ViewStyle;
  disabled?: boolean;
}

/** Large, thumb-sized pill button. Haptics are handled by the store on each tap. */
export function BigButton({
  label,
  onPress,
  variant = "primary",
  style,
  disabled,
}: Props) {
  const styles = stylesHook();
  const labelStyles = labelStylesHook();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.3 },
        style,
      ]}
    >
      <Text
        style={[styles.label, labelStyles[variant]]}
        numberOfLines={1}
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1.5}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    base: {
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    primary: { minHeight: 92, backgroundColor: colors.primary },
    secondary: { minHeight: 92, backgroundColor: colors.buttonBg },
    alert: { minHeight: 100, backgroundColor: colors.accent },
    link: { minHeight: 48 },
    label: { fontFamily: fonts.extrabold, fontSize: 26 },
  }),
);

const labelStylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    primary: { color: colors.onPrimary },
    secondary: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
    alert: { color: colors.onAccent, fontSize: 28 },
    link: {
      color: colors.textDim,
      fontFamily: fonts.bold,
      fontSize: type.body,
    },
  }),
);
