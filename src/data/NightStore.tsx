/**
 * App state for the current night: loads from SQLite, writes taps, and keeps
 * the scheduled check-in alert in sync with the event log.
 */
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { Chart, chartForPreset } from '../lib/ferber';
import { Action, NightEvent, NightState, UNDO_WINDOW_MS, deriveNightState, liveEvents } from '../lib/session';
import { nightKey } from '../lib/time';
import {
  Baby,
  Night,
  Settings,
  DEFAULT_SETTINGS,
  createNight,
  getNightForKey,
  getOrCreateBaby,
  getPreviousNight,
  getSettings,
  insertEvent,
  listEvents,
  plannedNumbers,
  setNightChartNight,
  setSetting,
  softDeleteEvent,
} from './db';
import { notificationPermission, reconcileCheckInAlert, requestNotificationPermission } from './notifications';

interface LastTap {
  eventId: string;
  type: Action;
  tappedAt: number;
}

interface NightStoreValue {
  ready: boolean;
  baby: Baby | null;
  chart: Chart;
  settings: Settings;
  night: Night | null;
  events: NightEvent[];
  /** Night number to show (tonight's, or what tonight will be once "Down" is tapped) */
  nightNumber: number;
  chartNight: number;
  hasPreviousNight: boolean;
  repeatLastNight: boolean;
  setRepeatLastNight: (v: boolean) => Promise<void>;
  /** Derive the state at a given time (the screen ticks `now` itself) */
  stateAt: (now: number) => NightState;
  tap: (action: Action) => Promise<void>;
  lastTap: LastTap | null;
  undo: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<NightStoreValue | null>(null);

export function useNightStore(): NightStoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNightStore must be used inside <NightStoreProvider>');
  return v;
}

export function NightStoreProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [ready, setReady] = useState(false);
  const [baby, setBaby] = useState<Baby | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [night, setNight] = useState<Night | null>(null);
  const [prevNight, setPrevNight] = useState<Night | null>(null);
  const [events, setEvents] = useState<NightEvent[]>([]);
  const [repeatLastNight, setRepeat] = useState(false);
  const [lastTap, setLastTap] = useState<LastTap | null>(null);
  const busy = useRef(false);

  const chart = useMemo(() => chartForPreset(baby?.chartPreset ?? 'ferber', baby?.customChart), [baby]);
  const planned = plannedNumbers(prevNight, repeatLastNight);
  const nightNumber = night?.nightNumber ?? planned.nightNumber;
  const chartNight = night?.chartNight ?? planned.chartNight;

  /** Re-read everything for the current night and re-sync the alert. */
  const reload = useCallback(async () => {
    const b = await getOrCreateBaby(db);
    const s = await getSettings(db);
    const key = nightKey(Date.now());
    const n = await getNightForKey(db, b.id, key);
    const p = await getPreviousNight(db, b.id, key);
    const evs = n ? await listEvents(db, n.id) : [];
    setBaby(b);
    setSettings(s);
    setNight(n);
    setPrevNight(p);
    setEvents(evs);
    if (n) setRepeat(p != null && n.chartNight === p.chartNight);

    const c = chartForPreset(b.chartPreset, b.customChart);
    const nn = n ?? null;
    const state = nn ? deriveNightState(evs, c, nn.chartNight, Date.now()) : ({ kind: 'idle' } as NightState);
    await reconcileCheckInAlert(state, nn?.nightNumber ?? 1, { sound: s.sound }).catch(() => {});
    setReady(true);
  }, [db]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async load from SQLite
    reload();
    // Coming back from the background (or the next evening): re-read from storage.
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') reload();
    });
    return () => sub.remove();
  }, [reload]);

  const haptic = useCallback(() => {
    if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [settings.haptics]);

  const tap = useCallback(
    async (action: Action) => {
      if (busy.current || !baby) return;
      busy.current = true;
      try {
        haptic();
        const now = Date.now();
        // First time a wait starts: ask for notification permission (lock-screen alerts).
        if ((action === 'down' || action === 'woke') && (await notificationPermission()) === 'undetermined') {
          await requestNotificationPermission().catch(() => false);
        }
        let n = night;
        if (!n) n = await createNight(db, baby.id, now, repeatLastNight);
        const e = await insertEvent(db, n.id, action, now);
        setLastTap({ eventId: e.id, type: action, tappedAt: now });
        await reload();
      } finally {
        busy.current = false;
      }
    },
    [baby, db, haptic, night, reload, repeatLastNight],
  );

  const undo = useCallback(async () => {
    if (!lastTap || Date.now() - lastTap.tappedAt > UNDO_WINDOW_MS) return;
    haptic();
    await softDeleteEvent(db, lastTap.eventId, Date.now());
    setLastTap(null);
    await reload();
  }, [db, haptic, lastTap, reload]);

  const setRepeatLastNight = useCallback(
    async (v: boolean) => {
      setRepeat(v);
      // If tonight already exists (e.g. after an undo), update its chart row too.
      if (night && prevNight) {
        await setNightChartNight(db, night.id, v ? prevNight.chartNight : prevNight.chartNight + 1);
        await reload();
      }
    },
    [db, night, prevNight, reload],
  );

  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]) => {
      await setSetting(db, key, value);
      await reload();
    },
    [db, reload],
  );

  const stateAt = useCallback(
    (now: number) => (night ? deriveNightState(events, chart, night.chartNight, now) : ({ kind: 'idle' } as NightState)),
    [chart, events, night],
  );

  const value: NightStoreValue = {
    ready,
    baby,
    chart,
    settings,
    night,
    events: liveEvents(events),
    nightNumber,
    chartNight,
    hasPreviousNight: prevNight != null,
    repeatLastNight,
    setRepeatLastNight,
    stateAt,
    tap,
    lastTap,
    undo,
    updateSetting,
    reload,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
