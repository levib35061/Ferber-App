/**
 * App state for the current night: loads from SQLite, writes taps, and keeps
 * the scheduled check-in alert in sync with the event log.
 */
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { Chart, chartForPreset } from '../lib/ferber';
import { Action, NightEvent, NightState, UNDO_WINDOW_MS, deriveNightState, liveEvents } from '../lib/session';
import { Duty, alertsOnThisPhone, dutyFor, partnerId } from '../lib/duty';
import { NIGHT_ENDS_HOUR, nightKey } from '../lib/time';
import { freeNightsLeft, needsUnlock } from '../lib/trial';
import {
  Baby,
  Night,
  Settings,
  DEFAULT_SETTINGS,
  countNightsUsed,
  createNight,
  getNightForKey,
  getOrCreateBaby,
  getPreviousNight,
  getSettings,
  insertEvent,
  listEvents,
  plannedNumbers,
  setNightChartNight,
  setNightDuty,
  setSetting,
  wipeAllLocalData,
  updateBaby,
  softDeleteEvent,
} from './db';
import {
  cancelCheckInAlert,
  notificationPermission,
  reconcileCheckInAlert,
  requestNotificationPermission,
} from './notifications';
import { SyncEngine, SyncStatus } from './sync';
import { useNow } from '../components/useNow';
import { useClockMode } from '../theme';

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
  saveBaby: (baby: Baby) => Promise<void>;
  reload: () => Promise<void>;
  /** "Starting bedtime early?": show the night screen (and dark theme) during the day */
  bedtimeEarly: boolean;
  setBedtimeEarly: (on: boolean) => void;
  /** Night mode for the whole app: clock night, a night in progress, or bedtime started early */
  nightMode: boolean;
  /** Delete the account on the server (if any) and wipe this phone. */
  deleteEverything: () => Promise<void>;
  /** Free trial / unlock */
  unlocked: boolean;
  nightsUsed: number;
  freeNightsLeft: number;
  /** Partner sync */
  sync: SyncEngine;
  syncStatus: SyncStatus;
  /** Who's on duty tonight (with partner sharing) */
  duty: Duty;
  setDuty: (who: 'me' | 'partner') => Promise<void>;
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
  const [bedtimeEarlyAt, setBedtimeEarlyAt] = useState<number | null>(null);
  const [nightsUsed, setNightsUsed] = useState(0);
  const clockMode = useClockMode();
  const tick = useNow(30_000);
  const busy = useRef(false);
  const [sync] = useState(() => new SyncEngine(db));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => sync.getStatus());
  // Unlocked when the server says someone in the family bought it (written only by the
  // RevenueCat webhook), or in development via the Testing toggle.
  const unlocked = settings.devUnlocked || syncStatus.unlocked === true;

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
    const p = await getPreviousNight(db, b.id, key, b.trainingStartDate);
    const evs = n ? await listEvents(db, n.id) : [];
    setNightsUsed(await countNightsUsed(db));
    setBaby(b);
    setSettings(s);
    setNight(n);
    setPrevNight(p);
    setEvents(evs);
    if (n) setRepeat(p != null && n.chartNight === p.chartNight);

    const c = chartForPreset(b.chartPreset, b.customChart);
    const nn = n ?? null;
    const st = sync.getStatus();
    const here = alertsOnThisPhone(dutyFor(nn?.onDuty, st.userId, st.familyId != null && st.memberCount > 1));
    // Off duty: no scheduled alert on this phone (the on-duty partner's phone has it).
    const state = nn && here ? deriveNightState(evs, c, nn.chartNight, Date.now()) : ({ kind: 'idle' } as NightState);
    await reconcileCheckInAlert(state, nn?.nightNumber ?? 1, { sound: s.sound }).catch(() => {});
    setReady(true);
  }, [db, sync]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async load from SQLite
    reload();
    // Coming back from the background (or the next evening): re-read from storage.
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') reload();
    });
    return () => sub.remove();
  }, [reload]);

  // Partner's changes arrive here; re-read storage (which also re-syncs the alert).
  useEffect(() => {
    sync.setOnRemoteChange(() => void reload());
  }, [reload, sync]);

  // Sharing status or our own id changed: re-check who gets tonight's alert.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async re-read from SQLite
    if (ready) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when these change
  }, [syncStatus.userId, syncStatus.memberCount, syncStatus.familyId]);

  useEffect(() => {
    const off = sync.onStatus(setSyncStatus);
    sync.start().catch(() => {});
    return () => {
      off();
      sync.stop();
    };
  }, [sync]);

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
        // Free trial: starting a third night opens the unlock screen instead.
        const startsNewNight = !night || liveEvents(events).length === 0;
        if (needsUnlock({ unlocked, nightsUsed, startsNewNight })) {
          router.push('/unlock');
          return;
        }
        let n = night;
        if (!n) n = await createNight(db, baby.id, now, repeatLastNight, baby.trainingStartDate);
        const e = await insertEvent(db, n.id, action, now, sync.userId);
        // With a partner: whoever puts the baby down is on duty, unless someone already is.
        if (action === 'down' && !n.onDuty && sync.userId && syncStatus.memberCount > 1) {
          await setNightDuty(db, n.id, sync.userId);
        }
        setLastTap({ eventId: e.id, type: action, tappedAt: now });
        await reload();
      } finally {
        busy.current = false;
      }
    },
    [baby, db, events, haptic, night, nightsUsed, reload, repeatLastNight, sync, syncStatus.memberCount, unlocked],
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

  // Early bedtime lasts 6 hours unless cancelled ("Back to Today").
  const bedtimeEarly = bedtimeEarlyAt != null && tick - bedtimeEarlyAt < 6 * 3600_000;
  const setBedtimeEarly = useCallback((on: boolean) => setBedtimeEarlyAt(on ? Date.now() : null), []);
  const activeKinds = ['quiet', 'waiting', 'due', 'in_room', 'feeding'];
  const kindNow = night ? deriveNightState(events, chart, night.chartNight, tick).kind : 'idle';
  const nightActive = activeKinds.includes(kindNow);
  // After "Up for the day" the night is over, even if it's before 7am.
  // Tonight already started (after 11am) and baby is asleep: still night, keep it dark.
  const tonightAsleep = kindNow === 'asleep' && new Date(tick).getHours() >= NIGHT_ENDS_HOUR;
  const nightMode = (clockMode === 'night' && kindNow !== 'up') || nightActive || tonightAsleep || bedtimeEarly;

  const deleteEverything = useCallback(async () => {
    await sync.deleteAccount(); // throws if offline: nothing is wiped then
    await cancelCheckInAlert().catch(() => {});
    await wipeAllLocalData(db);
    setLastTap(null);
    setBedtimeEarlyAt(null);
    await reload();
  }, [db, reload, sync]);

  const shared = syncStatus.familyId != null && syncStatus.memberCount > 1;
  const duty = dutyFor(night?.onDuty, syncStatus.userId, shared);

  const setDuty = useCallback(
    async (who: 'me' | 'partner') => {
      if (!baby || !syncStatus.userId) return;
      const id = who === 'me' ? syncStatus.userId : partnerId(syncStatus.memberIds, syncStatus.userId);
      if (!id) return;
      haptic();
      const n = night ?? (await createNight(db, baby.id, Date.now(), repeatLastNight, baby.trainingStartDate));
      await setNightDuty(db, n.id, id);
      await reload();
    },
    [baby, db, haptic, night, reload, repeatLastNight, syncStatus.memberIds, syncStatus.userId],
  );

  const saveBaby = useCallback(
    async (b: Baby) => {
      await updateBaby(db, b);
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
    saveBaby,
    sync,
    syncStatus,
    duty,
    setDuty,
    reload,
    bedtimeEarly,
    setBedtimeEarly,
    nightMode,
    deleteEverything,
    unlocked,
    nightsUsed,
    freeNightsLeft: freeNightsLeft(nightsUsed),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
