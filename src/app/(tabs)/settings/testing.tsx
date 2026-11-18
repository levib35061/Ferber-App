/** Settings → Testing (development builds only): sample week, erase nights. */
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Alert, Text, View } from 'react-native';

import { Card, SettingsButton, SettingsPage, SwitchRow, useSettingsStyles } from '../../../components/SettingsUI';
import { signInWithApple } from '../../../data/appleAuth';
import { eraseAllNights, loadSampleNights } from '../../../data/db';
import { useNightStore } from '../../../data/NightStore';
import { DEMO_TOOLS } from '../../../config';
import { buildSampleWeek } from '../../../lib/sampleWeek';
import { localDateString, nightKey } from '../../../lib/time';
import { useTheme } from '../../../theme';

export default function TestingSettings() {
  const s = useSettingsStyles();
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const { baby, saveBaby, reload, settings, updateSetting, nightsUsed } = useNightStore();
  if (!(__DEV__ || DEMO_TOOLS) || !baby) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SettingsPage title="Testing">
      <Card>
        <Text style={s.body}>Only in development. Not shown in the App Store version.</Text>
        <Text style={s.hint}>If partner sharing is on, these changes sync to your partner too.</Text>
        <SwitchRow
          label="Pretend it's unlocked"
          hint={`Skips the free-trial limit (${nightsUsed} night${nightsUsed === 1 ? '' : 's'} logged so far)`}
          value={settings.devUnlocked}
          onChange={(v) => updateSetting('devUnlocked', v)}
        />
        <SettingsButton
          label="Sign in with Apple again"
          onPress={() =>
            // Same Apple ID → same account; sends a fresh code to the server (apple-token).
            signInWithApple()
              .then((id) => id && Alert.alert('Signed in', 'Same account. The server got a fresh Apple code.'))
              .catch((e) => Alert.alert('Sign in failed', String(e?.message ?? e)))
          }
        />
        <SettingsButton
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
        <SettingsButton
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
      </Card>
    </SettingsPage>
  );
}
