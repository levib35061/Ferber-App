import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';

import { DB_NAME, migrate } from '../data/db';
import { NightStoreProvider } from '../data/NightStore';
import { ThemeProvider, useTheme } from '../theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <ThemeProvider>
      <Frame ready={fontsLoaded || !!fontError} />
    </ThemeProvider>
  );
}

/** Background and status bar follow the theme: Moonlight at night, Peach & plum by day. */
function Frame({ ready }: { ready: boolean }) {
  const { colors, scheme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {/* Stay on the plain background (no white flash) until the fonts are ready. */}
      {ready && (
        <SQLiteProvider databaseName={DB_NAME} onInit={migrate}>
          <NightStoreProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
          </NightStoreProvider>
        </SQLiteProvider>
      )}
    </View>
  );
}
