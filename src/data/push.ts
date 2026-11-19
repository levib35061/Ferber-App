/**
 * Partner alerts: register this phone's Expo push token with Supabase, so the
 * partner-push Edge Function can nudge it. Needs a development/App Store build
 * with an EAS project id; in Expo Go (no project id yet) this quietly does nothing.
 *
 * Registered even when alerts aren't allowed: iOS gives a push token without
 * permission, and the silent pushes (sync + reschedule this phone's alert) still
 * arrive. Only the visible lines ("Baby is asleep") need permission.
 */
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from './supabase';

export async function registerPushToken(): Promise<boolean> {
  const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
  if (!projectId) return false;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  const { error } = await supabase.rpc('register_push_token', { t: token, p: 'ios' });
  return !error;
}
