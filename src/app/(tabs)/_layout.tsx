import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { colors } from '../../theme/night';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 15, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Night' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
