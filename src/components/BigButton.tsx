import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, type } from '../theme/night';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'alert' | 'link';
  style?: ViewStyle;
  disabled?: boolean;
}

/** Large, thumb-sized button. Haptics are handled by the store on each tap. */
export function BigButton({ label, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'alert' && styles.alert,
        variant === 'link' && styles.link,
        pressed && { opacity: 0.6 },
        disabled && { opacity: 0.3 },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'alert' && styles.alertLabel,
          variant === 'link' && styles.linkLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.buttonBg,
    borderWidth: 2,
    borderColor: colors.text,
  },
  secondary: {
    flex: 1,
    minHeight: 72,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alert: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.accentBg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  link: { minHeight: 48 },
  label: { color: colors.text, fontSize: type.huge, fontWeight: '700' },
  secondaryLabel: { fontSize: type.big, fontWeight: '600', color: colors.text },
  alertLabel: { color: colors.accent },
  linkLabel: { fontSize: type.body, fontWeight: '500', color: colors.textDim },
});
