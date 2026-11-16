/** Settings → Night mode & alerts: alert sound, test alert, screen and haptics, permission status. */
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  Divider,
  SectionLabel,
  Segmented,
  SettingsButton,
  SettingsPage,
  SwitchRow,
  useSettingsStyles,
} from '../../../components/SettingsUI';
import { useNightStore } from '../../../data/NightStore';
import { notificationPermission, requestNotificationPermission, sendTestNotification } from '../../../data/notifications';
import { makeStyles, useTheme } from '../../../theme';

export default function AlertSettings() {
  const s = useSettingsStyles();
  const styles = stylesHook();
  const { colors } = useTheme();
  const { settings, updateSetting } = useNightStore();
  const [perm, setPerm] = useState<string>('…');
  const [testSent, setTestSent] = useState(false);

  // Re-check when coming back (e.g. from iOS Settings).
  useFocusEffect(
    useCallback(() => {
      notificationPermission().then(setPerm);
    }, []),
  );

  return (
    <SettingsPage title="Night mode & alerts">
      <SectionLabel>Check-in alert</SectionLabel>
      <Segmented
        options={[
          { key: 'sound', label: 'Soft sound' },
          { key: 'vibrate', label: 'Vibrate only' },
        ]}
        value={settings.sound ? 'sound' : 'vibrate'}
        onChange={(v) => updateSetting('sound', v === 'sound')}
      />
      <SettingsButton
        label={testSent ? 'Sent — lock your phone now' : 'Send a test alert in 5 seconds'}
        onPress={async () => {
          await sendTestNotification(settings.sound);
          setTestSent(true);
          setTimeout(() => setTestSent(false), 6000);
        }}
      />

      <SectionLabel>While waiting</SectionLabel>
      <Card style={{ paddingVertical: 8 }}>
        <SwitchRow
          label="Keep screen on"
          hint="So the countdown stays visible"
          value={settings.keepAwake}
          onChange={(v) => updateSetting('keepAwake', v)}
        />
        <Divider />
        <SwitchRow
          label="Haptics"
          hint="A tap on every button press"
          value={settings.haptics}
          onChange={(v) => updateSetting('haptics', v)}
        />
      </Card>

      <SectionLabel>Notifications</SectionLabel>
      <Card>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: perm === 'granted' ? colors.primary : colors.accent }]} />
          <Text style={styles.status}>{perm === 'granted' ? 'Notifications allowed' : 'Notifications are off'}</Text>
        </View>
        <Text style={s.hint}>
          {perm === 'granted'
            ? 'If you use a Sleep or Do Not Disturb Focus, allow this app in that Focus so check-ins come through.'
            : 'Check-in alerts can’t reach you with the phone locked until notifications are allowed.'}
        </Text>
        {perm === 'undetermined' && (
          <SettingsButton
            label="Allow notifications"
            primary
            onPress={async () => {
              await requestNotificationPermission();
              setPerm(await notificationPermission());
            }}
          />
        )}
        {perm === 'denied' && <SettingsButton label="Open iPhone Settings" primary onPress={() => Linking.openSettings()} />}
      </Card>
    </SettingsPage>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    status: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
  }),
);
