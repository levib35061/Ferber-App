/**
 * Settings (Milestone 1 subset). Milestone 2 adds the chart editor and presets;
 * Milestone 3 adds partner invite and purchases.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNightStore } from '../../data/NightStore';
import { notificationPermission, requestNotificationPermission, sendTestNotification } from '../../data/notifications';
import { colors, fonts, type } from '../../theme/night';

export default function SettingsScreen() {
  const { settings, updateSetting, chart } = useNightStore();
  const [perm, setPerm] = useState<string>('…');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    notificationPermission().then(setPerm);
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Settings</Text>

        <Section title="Alerts">
          <Row label="Sound" value={settings.sound} onChange={(v) => updateSetting('sound', v)} hint="Off = vibrate only" />
          <Row label="Haptics" value={settings.haptics} onChange={(v) => updateSetting('haptics', v)} />
          <Row
            label="Keep screen on while waiting"
            value={settings.keepAwake}
            onChange={(v) => updateSetting('keepAwake', v)}
          />
          <Text style={styles.hint}>Notifications: {perm}</Text>
          {perm !== 'granted' && (
            <Button
              label="Allow notifications"
              onPress={async () => {
                await requestNotificationPermission();
                setPerm(await notificationPermission());
              }}
            />
          )}
          <Button
            label={testSent ? 'Sent — lock your phone now' : 'Send a test alert in 5 seconds'}
            onPress={async () => {
              await sendTestNotification(settings.sound);
              setTestSent(true);
              setTimeout(() => setTestSent(false), 6000);
            }}
          />
        </Section>

        <Section title="Interval chart (minutes)">
          <View style={styles.chartHeader}>
            {['Night', '1st', '2nd', '3rd+'].map((h) => (
              <Text key={h} style={[styles.cell, styles.cellHead]}>
                {h}
              </Text>
            ))}
          </View>
          {chart.map((row, i) => (
            <View key={i} style={styles.chartRow}>
              <Text style={[styles.cell, styles.cellHead]}>{i === chart.length - 1 ? `${i + 1}+` : i + 1}</Text>
              {[0, 1, 2].map((c) => (
                <Text key={c} style={styles.cell}>
                  {row[Math.min(c, row.length - 1)]}
                </Text>
              ))}
            </View>
          ))}
          <Text style={styles.hint}>Editing and presets come in Milestone 2.</Text>
        </Section>

        <Section title="About">
          <Text style={styles.body}>
            This app is not medical advice. Sleep training is meant for babies about 6 months and older. Talk to
            your pediatrician before you start.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.body}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.buttonBg }} thumbColor={colors.text} />
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]} accessibilityRole="button">
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  title: { color: colors.text, fontSize: type.huge, fontFamily: fonts.bold, marginVertical: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { color: colors.textDim, fontSize: type.small, fontFamily: fonts.bold, textTransform: 'uppercase', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  body: { color: colors.text, fontFamily: fonts.regular, fontSize: type.body, lineHeight: 23 },
  hint: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: type.small, marginTop: 4 },
  button: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.buttonBg,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontSize: type.body, fontFamily: fonts.semibold },
  chartHeader: { flexDirection: 'row', paddingBottom: 4 },
  chartRow: { flexDirection: 'row', paddingVertical: 4 },
  cell: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: type.body, fontVariant: ['tabular-nums'] },
  cellHead: { color: colors.textDim, fontFamily: fonts.semibold },
});
