/**
 * Local check-in notifications. The one thing the app cannot get wrong:
 * the alert must fire with the phone locked and the app closed. So the alert
 * is always a scheduled OS notification, never a JS timer.
 *
 * There is at most one pending check-in alert. After every change to the
 * event log we "reconcile": cancel it and, if a wait is running, schedule a
 * fresh one for the wait's end. This covers Asleep, Going in now, Undo and edits.
 */
import * as Notifications from 'expo-notifications';

import { alertPlan, type AlertKind } from '../lib/alertPlan';
import type { NightState } from '../lib/session';

const CHECKIN_ID = 'ferber-checkin';
const REPEAT_ID = 'ferber-checkin-repeat';
const IDS: Record<AlertKind, string> = { checkin: CHECKIN_ID, repeat: REPEAT_ID };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function notificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  const p = await Notifications.getPermissionsAsync();
  return p.status as 'granted' | 'denied' | 'undetermined';
}

export async function requestNotificationPermission(): Promise<boolean> {
  const p = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return p.granted;
}

function content(checkInNumber: number, nightNumber: number, sound: boolean): Notifications.NotificationContentInput {
  return {
    title: 'Time to check in',
    body: `Time to check in (#${checkInNumber}, night ${nightNumber})`,
    // Default system sound for now; a short soft custom sound can be bundled later
    // via the expo-notifications config plugin `sounds` option (needs a dev build).
    sound: sound ? 'default' : false,
    // Breaks through Focus/Sleep if the user allows it. Requires the
    // time-sensitive entitlement (set in app.json) — only in EAS builds, not Expo Go.
    interruptionLevel: 'timeSensitive',
  };
}

export async function cancelCheckInAlert(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(CHECKIN_ID);
  await Notifications.cancelScheduledNotificationAsync(REPEAT_ID);
}

/** Make the scheduled alerts match the current state. Safe to call any time. */
export async function reconcileCheckInAlert(
  state: NightState,
  nightNumber: number,
  opts: { sound: boolean },
  now: number = Date.now(),
): Promise<void> {
  const plan = alertPlan(state);
  let pending: string[] | null = null;
  for (const kind of ['checkin', 'repeat'] as const) {
    const id = IDS[kind];
    const want = plan.find((a) => a.kind === kind);
    // Within a couple of seconds of an alert, never cancel it: iOS can't schedule a
    // date that has (almost) passed, so a re-sync right then would lose the alert.
    // Only while it's still ahead: once it has fired it isn't pending any more, and
    // scheduling it again would ring twice.
    if (want && want.at > Date.now() && want.at - Date.now() < 2000) {
      pending ??= (await Notifications.getAllScheduledNotificationsAsync()).map((p) => p.identifier);
      if (pending.includes(id)) continue;
      await Notifications.cancelScheduledNotificationAsync(id);
      await schedule(id, alertContent(kind, want.checkInNumber, nightNumber, opts.sound), Date.now() + 2000);
      continue;
    }
    await Notifications.cancelScheduledNotificationAsync(id);
    if (!want || want.at <= now) continue;
    await schedule(id, alertContent(kind, want.checkInNumber, nightNumber, opts.sound), want.at);
  }
}

function alertContent(kind: AlertKind, checkInNumber: number, nightNumber: number, sound: boolean) {
  const c = content(checkInNumber, nightNumber, sound);
  if (kind === 'checkin') return c;
  return { ...c, title: 'Still time to check in', body: `Check-in #${checkInNumber} is waiting (night ${nightNumber})` };
}

function schedule(id: string, c: Notifications.NotificationContentInput, at: number) {
  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: c,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
  });
}

/** Settings "Test notification" button: fires in 5 seconds so you can lock the phone. */
export async function sendTestNotification(sound: boolean): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { ...content(1, 1, sound), body: 'Test alert — this is what a check-in looks like.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  });
}
