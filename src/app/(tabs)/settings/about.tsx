/** Settings → Help & about: guide, privacy, contact, disclaimer, intro, version. */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Text } from 'react-native';

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

const SITE = 'https://levib35061.github.io/Ferber-App/';
const CONTACT = 'askcheckin@gmail.com';

export default function AboutSettings() {
  const s = useSettingsStyles();
  const { updateSetting } = useNightStore();
  return (
    <SettingsPage title="Help & about">
      <SectionLabel>Help</SectionLabel>
      <Card style={{ paddingVertical: 4 }}>
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
    </SettingsPage>
  );
}
