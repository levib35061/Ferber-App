/**
 * Night screen — the product. Usable half-asleep with one thumb:
 * huge countdown, big buttons in the bottom third, no confirmation dialogs
 * (Undo instead), dim amber on true black.
 */
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../../components/BigButton';
import { useNow } from '../../components/useNow';
import { useNightStore } from '../../data/NightStore';
import { Action, UNDO_WINDOW_MS } from '../../lib/session';
import { summarizeNight, episodeCryingMs } from '../../lib/summary';
import { formatClock, formatDuration } from '../../lib/time';
import { colors, type } from '../../theme/night';

const ACTION_LABEL: Record<Action, string> = {
  down: 'Down',
  woke: 'Woke up',
  check_in_start: 'Going in',
  check_in_end: 'Back out',
  asleep: 'Asleep',
};

const KEEP_AWAKE_TAG = 'ferber-night';

export default function NightScreen() {
  const store = useNightStore();
  const now = useNow(250);
  const state = store.stateAt(now);

  // Keep the screen on while a wait or check-in is running (setting can turn this off).
  const awake = store.settings.keepAwake && (state.kind === 'waiting' || state.kind === 'due' || state.kind === 'in_room');
  useEffect(() => {
    if (!awake) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [awake]);

  // Check-in due: vibrate every few seconds while the app is open.
  const due = state.kind === 'due';
  useEffect(() => {
    if (!due || !store.settings.haptics) return;
    const buzz = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    buzz();
    const id = setInterval(buzz, 3000);
    return () => clearInterval(id);
  }, [due, store.settings.haptics]);

  if (!store.ready) return <View style={styles.root} />;

  const undoLeft = store.lastTap ? UNDO_WINDOW_MS - (now - store.lastTap.tappedAt) : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.nightLabel}>
          {store.baby?.name ? `${store.baby.name} · ` : ''}Night {store.nightNumber}
          {store.chartNight !== store.nightNumber ? `  (intervals of night ${store.chartNight})` : ''}
        </Text>
      </View>

      {state.kind === 'idle' && (
        <>
          <View style={styles.middle}>
            <Text style={styles.prompt}>Ready when you are.</Text>
            {store.hasPreviousNight && (
              <View style={styles.repeatRow}>
                <Text style={styles.repeatText}>{"Repeat last night's intervals"}</Text>
                <Switch
                  value={store.repeatLastNight}
                  onValueChange={store.setRepeatLastNight}
                  trackColor={{ true: colors.textDim, false: colors.border }}
                  thumbColor={colors.text}
                />
              </View>
            )}
          </View>
          <View style={styles.bottom}>
            <BigButton label="Down for the night" onPress={() => store.tap('down')} />
            <BigButton label="Night waking" variant="link" onPress={() => store.tap('woke')} style={styles.small} />
          </View>
        </>
      )}

      {state.kind === 'waiting' && (
        <>
          <View style={styles.middle}>
            <Text style={styles.caption}>Check-in #{state.checkInNumber} in</Text>
            <Text style={styles.countdown} adjustsFontSizeToFit numberOfLines={1}>
              {formatDuration(state.nextCheckInAt - now)}
            </Text>
            <Text style={styles.meta}>
              {state.waitMinutes} min wait · crying {formatDuration(now - state.episodeStartAt)}
            </Text>
          </View>
          <View style={styles.bottom}>
            <BigButton label="Asleep" onPress={() => store.tap('asleep')} />
            <BigButton label="Going in now" variant="secondary" onPress={() => store.tap('check_in_start')} style={styles.gap} />
          </View>
        </>
      )}

      {state.kind === 'due' && (
        <>
          <View style={styles.middle}>
            <Pulse>
              <Text style={[styles.caption, { color: colors.accent }]}>Time for check-in #{state.checkInNumber}</Text>
              <Text style={[styles.countdown, { color: colors.accent }]} adjustsFontSizeToFit numberOfLines={1}>
                +{formatDuration(now - state.nextCheckInAt)}
              </Text>
            </Pulse>
          </View>
          <View style={styles.bottom}>
            <BigButton label="I'm going in" variant="alert" onPress={() => store.tap('check_in_start')} />
            <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={styles.small} />
          </View>
        </>
      )}

      {state.kind === 'in_room' && (
        <>
          <View style={styles.middle}>
            <Text style={styles.caption}>In the room · check-in #{state.checkInNumber}</Text>
            <Text style={styles.elapsed}>{formatDuration(now - state.since)}</Text>
            <Text style={styles.meta}>Next wait starts when you tap Back out.</Text>
          </View>
          <View style={styles.bottom}>
            <BigButton label="Back out" onPress={() => store.tap('check_in_end')} />
            <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={styles.small} />
          </View>
        </>
      )}

      {state.kind === 'asleep' && (
        <AsleepView
          since={state.since}
          cryingMs={episodeCryingMs(state.episode)}
          checkIns={state.episode.checkIns}
          night={summarizeNight(store.events)}
          onWoke={() => store.tap('woke')}
        />
      )}

      {store.lastTap && undoLeft > 0 && (
        <Pressable style={styles.undo} onPress={store.undo} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.undoText}>
            Undo “{ACTION_LABEL[store.lastTap.type]}” · {Math.ceil(undoLeft / 1000)}s
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function AsleepView(props: {
  since: number;
  cryingMs: number;
  checkIns: number;
  night: ReturnType<typeof summarizeNight>;
  onWoke: () => void;
}) {
  const { night } = props;
  return (
    <>
      <View style={styles.middle}>
        <Text style={styles.caption}>Asleep since {formatClock(props.since)}</Text>
        <Text style={styles.summaryBig}>{Math.round(props.cryingMs / 60_000)} min</Text>
        <Text style={styles.meta}>
          crying this time · {props.checkIns} check-in{props.checkIns === 1 ? '' : 's'}
        </Text>
        {night.episodeCount > 1 && (
          <Text style={[styles.meta, { marginTop: 16 }]}>
            Tonight: {night.cryingMinutes} min · {night.checkIns} check-ins · {night.wakings} waking
            {night.wakings === 1 ? '' : 's'}
          </Text>
        )}
      </View>
      <View style={styles.bottom}>
        <BigButton label="Woke up" variant="secondary" onPress={props.onWoke} />
      </View>
    </>
  );
}

function Pulse({ children }: { children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={{ opacity: v, alignItems: 'center' }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  header: { paddingTop: 12, alignItems: 'center' },
  nightLabel: { color: colors.textDim, fontSize: type.body, fontWeight: '600' },
  middle: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  // Bottom third of the screen: main buttons for one thumb.
  bottom: { flex: 1.3, justifyContent: 'flex-end', paddingBottom: 16 },
  gap: { marginTop: 12 },
  small: { flex: 0, marginTop: 8 },
  prompt: { color: colors.textDim, fontSize: type.big },
  caption: { color: colors.textDim, fontSize: type.big, fontWeight: '600', marginBottom: 4 },
  countdown: {
    color: colors.text,
    fontSize: type.countdown,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  elapsed: { color: colors.text, fontSize: 56, fontWeight: '200', fontVariant: ['tabular-nums'] },
  summaryBig: { color: colors.text, fontSize: 64, fontWeight: '300' },
  meta: { color: colors.textFaint, fontSize: type.body, marginTop: 8, textAlign: 'center' },
  repeatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 32, gap: 12 },
  repeatText: { color: colors.textDim, fontSize: type.body },
  undo: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  undoText: { color: colors.text, fontSize: type.small, fontWeight: '600' },
});
