/**
 * Sign in with Apple → Supabase (native ID-token flow, no web redirect).
 * Asks Apple for no name or email: we don't need them.
 *
 * An older anonymous account is upgraded in place (linkIdentity), so its
 * family, nights and any unlock stay attached to the same user id.
 *
 * Supabase setup: Authentication → Sign In / Providers → Apple → enabled, with
 * Client IDs "com.levibrown.checkin,host.exp.Exponent" (the second is Expo Go).
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { CryptoDigestAlgorithm, digestStringAsync, randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export async function appleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync().catch(() => false);
}

/** Returns the user id, or null if the person cancelled the Apple sheet. */
export async function signInWithApple(): Promise<string | null> {
  // Replay protection: Apple gets the hash, Supabase checks the raw value.
  const rawNonce = randomUUID();
  const hashedNonce = await digestStringAsync(CryptoDigestAlgorithm.SHA256, rawNonce);

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({ requestedScopes: [], nonce: hashedNonce });
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
  if (!credential.identityToken) throw new Error('Apple did not return a sign-in token.');
  const token = credential.identityToken;

  const { data: current } = await supabase.auth.getSession();
  if (current.session?.user.is_anonymous) {
    // Upgrade the existing anonymous account, keeping its id.
    const { data, error } = await supabase.auth.linkIdentity({ provider: 'apple', token, nonce: rawNonce });
    if (!error && data.user) return data.user.id;
    // That Apple ID already belongs to another account: sign in to that one instead.
  }
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce: rawNonce });
  if (error || !data.user) throw new Error(error?.message ?? 'Sign in with Apple failed.');
  return data.user.id;
}
