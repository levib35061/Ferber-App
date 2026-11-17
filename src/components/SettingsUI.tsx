/**
 * Building blocks for the Settings screens ("baby card + topics" layout):
 * a page frame with a back link, section labels, cards, switch rows,
 * buttons, topic rows and line icons. Moonlight theme.
 */
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { makeStyles, useTheme } from '../theme';

/** A Settings page: optional "‹ Settings" back link, big title, scrolling body. */
export function SettingsPage({
  title,
  back = true,
  children,
}: {
  title?: string;
  back?: boolean;
  children: React.ReactNode;
}) {
  const styles = stylesHook();
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {back && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back to Settings"
              style={styles.back}
            >
              <Text style={styles.backText}>‹ Settings</Text>
            </Pressable>
          )}
          {title && <Text style={[styles.title, back && styles.titleSub]}>{title}</Text>}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const styles = stylesHook();
  return <Text style={styles.sectionLabel}>{children.toUpperCase()}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const styles = stylesHook();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  const styles = stylesHook();
  return <View style={styles.divider} />;
}

export function SwitchRow(props: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  const styles = stylesHook();
  const { colors } = useTheme();
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{props.label}</Text>
        {props.hint && <Text style={styles.rowHint}>{props.hint}</Text>}
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        trackColor={{ true: colors.primary, false: colors.buttonBg }}
        thumbColor={colors.text}
        accessibilityLabel={props.label}
      />
    </View>
  );
}

export function SettingsButton(props: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  const styles = stylesHook();
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        props.primary && styles.buttonPrimary,
        (pressed || props.disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.buttonText, props.primary && styles.buttonPrimaryText]}>{props.label}</Text>
    </Pressable>
  );
}

/** Two-way choice in a pill, e.g. Soft sound / Vibrate only. */
export function Segmented<T extends string>(props: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const styles = stylesHook();
  return (
    <View style={styles.segment} accessibilityRole="radiogroup">
      {props.options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => props.onChange(o.key)}
          accessibilityRole="radio"
          accessibilityState={{ selected: props.value === o.key }}
          style={[styles.segBtn, props.value === o.key && styles.segBtnOn]}
        >
          <Text style={[styles.segText, props.value === o.key && styles.segTextOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A tappable topic on the main Settings screen: icon, title, one-line description, chevron. */
export function TopicRow(props: { icon: IconName; title: string; description: string; onPress: () => void }) {
  const styles = stylesHook();
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${props.title}. ${props.description}`}
      style={({ pressed }) => [styles.topic, pressed && { opacity: 0.7 }]}
    >
      <Icon name={props.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.topicTitle}>{props.title}</Text>
        <Text style={styles.topicDesc}>{props.description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

/** A plain tappable row inside a Card (e.g. a link). */
export function LinkRow({ label, detail, onPress }: { label: string; detail?: string; onPress: () => void }) {
  const styles = stylesHook();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {detail && <Text style={styles.linkDetail}>{detail}</Text>}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export type IconName = 'moon' | 'clock' | 'bell' | 'people' | 'star' | 'info' | 'flask';

export function Icon({ name, size = 24, color: colorProp }: { name: IconName; size?: number; color?: string }) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.primary;
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'moon' && <Path {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
      {name === 'clock' && (
        <>
          <Circle {...p} cx={12} cy={12} r={9} />
          <Path {...p} d="M12 7v5l3 2" />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path {...p} d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path {...p} d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      )}
      {name === 'people' && (
        <>
          <Circle {...p} cx={9} cy={8} r={3.5} />
          <Circle {...p} cx={17} cy={9} r={2.5} />
          <Path {...p} d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <Path {...p} d="M15.5 14.5a5 5 0 0 1 6 5.5" />
        </>
      )}
      {name === 'star' && <Path {...p} d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />}
      {name === 'info' && (
        <>
          <Circle {...p} cx={12} cy={12} r={9} />
          <Path {...p} d="M12 11v6" />
          <Path {...p} d="M12 7.5v.5" />
        </>
      )}
      {name === 'flask' && (
        <>
          <Path {...p} d="M9 3h6" />
          <Path {...p} d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3" />
        </>
      )}
    </Svg>
  );
}

/** Shared text and input styles for Settings pages: `const s = useSettingsStyles()`. */
export const useSettingsStyles = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    body: {
      color: colors.text,
      fontFamily: fonts.regular,
      fontSize: type.body,
      lineHeight: 24,
    },
    hint: {
      color: colors.textFaint,
      fontFamily: fonts.regular,
      fontSize: type.small,
      lineHeight: 20,
      marginTop: 6,
    },
    fieldLabel: {
      color: colors.textDim,
      fontFamily: fonts.semibold,
      fontSize: 13,
      marginBottom: 6,
    },
    input: {
      height: 50,
      borderRadius: 14,
      backgroundColor: colors.buttonBg,
      paddingHorizontal: 14,
      color: colors.text,
      fontFamily: fonts.semibold,
      fontSize: 18,
    },
  }),
);

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 60 },
    back: { paddingTop: 10, paddingBottom: 4, alignSelf: 'flex-start' },
    backText: {
      color: colors.primary,
      fontFamily: fonts.bold,
      fontSize: type.body,
    },
    title: {
      color: colors.text,
      fontFamily: fonts.extrabold,
      fontSize: type.huge,
      marginTop: 16,
      marginBottom: 18,
      marginHorizontal: 4,
    },
    titleSub: { fontSize: 30, marginTop: 8 },
    sectionLabel: {
      color: colors.textDim,
      fontFamily: fonts.bold,
      fontSize: 13,
      letterSpacing: 0.6,
      marginTop: 18,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16 },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    rowLabel: {
      color: colors.text,
      fontFamily: fonts.semibold,
      fontSize: type.body,
    },
    rowHint: {
      color: colors.textFaint,
      fontFamily: fonts.regular,
      fontSize: 13,
      marginTop: 2,
    },
    button: {
      marginTop: 12,
      minHeight: 50,
      borderRadius: 999,
      backgroundColor: colors.buttonBg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    buttonPrimary: { backgroundColor: colors.primary },
    buttonText: {
      color: colors.text,
      fontFamily: fonts.semibold,
      fontSize: type.body,
    },
    buttonPrimaryText: { color: colors.onPrimary, fontFamily: fonts.extrabold },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 999,
      padding: 4,
    },
    segBtn: {
      flex: 1,
      height: 42,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segBtnOn: { backgroundColor: colors.buttonBg },
    segText: {
      color: colors.textDim,
      fontFamily: fonts.semibold,
      fontSize: 15,
    },
    segTextOn: { color: colors.text, fontFamily: fonts.bold },
    topic: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 10,
    },
    topicTitle: {
      color: colors.text,
      fontFamily: fonts.bold,
      fontSize: type.body,
    },
    topicDesc: {
      color: colors.textDim,
      fontFamily: fonts.regular,
      fontSize: type.small,
      marginTop: 1,
    },
    chevron: {
      color: colors.textFaint,
      fontFamily: fonts.regular,
      fontSize: 22,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
    },
    linkDetail: {
      color: colors.textDim,
      fontFamily: fonts.regular,
      fontSize: 15,
    },
  }),
);
