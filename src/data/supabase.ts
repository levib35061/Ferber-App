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

/** Thrown when partner sharing needs a sign-in first (Sign in with Apple). */
export class NeedsSignInError extends Error {
  constructor() {
    super('Please sign in with Apple to share with your partner.');
  }
}

/**
 * The signed-in user's id. No anonymous sign-ups any more: a new user signs in
 * with Apple (see appleAuth.ts) before turning on partner sharing. Existing
 * anonymous sessions keep working and can be upgraded to Apple.
 */
export async function ensureUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  throw new NeedsSignInError();
}

/** 'apple', 'anonymous' (older test accounts) or null when signed out. */
export async function accountKind(): Promise<'apple' | 'anonymous' | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  return user.is_anonymous ? 'anonymous' : 'apple';
}
