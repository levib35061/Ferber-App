/** Settings → Help & about: guide, privacy, contact, disclaimer, intro, version. */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Text } from 'react-native';

import {
  Card,
  Divider,
  LinkRow,
  SectionLabel,
  SettingsButton,
  SettingsPage,
  useSettingsStyles,
} from '../../../components/SettingsUI';
import { useNightStore } from '../../../data/NightStore';
import { useTheme } from '../../../theme';

const SITE = 'https://ferbertimer.com/';
const CONTACT = 'askcheckin@gmail.com';

export default function AboutSettings() {
  const s = useSettingsStyles();
  const { updateSetting, deleteEverything, syncStatus } = useNightStore();
  const { colors, fonts } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = () =>
    Alert.alert(
      'Delete your account and data?',
      syncStatus.familyId
        ? 'This deletes your account and everything on this phone. If your partner is still sharing, they keep the shared nights. This can’t be undone.'
        : 'This deletes everything on this phone: every night, your baby’s details and your settings. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError(null);
            try {
              await deleteEverything(); // then the app returns to onboarding
            } catch {
              setError('Couldn’t reach the server. Check your connection and try again. Nothing was deleted.');
              setDeleting(false);
            }
          },
        },
      ],
    );

  return (
    <SettingsPage title="Help & about">
      <SectionLabel>Help</SectionLabel>
      <Card style={{ paddingVertical: 4 }}>
        <LinkRow label="Help & FAQ" onPress={() => Linking.openURL(`${SITE}help.html`)} />
        <LinkRow label="How the Ferber method works" onPress={() => Linking.openURL(SITE)} />
        <Divider />
        <LinkRow label="Contact us" detail={CONTACT} onPress={() => Linking.openURL(`mailto:${CONTACT}`)} />
        <Divider />
        <LinkRow label="Privacy policy" onPress={() => Linking.openURL(`${SITE}privacy.html`)} />
      </Card>
      <SettingsButton
        label="Show the intro again"
        onPress={async () => {
          await updateSetting('onboarded', false);
          router.replace('/onboarding');
        }}
      />

      <SectionLabel>About</SectionLabel>
      <Card>
        <Text style={s.body}>
          This app is not medical advice. Sleep training is meant for healthy babies about 6 months and older. Talk to your
          pediatrician before you start.
        </Text>
        <Text style={s.hint}>Not affiliated with or endorsed by Dr. Richard Ferber.</Text>
        <Text style={s.hint}>Check In: Baby Sleep Timer · version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </Card>

      <SectionLabel>Your data</SectionLabel>
      <Card>
        <Text style={s.hint}>
          Remove your account and everything this app stores about you and your baby, on this phone and on our servers.
        </Text>
        <Pressable
          onPress={confirmDelete}
          disabled={deleting}
          accessibilityRole="button"
          style={({ pressed }) => ({ paddingVertical: 12, opacity: pressed || deleting ? 0.6 : 1 })}
        >
          {deleting ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={{ color: colors.accentText, fontFamily: fonts.bold, fontSize: 16 }}>
              Delete my account and data
            </Text>
          )}
        </Pressable>
        {error && <Text style={[s.hint, { color: colors.accentText }]}>{error}</Text>}
      </Card>
    </SettingsPage>
  );
}
