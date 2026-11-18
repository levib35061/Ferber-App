/**
 * Opened by the lock-screen Live Activity's buttons: checkin://la?action=<event>.
 * Logs that step if it's allowed right now (the state may have moved on, e.g. a
 * partner tapped first), then shows the night screen.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useNightStore } from '../data/NightStore';
import { actionForTarget } from '../lib/liveActivity';
import { allowedActions } from '../lib/session';

export default function LiveActivityLink() {
  const { action } = useLocalSearchParams<{ action?: string }>();
  const { ready, stateAt, tap } = useNightStore();
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    const a = actionForTarget(action);
    const run = a && allowedActions(stateAt(Date.now())).includes(a) ? tap(a) : Promise.resolve();
    run.finally(() => router.replace('/'));
  }, [ready, action, stateAt, tap]);

  return <View style={{ flex: 1, backgroundColor: '#0A0918' }} />;
}
