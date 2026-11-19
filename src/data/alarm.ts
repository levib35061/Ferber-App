/**
 * Re-check tonight's check-in alert straight from storage. Used when the app's
 * screens aren't running (a silent push woke it in the background). The
 * on-screen store does the same in its reload().
 */
import { activityFor } from '../lib/liveActivity';
import { reconcileLiveActivity } from './liveActivity';
import type { SQLiteDatabase } from 'expo-sqlite';

import { chartForPreset } from '../lib/ferber';
import { type FamilyView, alertsHere } from '../lib/duty';
import { NightState, deriveNightState } from '../lib/session';
import { nightKey } from '../lib/time';
import { getNightForKey, getOrCreateBaby, getSettings, listEvents } from './db';
import { reconcileCheckInAlert } from './notifications';

export async function reconcileAlarmFromDb(
  db: SQLiteDatabase,
  who: FamilyView,
): Promise<void> {
  const baby = await getOrCreateBaby(db);
  const settings = await getSettings(db);
  const night = await getNightForKey(db, baby.id, nightKey(Date.now()));
  const events = night ? await listEvents(db, night.id) : [];
  const chart = chartForPreset(baby.chartPreset, baby.customChart);
  const full: NightState = night ? deriveNightState(events, chart, night.chartNight, Date.now()) : { kind: 'idle' };
  const state: NightState = alertsHere(night?.onDuty, who, events, full) ? full : { kind: 'idle' };
  await reconcileCheckInAlert(state, night?.nightNumber ?? 1, { sound: settings.sound });
  // The lock-screen card too (a partner's tap while this app is closed). Updating and ending work in the background.
  await reconcileLiveActivity(activityFor(state));
}
