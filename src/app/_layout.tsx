import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';

import { DB_NAME, migrate } from '../data/db';
import { NightStoreProvider } from '../data/NightStore';
import { colors } from '../theme/night';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <SQLiteProvider databaseName={DB_NAME} onInit={migrate}>
        <NightStoreProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
        </NightStoreProvider>
      </SQLiteProvider>
    </View>
  );
}
