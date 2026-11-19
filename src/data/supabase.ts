// Older versions kept the login in app storage; it's moved into the Keychain on first read.
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config';

/**
 * The login session lives in the iOS Keychain. Readable after the first unlock
 * since restart (so a background sync can run with the phone locked), and never
 * copied to another device: a new phone signs in again.
 */
const KEYCHAIN = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

const keychainStorage = {
  async getItem(key: string): Promise<string | null> {
    const value = await SecureStore.getItemAsync(key, KEYCHAIN);
    if (value != null) return value;
    // One-time move from the old storage.
    const legacy = globalThis.localStorage?.getItem(key) ?? null;
    if (legacy != null) {
      await SecureStore.setItemAsync(key, legacy, KEYCHAIN);
      globalThis.localStorage?.removeItem(key);
    }
    return legacy;
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, KEYCHAIN);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key, KEYCHAIN);
    globalThis.localStorage?.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: keychainStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresh the session only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** Thrown when there's no account yet and none should be made here (e.g. a background sync). */
export class NeedsSignInError extends Error {
  constructor() {
    super('Not signed in.');
    this.name = 'NeedsSignInError';
  }
}

/**
 * The signed-in user's id. Sign in with Apple is optional: with
 * `{ create: true }` (starting or joining partner sharing) a phone with no
 * account gets a private anonymous one, which can be upgraded to Apple later
 * (see appleAuth.ts). Other callers never create accounts.
 */
export async function ensureUserId(opts: { create?: boolean } = {}): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  if (!opts.create) throw new NeedsSignInError();
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error || !anon.user) throw new Error(error?.message ?? "Couldn't connect. Check your signal and try again.");
  return anon.user.id;
}

/** 'apple', 'anonymous' (older test accounts) or null when signed out. */
export async function accountKind(): Promise<'apple' | 'anonymous' | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  return user.is_anonymous ? 'anonymous' : 'apple';
}
