/**
 * Settings → Partner sharing: invite a partner with a code, join with a
 * partner's code, see sync status.
 */
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { useNightStore } from '../data/NightStore';
import { makeStyles, useTheme } from '../theme';

function ago(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s} sec ago`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} hr ago`;
}

const pretty = (code: string) => (code.length === 8 ? `${code.slice(0, 4)} ${code.slice(4)}` : code);

export function PartnerSection() {
  const styles = stylesHook();
  const { colors } = useTheme();
  const { sync, syncStatus: st, reload } = useNightStore();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

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
            onPress={() =>
              Alert.alert(
                "Join your partner's family?",
                "This phone will show your partner's nights. Anything logged only on this phone is replaced.",
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Join', onPress: () => run(() => sync.joinFamily(code)) },
                ],
              )
            }
            style={{ marginTop: 0, paddingHorizontal: 22 }}
          />
        </View>
        {busy && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
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
      <Text style={[styles.hint, { marginTop: 14 }]}>
        {st.syncing ? 'Syncing…' : st.lastSyncedAt ? `Last synced ${ago(st.lastSyncedAt)}` : 'Not synced yet'}
        {st.error ? ' · offline, will retry' : ''}
      </Text>
      <Btn label="Sync now" onPress={() => run(() => sync.syncNow())} disabled={busy} />
      <Pressable
        onPress={() =>
          Alert.alert('Stop sharing on this phone?', 'Nights already on this phone stay here. Your partner keeps theirs.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Stop sharing', style: 'destructive', onPress: () => run(() => sync.leaveFamily()) },
          ])
        }
        style={styles.linkBtn}
        accessibilityRole="button"
      >
        <Text style={styles.linkText}>Stop sharing on this phone</Text>
      </Pressable>
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
    body: { color: colors.text, fontFamily: fonts.regular, fontSize: type.body, lineHeight: 23 },
    label: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 13, marginBottom: 6 },
    hint: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: type.small, lineHeight: 20, marginTop: 4 },
    code: { color: colors.text, fontFamily: fonts.bold, fontSize: 34, letterSpacing: 3, fontVariant: ['tabular-nums'] },
    error: { color: colors.accent, fontFamily: fonts.semibold, fontSize: type.small, marginTop: 10, lineHeight: 20 },
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
    btnText: { color: colors.text, fontFamily: fonts.semibold, fontSize: type.body },
    btnPrimaryText: { color: colors.onPrimary, fontFamily: fonts.extrabold },
    linkBtn: { alignSelf: 'flex-start', paddingVertical: 12 },
    linkText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
  }),
);
