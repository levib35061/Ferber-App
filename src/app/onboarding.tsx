/**
 * First launch: what Ferber is (3 cards + pediatrician note), the baby's name
 * and birth date (under 6 months warns but doesn't block), then why
 * notifications matter, before iOS asks for permission.
 */
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BigButton } from '../components/BigButton';
import { MoonIcon } from '../components/Moonlight';
import { useNightStore } from '../data/NightStore';
import { requestNotificationPermission } from '../data/notifications';
import { ageInMonths, localDateString } from '../lib/time';
import { colors, fonts, type } from '../theme/night';

const INTRO = [
  {
    title: 'Learning to fall asleep',
    body:
      'The Ferber method helps your baby learn to fall asleep on their own. You put them down drowsy but awake, say goodnight, and leave the room.',
  },
  {
    title: 'Short, calm check-ins',
    body:
      "If they cry, you wait a set number of minutes, then go in briefly: a pat and a few soft words, without picking them up. Then you leave again. The waits get a little longer each time, and each night.",
  },
  {
    title: 'This app keeps time for you',
    body:
      "It tells you when to go in, even with your phone locked, and logs every night so you can see crying time drop. Most of all, it helps you stay consistent.",
    note: "Sleep training is meant for babies about 6 months and older. This app isn't medical advice. Please check with your pediatrician before you start.",
  },
];

const STEPS = INTRO.length + 2; // intro cards, baby, notifications

export default function OnboardingScreen() {
  const { baby, saveBaby, updateSetting } = useNightStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(baby?.name ?? '');
  const [birth, setBirth] = useState<Date | null>(baby?.birthDate ? new Date(`${baby.birthDate}T12:00:00`) : null);

  const finish = async () => {
    await updateSetting('onboarded', true);
    router.replace('/');
  };

  const saveBabyAndNext = async () => {
    if (baby) {
      await saveBaby({ ...baby, name: name.trim(), birthDate: birth ? localDateString(birth) : baby.birthDate });
    }
    setStep(step + 1);
  };

  const months = birth ? ageInMonths(localDateString(birth)) : null;
  const isIntro = step < INTRO.length;
  const isBaby = step === INTRO.length;

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.topRow}>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} hitSlop={12} accessibilityRole="button">
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <View style={styles.dots} accessibilityLabel={`Step ${step + 1} of ${STEPS}`}>
            {Array.from({ length: STEPS }, (_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {isIntro && (
            <>
              <MoonIcon size={56} color={colors.primary} />
              <Text style={styles.title}>{INTRO[step].title}</Text>
              <Text style={styles.text}>{INTRO[step].body}</Text>
              {INTRO[step].note && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{INTRO[step].note}</Text>
                </View>
              )}
            </>
          )}

          {isBaby && (
            <>
              <Text style={styles.title}>Who are we helping sleep?</Text>
              <Text style={styles.fieldLabel}>Baby&apos;s name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={colors.textFaint}
                autoCapitalize="words"
                returnKeyType="done"
                style={styles.input}
              />
              <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Birth date</Text>
              <DateTimePicker
                value={birth ?? new Date()}
                mode="date"
                display="spinner"
                themeVariant="dark"
                textColor={colors.text}
                maximumDate={new Date()}
                onChange={(_, d) => d && setBirth(d)}
                style={{ alignSelf: 'stretch' }}
              />
              {months != null && (
                <Text style={styles.age}>
                  {months} month{months === 1 ? '' : 's'} old
                </Text>
              )}
              {months != null && months < 6 && (
                <View style={[styles.noteBox, styles.warnBox]}>
                  <Text style={styles.warnText}>
                    Sleep training is usually recommended from about 6 months. Please talk to your pediatrician before
                    starting. You can still use the app.
                  </Text>
                </View>
              )}
            </>
          )}

          {step === STEPS - 1 && (
            <>
              <BellIcon />
              <Text style={styles.title}>Alerts on the lock screen</Text>
              <Text style={styles.text}>
                The check-in alert is the most important part of this app. It needs notification permission to reach you
                with your phone locked.
              </Text>
              <Text style={styles.text}>
                If you use a Sleep or Do Not Disturb Focus at night, allow this app&apos;s time-sensitive alerts when iOS
                asks, so check-ins still come through. Alerts use a soft sound, or vibrate only if you turn sound off in
                Settings.
              </Text>
            </>
          )}
        </ScrollView>

        <View style={styles.bottom}>
          {isIntro && <BigButton label={step === INTRO.length - 1 ? 'Got it' : 'Next'} onPress={() => setStep(step + 1)} />}
          {isBaby && <BigButton label="Next" onPress={saveBabyAndNext} />}
          {step === STEPS - 1 && (
            <>
              <BigButton
                label="Turn on alerts"
                onPress={async () => {
                  await requestNotificationPermission().catch(() => false);
                  await finish();
                }}
              />
              <BigButton label="Not now" variant="link" onPress={finish} style={{ marginTop: 6 }} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BellIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  topRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: colors.primary, fontFamily: fonts.bold, fontSize: type.body },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.dotEmpty },
  dotOn: { backgroundColor: colors.primary, width: 20 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24, gap: 16 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 30, lineHeight: 38 },
  text: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 19, lineHeight: 28 },
  noteBox: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginTop: 8 },
  noteText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23 },
  warnBox: { backgroundColor: '#2A1A1A' },
  warnText: { color: colors.accentText, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23 },
  fieldLabel: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 14, marginBottom: -8 },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 16,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  age: { color: colors.text, fontFamily: fonts.bold, fontSize: type.body, textAlign: 'center' },
  bottom: { paddingBottom: 12, paddingTop: 8 },
});
