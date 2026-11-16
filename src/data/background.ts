/**
 * Background push handling. The partner-push Edge Function sends a silent push
 * whenever the other parent logs something; iOS then wakes the app briefly
 * (even if it was closed) and this task syncs and fixes this phone's own
 * check-in alert: e.g. cancels it after a hand-off or after "Asleep".
 *
 * Must be defined at module scope and imported early (root layout). iOS may
 * throttle silent pushes, so this is a best effort; opening the app always
 * catches up.
 */
import * as Notifications from 'expo-notifications';
import { openDatabaseAsync } from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { AppState } from 'react-native';

import { reconcileAlarmFromDb } from './alarm';
import { DB_NAME, migrate } from './db';
import { SyncEngine } from './sync';

export const BACKGROUND_PUSH_TASK = 'checkin-background-push';

TaskManager.defineTask(BACKGROUND_PUSH_TASK, async () => {
  // In the foreground the running app already syncs via realtime.
  if (AppState.currentState === 'active') return Notifications.BackgroundNotificationTaskResult.NoData;
  try {
    const db = await openDatabaseAsync(DB_NAME);
    await migrate(db);
    const engine = new SyncEngine(db);
    const changed = await engine.backgroundSync();
    await reconcileAlarmFromDb(db, engine.getStatus());
    return changed
      ? Notifications.BackgroundNotificationTaskResult.NewData
      : Notifications.BackgroundNotificationTaskResult.NoData;
  } catch {
    return Notifications.BackgroundNotificationTaskResult.Failed;
  }
});

Notifications.registerTaskAsync(BACKGROUND_PUSH_TASK).catch(() => {});
