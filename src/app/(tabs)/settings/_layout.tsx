import { Stack } from 'expo-router';
import React from 'react';

import { useTheme } from '../../../theme';

/** Settings is a small stack inside its tab: the topic list, then a page per topic. */
export default function SettingsLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
