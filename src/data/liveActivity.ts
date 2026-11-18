/**
 * Starts, updates and ends the lock-screen Live Activity (src/widgets/NightActivity.tsx)
 * so it always matches the night state. Its buttons open the app (src/app/la.tsx).
 *
 * Best effort: Live Activities can be turned off by the user, need iOS 16.2+,
 * and don't exist in Expo Go. The scheduled check-in notification stays the
 * real alarm; this is only a convenience.
 */
import { Platform } from 'react-native';

import { ActivityPlan, NightActivityProps, sameActivity } from '../lib/liveActivity';

type Widgets = typeof import('expo-widgets');
type Factory = import('expo-widgets').LiveActivityFactory<NightActivityProps>;

let mod: { widgets: Widgets; activity: Factory } | null | undefined;
function load() {
  if (mod !== undefined) return mod;
  try {
    if (Platform.OS !== 'ios') throw new Error('iOS only');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const widgets: Widgets = require('expo-widgets');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const activity: Factory = require('../widgets/NightActivity').default;
    mod = { widgets, activity };
  } catch {
    mod = null; // Expo Go, or no native module
  }
  return mod;
}

let shown: NightActivityProps | null = null;
let queue = Promise.resolve();

/** Make the Live Activity match `plan` (null ends it). Calls are serialised. */
export function reconcileLiveActivity(plan: ActivityPlan | null): Promise<void> {
  queue = queue.then(() => apply(plan)).catch(() => {});
  return queue;
}

async function apply(plan: ActivityPlan | null) {
  const m = load();
  if (!m) return;
  const running = m.activity.getInstances();
  if (!plan) {
    shown = null;
    await Promise.all(running.map((a) => a.end('immediate').catch(() => {})));
    return;
  }
  const stale = plan.staleAt != null ? new Date(plan.staleAt) : undefined;
  if (running.length === 0) {
    m.activity.start(plan.props, 'checkin://', stale);
    shown = plan.props;
    return;
  }
  // Keep one; end any extras (e.g. left over from a crash).
  await Promise.all(running.slice(1).map((a) => a.end('immediate').catch(() => {})));
  if (sameActivity(shown, plan.props)) return;
  await running[0].update(plan.props, stale);
  shown = plan.props;
}
