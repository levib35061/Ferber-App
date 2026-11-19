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
import {
  Action,
  NightEvent,
  NightState,
  UNDO_WINDOW_MS,
  allowedActions,
  deriveNightState,
  inProgress,
  liveEvents,
} from '../lib/session';
import { activityFor } from '../lib/liveActivity';
import { Duty, alertsHere, dutyHere, isShared, partnerId } from '../lib/duty';
import { nightKey } from '../lib/time';
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
  softDeleteIfLatest,
} from './db';
import {
  cancelCheckInAlert,
  notificationPermission,
  reconcileCheckInAlert,
  requestNotificationPermission,
} from './notifications';
import { onUnlockChange, ownsUnlock, startPurchases, waitForUnlockStatus } from './purchases';
import { DEMO_TOOLS } from '../config';
import { SyncEngine, SyncStatus } from './sync';
import { reconcileLiveActivity } from './liveActivity';
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
  /** This phone gets tonight's alerts and buzzes (lib/duty alertsHere: the only place that decides) */
  alertsHere: boolean;
  /** "Up for the day" was tapped too soon (before 11am): take it back and return to the night. Null when not possible. */
  notUpYet: (() => Promise<void>) | null;
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
  /** 'me', 'partner' (the other member of a two-person family), or a member's user id */
  setDuty: (who: 'me' | 'partner' | { userId: string }) => Promise<void>;
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
  // "Repeat last night's intervals" belongs to one night: a choice made for tonight never carries into tomorrow.
  const [repeatChoice, setRepeatChoice] = useState<{ key: string; on: boolean } | null>(null);
  const [lastTap, setLastTap] = useState<LastTap | null>(null);
  const [bedtimeEarlyAt, setBedtimeEarlyAt] = useState<number | null>(null);
  const [nightsUsed, setNightsUsed] = useState(0);
  const clockMode = useClockMode();
  const tick = useNow(30_000);
  const repeatLastNight = repeatChoice?.key === nightKey(tick) ? repeatChoice.on : false;
  const setRepeat = useCallback((on: boolean) => setRepeatChoice({ key: nightKey(Date.now()), on }), []);
  const busy = useRef(false);
  // A sleepy double-tap must not hit the button that replaces the first one ("I'm going in" then "Back out").
  const lastTapAt = useRef(0);
  const reloadGen = useRef(0);
  const alertChain = useRef<Promise<void>>(Promise.resolve());
  const [sync] = useState(() => new SyncEngine(db));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => sync.getStatus());
  // Unlocked when this phone bought it (RevenueCat's verified customer info), when the
  // server says someone in the family did (written only by the RevenueCat webhook), or
  // in development via the Testing toggle.
  const [purchased, setPurchased] = useState(ownsUnlock);
  useEffect(() => {
    startPurchases();
    return onUnlockChange(setPurchased);
  }, []);
  // The test toggle only counts where it can be seen (development and screenshot builds).
  const unlocked = ((__DEV__ || DEMO_TOOLS) && settings.devUnlocked) || purchased || syncStatus.unlocked === true;

  const chart = useMemo(() => chartForPreset(baby?.chartPreset ?? 'ferber', baby?.customChart), [baby]);
  const planned = plannedNumbers(prevNight, repeatLastNight);
  const nightNumber = night?.nightNumber ?? planned.nightNumber;
  const chartNight = night?.chartNight ?? planned.chartNight;

  /** Re-read everything for the current night and re-sync the alert. */
  const reload = useCallback(async () => {
    // Several reloads can overlap (a tap, a partner's sync, coming to the foreground):
    // only the newest one may update the screen and the alert.
    const gen = ++reloadGen.current;
    const b = await getOrCreateBaby(db);
    const s = await getSettings(db);
    const key = nightKey(Date.now());
    const n = await getNightForKey(db, b.id, key);
    const p = await getPreviousNight(db, b.id, key, b.trainingStartDate);
    const evs = n ? await listEvents(db, n.id) : [];
    const used = await countNightsUsed(db);
    if (gen !== reloadGen.current) return;
    setNightsUsed(used);
    setBaby(b);
    setSettings(s);
    setNight(n);
    setPrevNight(p);
    setEvents(evs);
    if (n) setRepeat(p != null && n.chartNight === p.chartNight);

    const c = chartForPreset(b.chartPreset, b.customChart);
    const nn = n ?? null;
    const st = sync.getStatus();
    const full: NightState = nn ? deriveNightState(evs, c, nn.chartNight, Date.now()) : { kind: 'idle' };
    // Off duty: no scheduled alert on this phone (the on-duty phone has it), unless this
    // phone tapped the step that started the running wait (lib/duty alertsHere).
    const state = alertsHere(nn?.onDuty, st, evs, full) ? full : ({ kind: 'idle' } as NightState);
    // One alert re-sync at a time, in order; a superseded one is skipped.
    const next = alertChain.current.then(() =>
      gen === reloadGen.current
        ? reconcileCheckInAlert(state, nn?.nightNumber ?? 1, { sound: s.sound }).catch(() => {})
        : undefined,
    );
    alertChain.current = next;
    await next;
    setReady(true);
  }, [db, setRepeat, sync]);

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
      if (Date.now() - lastTapAt.current < 800) return;
      busy.current = true;
      lastTapAt.current = Date.now();
      try {
        haptic();
        const now = Date.now();
        // First time a wait starts: ask for notification permission (lock-screen alerts).
        if ((action === 'down' || action === 'woke') && (await notificationPermission()) === 'undetermined') {
          await requestNotificationPermission().catch(() => false);
        }
        // The night machine decides, from storage as it is now (not what the screen last
        // showed): tonight's row for the current night key, and the taps already in it.
        // A stale screen, a partner's sync or the 11am rollover can't log a step that
        // doesn't fit (lib/session allowedActions).
        let n = await getNightForKey(db, baby.id, nightKey(now));
        const fresh = n ? liveEvents(await listEvents(db, n.id)) : [];
        const current: NightState = n ? deriveNightState(fresh, chart, n.chartNight, now) : { kind: 'idle' };
        if (!allowedActions(current).includes(action)) {
          if (__DEV__) console.warn(`[night] "${action}" isn't allowed in state "${current.kind}"; ignored`);
          await reload();
          return;
        }
        // Free trial: starting a third night opens the unlock screen instead.
        const startsNewNight = fresh.length === 0;
        if (
          needsUnlock({ unlocked, nightsUsed, startsNewNight }) &&
          needsUnlock({ unlocked: await waitForUnlockStatus(), nightsUsed, startsNewNight })
        ) {
          router.push('/unlock');
          return;
        }
        if (!n) n = await createNight(db, baby.id, now, repeatLastNight, baby.trainingStartDate);
        // A partner's phone clock can run slightly ahead: never stamp a tap before the latest
        // one already logged (within 2 minutes), or the night would read them out of order.
        const latest = fresh.reduce((m, x) => Math.max(m, x.at), 0);
        const at = latest >= now && latest - now < 2 * 60_000 ? latest + 1 : now;
        const e = await insertEvent(db, n.id, action, at, sync.userId);
        // With a partner: whoever puts the baby down is on duty, unless someone already is.
        if (action === 'down' && !n.onDuty && sync.userId && isShared(syncStatus)) {
          await setNightDuty(db, n.id, sync.userId);
        }
        setLastTap({ eventId: e.id, type: action, tappedAt: now });
        await reload();
      } finally {
        busy.current = false;
      }
    },
    [baby, chart, db, haptic, nightsUsed, reload, repeatLastNight, sync, syncStatus, unlocked],
  );

  const undo = useCallback(async () => {
    // Never while a tap is still being saved (it would undo the one before it).
    if (busy.current || !lastTap || !night || Date.now() - lastTap.tappedAt > UNDO_WINDOW_MS) return;
    busy.current = true;
    try {
      // Only the night's latest tap can be undone: if a partner has logged one since, keep both.
      if (await softDeleteIfLatest(db, night.id, lastTap.eventId)) haptic();
      setLastTap(null);
      await reload();
    } finally {
      busy.current = false;
    }
  }, [db, haptic, lastTap, night, reload]);

  const upEvent = night && nightKey(tick) === night.nightKey ? [...liveEvents(events)].reverse().find((e) => e.type === 'up') : undefined;
  const upEventId = upEvent?.id ?? null;
  const notUpYetFn = useCallback(async () => {
    if (busy.current || !upEventId) return;
    haptic();
    await softDeleteEvent(db, upEventId, Date.now());
    setLastTap(null);
    await reload();
  }, [db, haptic, reload, upEventId]);

  const setRepeatLastNight = useCallback(
    async (v: boolean) => {
      setRepeat(v);
      // If tonight already exists (e.g. after an undo), update its chart row too.
      if (night && prevNight) {
        await setNightChartNight(db, night.id, v ? prevNight.chartNight : prevNight.chartNight + 1);
        await reload();
      }
    },
    [db, night, prevNight, reload, setRepeat],
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
  const stateNow: NightState = night ? deriveNightState(events, chart, night.chartNight, tick) : { kind: 'idle' };
  const kindNow = stateNow.kind;

  // Lock-screen Live Activity: follows the night state (see lib/liveActivity).
  // Only on the phone that gets the alerts (off duty: none), and only once loaded,
  // so a cold start never ends the card that's already running.
  const activityHere = alertsHere(night?.onDuty, syncStatus, events, stateNow);
  const activity = ready && activityHere ? activityFor(stateNow) : null;
  const activityKey = JSON.stringify(activity);
  useEffect(() => {
    if (!ready) return;
    reconcileLiveActivity(activity);
  }, [ready, activityKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // A new night starts at 11am (and the morning's night ends): re-read when the key changes.
  const keyNow = nightKey(tick);
  const firstKey = useRef(keyNow);
  useEffect(() => {
    if (keyNow === firstKey.current) return;
    firstKey.current = keyNow;
    reload();
  }, [keyNow, reload]);

  const nightActive = inProgress(stateNow);
  // After "Up for the day" the night is over, even if it's before 7am.
  // Baby asleep: still night, keep it dark (in the morning too, until "Up for the day").
  const asleepNow = kindNow === 'asleep';
  const nightMode = (clockMode === 'night' && kindNow !== 'up') || nightActive || asleepNow || bedtimeEarly;

  const deleteEverything = useCallback(async () => {
    await sync.deleteAccount(); // throws if offline: nothing is wiped then
    await cancelCheckInAlert().catch(() => {});
    await wipeAllLocalData(db);
    setLastTap(null);
    setBedtimeEarlyAt(null);
    await reload();
  }, [db, reload, sync]);

  const duty = dutyHere(night?.onDuty, syncStatus);

  const setDuty = useCallback(
    async (who: 'me' | 'partner' | { userId: string }) => {
      if (!baby || !syncStatus.userId) return;
      const id =
        who === 'me'
          ? syncStatus.userId
          : who === 'partner'
            ? partnerId(syncStatus.memberIds, syncStatus.userId)
            : syncStatus.memberIds.includes(who.userId)
              ? who.userId
              : null;
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
    alertsHere: activityHere,
    notUpYet: upEventId ? notUpYetFn : null,
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
