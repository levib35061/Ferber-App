/**
 * Settings → Partner sharing: invite a partner with a code, join with a
 * partner's code, see sync status. Also used in first-launch setup
 * (`setup`), which leaves out the sync status and "stop sharing".
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { appleSignInAvailable, signInWithApple } from '../data/appleAuth';
import { useNightStore } from '../data/NightStore';
import { accountKind } from '../data/supabase';
import { makeStyles, useTheme } from '../theme';

function ago(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s} sec ago`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} hr ago`;
}

const pretty = (code: string) => (code.length === 8 ? `${code.slice(0, 4)} ${code.slice(4)}` : code);

export function PartnerSection({ setup = false, onJoined }: { setup?: boolean; onJoined?: () => void } = {}) {
  const styles = stylesHook();
  const { colors, scheme } = useTheme();
  const { sync, syncStatus: st, reload } = useNightStore();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<'apple' | 'anonymous' | null | undefined>(undefined);
  const [appleOk, setAppleOk] = useState(false);

  const refreshAccount = useCallback(() => {
    accountKind().then(setAccount);
  }, []);
  useEffect(() => {
    refreshAccount();
    appleSignInAvailable().then(setAppleOk);
  }, [refreshAccount]);

  const appleSignIn = () =>
    run(async () => {
      await signInWithApple();
      refreshAccount();
      // A signed-in phone already in a family picks up its sync again.
      sync.soon(0);
    });

  /** Apple's own button (required styling), dark or light to match the app. */
  const appleButton = (type: AppleAuthentication.AppleAuthenticationButtonType) =>
    appleOk ? (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={type}
        buttonStyle={
          scheme === 'dark'
            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={999}
        style={styles.appleBtn}
        onPress={appleSignIn}
      />
    ) : (
      <Text style={styles.hint}>Sign in with Apple isn&apos;t available on this device.</Text>
    );

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (account === undefined) return <ActivityIndicator color={colors.primary} />;

  // Sign in with Apple is optional. Without it, sharing uses a private account
  // that lives on this phone only; signing in with Apple keeps it (same family,
  // same nights) and lets you get it back after a reinstall or on a new phone.
  const upgrade =
    account !== 'apple' ? (
      <View style={{ marginTop: 22 }}>
        <Text style={styles.label}>Optional: sign in with Apple</Text>
        <Text style={styles.hint}>
          {st.familyId
            ? 'Keeps your sharing if you reinstall the app or change phones. Your family and nights stay as they are.'
            : 'Already shared from another phone, or want your sharing kept if you change phones? We don\u2019t ask Apple for your name or email.'}
        </Text>
        {appleButton(AppleAuthentication.AppleAuthenticationButtonType.CONTINUE)}
      </View>
    ) : null;

  if (!st.familyId) {
    return (
      <View>
        <Text style={styles.body}>Share nights with your partner. Both phones see every tap within seconds.</Text>
        <Btn label="Invite my partner" primary onPress={() => run(() => sync.createFamily())} disabled={busy} />

        <Text style={[styles.label, { marginTop: 22 }]}>Have a code from your partner?</Text>
        <View style={styles.joinRow}>
          <TextInput
            value={code}
            onChangeText={(t) =>
              setCode(
                t
                  .toUpperCase()
                  .replace(/[^0-9A-F]/g, '')
                  .slice(0, 8),
              )
            }
            placeholder="8-character code"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />
          <Btn
            label="Join"
            disabled={busy || code.length !== 8}
            onPress={() => {
              const join = () =>
                run(async () => {
                  await sync.joinFamily(code);
                  onJoined?.();
                });
              // Nothing is logged yet during setup, so there's nothing to warn about.
              if (setup) return join();
              Alert.alert(
                "Join your partner's family?",
                "This phone will show your partner's nights. Anything logged only on this phone is replaced.",
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Join', onPress: join },
                ],
              );
            }}
            style={{ marginTop: 0, paddingHorizontal: 22 }}
          />
        </View>
        {busy && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
        {upgrade}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  const partners = Math.max(0, st.memberCount - 1);
  return (
    <View>
      <Text style={styles.label}>Invite code</Text>
      <Text style={styles.code} selectable accessibilityLabel={`Invite code ${st.inviteCode?.split('').join(' ')}`}>
        {st.inviteCode ? pretty(st.inviteCode) : '…'}
      </Text>
      <Text style={styles.hint}>
        {partners > 0
          ? `Shared with ${partners} other phone${partners === 1 ? '' : 's'}.`
          : 'Waiting for your partner to join. On their phone: Settings → Partner sharing → enter this code.'}
      </Text>
      {st.inviteCode && (
        <Btn
          label="Send the code to my partner"
          primary
          onPress={() =>
            Share.share({
              message: `Join me on Check In so we both see the baby's nights. Open the app → Settings → Partner sharing, and enter code ${st.inviteCode}.`,
            })
          }
        />
      )}
      {!setup && (
        <>
          <Text style={[styles.hint, { marginTop: 14 }]}>
            {st.syncing ? 'Syncing…' : st.lastSyncedAt ? `Last synced ${ago(st.lastSyncedAt)}` : 'Not synced yet'}
            {st.error ? ' · offline, will retry' : ''}
          </Text>
          <Btn label="Sync now" onPress={() => run(() => sync.syncNow())} disabled={busy} />
          <Pressable
            onPress={() =>
              Alert.alert(
                'Stop sharing on this phone?',
                'Nights already on this phone stay here. Your partner keeps theirs.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Stop sharing',
                    style: 'destructive',
                    onPress: () => run(() => sync.leaveFamily()),
                  },
                ],
              )
            }
            style={styles.linkBtn}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>Stop sharing on this phone</Text>
          </Pressable>
        </>
      )}
      {upgrade}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

function Btn(props: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean; style?: object }) {
  const styles = stylesHook();
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!props.disabled }}
      style={({ pressed }) => [
        styles.btn,
        props.primary && styles.btnPrimary,
        (pressed || props.disabled) && { opacity: props.disabled ? 0.4 : 0.7 },
        props.style,
      ]}
    >
      <Text style={[styles.btnText, props.primary && styles.btnPrimaryText]}>{props.label}</Text>
    </Pressable>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    body: {
      color: colors.text,
      fontFamily: fonts.regular,
      fontSize: type.body,
      lineHeight: 23,
    },
    label: {
      color: colors.textDim,
      fontFamily: fonts.semibold,
      fontSize: 13,
      marginBottom: 6,
    },
    hint: {
      color: colors.textFaint,
      fontFamily: fonts.regular,
      fontSize: type.small,
      lineHeight: 20,
      marginTop: 4,
    },
    code: {
      color: colors.text,
      fontFamily: fonts.bold,
      fontSize: 34,
      letterSpacing: 3,
      fontVariant: ['tabular-nums'],
    },
    appleBtn: { height: 50, marginTop: 14, alignSelf: 'stretch' },
    error: {
      color: colors.accent,
      fontFamily: fonts.semibold,
      fontSize: type.small,
      marginTop: 10,
      lineHeight: 20,
    },
    joinRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    input: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.buttonBg,
      paddingHorizontal: 14,
      color: colors.text,
      fontFamily: fonts.bold,
      fontSize: 18,
      letterSpacing: 2,
    },
    btn: {
      marginTop: 12,
      minHeight: 48,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: colors.buttonBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: { backgroundColor: colors.primary },
    btnText: {
      color: colors.text,
      fontFamily: fonts.semibold,
      fontSize: type.body,
    },
    btnPrimaryText: { color: colors.onPrimary, fontFamily: fonts.extrabold },
    linkBtn: { alignSelf: 'flex-start', paddingVertical: 12 },
    linkText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
  }),
);
