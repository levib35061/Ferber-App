import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '../../../theme/night';

/** Settings is a small stack inside its tab: the topic list, then a page per topic. */
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
