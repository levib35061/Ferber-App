/**
 * Settings: baby, training round, interval chart editor, alerts, about.
 * Milestone 3 adds partner invite and purchases.
 */
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChartEditor } from '../../components/ChartEditor';
import { PartnerSection } from '../../components/PartnerSection';
import { eraseAllNights, loadSampleNights } from '../../data/db';
import { useNightStore } from '../../data/NightStore';
import { notificationPermission, requestNotificationPermission, sendTestNotification } from '../../data/notifications';
import { buildSampleWeek } from '../../lib/sampleWeek';
import { ageInMonths, localDateString, nightKey } from '../../lib/time';
import { colors, fonts, type } from '../../theme/night';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { settings, updateSetting, baby, saveBaby, night, nightNumber, reload } = useNightStore();
  const [perm, setPerm] = useState<string>('…');
  const [testSent, setTestSent] = useState(false);
  const [name, setName] = useState(baby?.name ?? '');

  useEffect(() => {
    notificationPermission().then(setPerm);
  }, []);

  if (!baby) return <View style={styles.root} />;

  const roundStart = baby.trainingStartDate
    ? new Date(`${baby.trainingStartDate}T12:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric' })
    : null;

  const startNewRound = () => {
    Alert.alert(
      'Start a new training round?',
      'Night numbers start again at 1 from tonight, and Progress shows only the new round. Your history is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start new round',
          onPress: () => {
            // If tonight is already logged, the new round starts tomorrow evening.
            const start = night ? nightKey(Date.now() + 24 * 3600_000) : nightKey(Date.now());
            saveBaby({ ...baby, trainingStartDate: start });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Settings</Text>

          <Section title="Baby">
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              onEndEditing={() => name.trim() !== baby.name && saveBaby({ ...baby, name: name.trim() })}
              placeholder="Baby's name"
              placeholderTextColor={colors.textFaint}
              returnKeyType="done"
              autoCapitalize="words"
              style={styles.input}
            />
            {baby.birthDate && (
              <Text style={styles.hint}>
                Born {new Date(`${baby.birthDate}T12:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} ·{' '}
                {ageInMonths(baby.birthDate)} months old
              </Text>
            )}
          </Section>

          <Section title="Partner sharing">
            <PartnerSection />
          </Section>

          <Section title="Training round">
            <Text style={styles.body}>
              {roundStart ? `This round started ${roundStart}.` : 'First round.'} Tonight is night {nightNumber}.
            </Text>
            <Button label="Start a new training round" onPress={startNewRound} />
          </Section>

          <Section title="Interval chart">
            <ChartEditor
              preset={baby.chartPreset}
              customChart={baby.customChart}
              onChange={(chartPreset, customChart) => saveBaby({ ...baby, chartPreset, customChart })}
            />
          </Section>

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

          {__DEV__ && (
            <Section title="Testing (development only)">
              <Text style={styles.hint}>
                Not shown in the App Store version. Loading the sample week replaces everything in History.
              </Text>
              <Button
                label="Load a sample week"
                onPress={() =>
                  Alert.alert('Load a sample week?', 'This erases all logged nights and adds 7 sample nights ending last night.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Load sample week',
                      style: 'destructive',
                      onPress: async () => {
                        const [y, m, d] = nightKey(Date.now()).split('-').map(Number);
                        const lastNight = localDateString(new Date(y, m - 1, d - 1, 12));
                        await loadSampleNights(db, baby, buildSampleWeek(lastNight));
                        await reload();
                      },
                    },
                  ])
                }
              />
              <Button
                label="Erase all nights"
                onPress={() =>
                  Alert.alert('Erase all nights?', 'Every logged night is deleted. Baby name, chart and settings are kept.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Erase',
                      style: 'destructive',
                      onPress: async () => {
                        await eraseAllNights(db);
                        await saveBaby({ ...baby, trainingStartDate: null });
                      },
                    },
                  ])
                }
              />
            </Section>
          )}

          <Section title="About">
            <Text style={styles.body}>
              This app is not medical advice. Sleep training is meant for babies about 6 months and older. Talk to
              your pediatrician before you start.
            </Text>
            <Button
              label="Show the intro again"
              onPress={async () => {
                await updateSetting('onboarded', false);
                router.replace('/onboarding');
              }}
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
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
  section: { marginBottom: 20, backgroundColor: colors.surface, borderRadius: 22, padding: 16 },
  sectionTitle: { color: colors.textDim, fontSize: 13, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  body: { color: colors.text, fontFamily: fonts.regular, fontSize: type.body, lineHeight: 23 },
  hint: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: type.small, marginTop: 4 },
  fieldLabel: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 13, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 14,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: type.body,
  },
  button: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.buttonBg,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontSize: type.body, fontFamily: fonts.semibold },
});
