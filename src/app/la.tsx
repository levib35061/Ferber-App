/**
 * Opened by the lock-screen Live Activity's buttons: checkin://la?action=<event>.
 * Logs that step if it's allowed right now (the state may have moved on, e.g. a
 * partner tapped first), then shows the night screen.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useNightStore } from '../data/NightStore';
import { actionForTarget } from '../lib/liveActivity';
import { allowedActions } from '../lib/session';

export default function LiveActivityLink() {
  const { action } = useLocalSearchParams<{ action?: string }>();
  const { ready, stateAt, tap, reload } = useNightStore();
  const started = useRef(false);
  const done = useRef(false);
  const [fresh, setFresh] = useState(false);

  // Re-read first: a partner may have tapped while this app was in the background.
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    reload()
      .catch(() => {})
      .finally(() => setFresh(true));
  }, [ready, reload]);

  useEffect(() => {
    if (!fresh || done.current) return;
    done.current = true;
    const a = actionForTarget(action);
    const run = a && allowedActions(stateAt(Date.now())).includes(a) ? tap(a) : Promise.resolve();
    run.finally(() => router.replace('/'));
  }, [fresh, action, stateAt, tap]);

  return <View style={{ flex: 1, backgroundColor: '#0A0918' }} />;
}
