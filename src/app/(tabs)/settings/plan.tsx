/** Settings → Sleep plan: interval chart (presets / custom) and training rounds. */
import React from 'react';
import { Alert, Text, View } from 'react-native';

import { ChartEditor } from '../../../components/ChartEditor';
import { Card, SectionLabel, SettingsButton, SettingsPage, settingsStyles as s } from '../../../components/SettingsUI';
import { useNightStore } from '../../../data/NightStore';
import { nightKey } from '../../../lib/time';
import { colors } from '../../../theme/night';

export default function PlanSettings() {
  const { baby, saveBaby, night, nightNumber } = useNightStore();
  if (!baby) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const roundStart = baby.trainingStartDate
    ? new Date(`${baby.trainingStartDate}T12:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric' })
    : null;

  const startNewRound = () =>
    Alert.alert(
      'Start a new training round?',
      'Night numbers start again at 1 from tonight, and Progress shows only the new round. Your history is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start new round',
          // If tonight is already logged, the new round starts tomorrow evening.
          onPress: () => saveBaby({ ...baby, trainingStartDate: night ? nightKey(Date.now() + 24 * 3600_000) : nightKey(Date.now()) }),
        },
      ],
    );

  return (
    <SettingsPage title="Sleep plan">
      <SectionLabel>Interval chart</SectionLabel>
      <Card>
        <ChartEditor
          preset={baby.chartPreset}
          customChart={baby.customChart}
          onChange={(chartPreset, customChart) => saveBaby({ ...baby, chartPreset, customChart })}
        />
      </Card>

      <SectionLabel>Training round</SectionLabel>
      <Card>
        <Text style={s.body}>
          {roundStart ? `This round started ${roundStart}.` : 'First round.'} Tonight is night {nightNumber}.
        </Text>
        <Text style={s.hint}>Starting again later, or with a new baby? A new round restarts night numbers at 1 and keeps your history.</Text>
        <SettingsButton label="Start a new training round" onPress={startNewRound} />
      </Card>
    </SettingsPage>
  );
}
