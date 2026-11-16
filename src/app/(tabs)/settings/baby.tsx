/** Settings → Baby: name and birth date. */
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Card, SettingsPage, settingsStyles as s } from '../../../components/SettingsUI';
import { useNightStore } from '../../../data/NightStore';
import { ageInMonths, localDateString } from '../../../lib/time';
import { colors } from '../../../theme/night';

export default function BabySettings() {
  const { baby, saveBaby } = useNightStore();
  const [name, setName] = useState(baby?.name ?? '');
  if (!baby) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const months = baby.birthDate ? ageInMonths(baby.birthDate) : null;

  return (
    <SettingsPage title="Baby">
      <Card>
        <Text style={s.fieldLabel}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onEndEditing={() => name.trim() !== baby.name && saveBaby({ ...baby, name: name.trim() })}
          placeholder="Baby's name"
          placeholderTextColor={colors.textFaint}
          returnKeyType="done"
          autoCapitalize="words"
          style={s.input}
        />
        <Text style={[s.fieldLabel, { marginTop: 18 }]}>Birth date</Text>
        <DateTimePicker
          value={baby.birthDate ? new Date(`${baby.birthDate}T12:00:00`) : new Date()}
          mode="date"
          display="spinner"
          themeVariant="dark"
          textColor={colors.text}
          maximumDate={new Date()}
          onChange={(_, d) => d && saveBaby({ ...baby, birthDate: localDateString(d) })}
        />
        {months != null && (
          <Text style={[s.body, { textAlign: 'center' }]}>
            {months} month{months === 1 ? '' : 's'} old
          </Text>
        )}
        {months != null && months < 6 && (
          <Text style={[s.hint, { color: colors.accentText, textAlign: 'center' }]}>
            Sleep training is usually recommended from about 6 months. Please check with your pediatrician.
          </Text>
        )}
      </Card>
    </SettingsPage>
  );
}
