/**
 * Night screen — the product. Usable half-asleep with one thumb:
 * huge countdown, big buttons in the bottom third, no confirmation dialogs
 * (Undo instead). "Moonlight" look: navy, lavender ring, peach when due.
 */
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../../components/BigButton';
import { CheckInDots, MoonIcon, ProgressRing } from '../../components/Moonlight';
import { useNow } from '../../components/useNow';
import { useNightStore } from '../../data/NightStore';
import { Action, UNDO_WINDOW_MS } from '../../lib/session';
import { episodeCryingMs, summarizeNight } from '../../lib/summary';
import { formatClock, formatDuration } from '../../lib/time';
import { colors, fonts, type } from '../../theme/night';

const ACTION_LABEL: Record<Action, string> = {
  down: 'Down',
  cry: 'Crying',
  quiet: 'Stopped crying',
  woke: 'Woke up',
  check_in_start: 'Going in',
  check_in_end: 'Back out',
  asleep: 'Asleep',
};

const KEEP_AWAKE_TAG = 'ferber-night';
/** Check-ins should be short; the ring fills over this and nudges once when it's up. */
const CHECK_IN_GOAL_MS = 2 * 60_000;
const MIN = 60_000;

export default function NightScreen() {
  const store = useNightStore();
  const now = useNow(250);
  const state = store.stateAt(now);

  // Keep the screen on while a wait or check-in is running (setting can turn this off).
  const awake =
    store.settings.keepAwake && (state.kind === 'quiet' || state.kind === 'waiting' || state.kind === 'due' || state.kind === 'in_room');
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

  // In the room: one gentle buzz when the check-in reaches 2 minutes.
  const overTime = state.kind === 'in_room' && now - state.since >= CHECK_IN_GOAL_MS;
  useEffect(() => {
    if (overTime && store.settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [overTime, store.settings.haptics]);

  if (!store.ready) return <View style={styles.root} />;

  const undoLeft = store.lastTap ? UNDO_WINDOW_MS - (now - store.lastTap.tappedAt) : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <MoonIcon />
        <Text style={styles.nightLabel}>
          {store.baby?.name ? `${store.baby.name.toUpperCase()} · ` : ''}NIGHT {store.nightNumber}
        </Text>
      </View>
      {store.chartNight !== store.nightNumber && (
        <Text style={styles.subLabel}>using night {store.chartNight} intervals</Text>
      )}

      {state.kind === 'idle' && (
        <>
          <View style={styles.middle}>
            <ProgressRing progress={0}>
              <MoonIcon size={56} color={colors.primary} />
              <Text style={[styles.ringCaption, { marginTop: 16 }]}>Ready when you are</Text>
            </ProgressRing>
            {store.hasPreviousNight && (
              <View style={styles.repeatRow}>
                <Text style={styles.repeatText}>{"Repeat last night's intervals"}</Text>
                <Switch
                  value={store.repeatLastNight}
                  onValueChange={store.setRepeatLastNight}
                  trackColor={{ true: colors.primary, false: colors.buttonBg }}
                  thumbColor={colors.text}
                />
              </View>
            )}
          </View>
          <View style={styles.bottom}>
            <BigButton label="Down for the night" onPress={() => store.tap('down')} />
            <BigButton label="Night waking" variant="link" onPress={() => store.tap('woke')} style={styles.linkGap} />
          </View>
        </>
      )}

      {state.kind === 'quiet' && (
        <>
          <View style={styles.middle}>
            <ProgressRing progress={0}>
              <MoonIcon size={40} color={colors.primary} />
              <Text style={[styles.countdown, styles.quietTitle]}>{state.checkInNumber === 1 && state.cryingMs === 0 ? 'Settling' : 'Quiet'}</Text>
              <Text style={styles.ringSub}>
                {state.checkInNumber === 1 && state.cryingMs === 0 ? 'No timer until they cry' : `Timer paused · ${formatDuration(now - state.since)}`}
              </Text>
            </ProgressRing>
            <CheckInDots
              done={state.checkInNumber - 1}
              label={state.cryingMs > 0 ? `crying ${Math.floor(state.cryingMs / MIN)} min` : undefined}
            />
          </View>
          <View style={[styles.bottom, styles.row]}>
            <BigButton label="Asleep" variant="secondary" onPress={() => store.tap('asleep')} style={{ flex: 1 }} />
            <BigButton label="Crying" onPress={() => store.tap('cry')} style={{ flex: 1.4 }} />
          </View>
        </>
      )}

      {state.kind === 'waiting' && (
        <>
          <View style={styles.middle}>
            <ProgressRing progress={(now - state.waitStartedAt) / (state.waitMinutes * MIN)}>
              <Text style={styles.ringCaption}>Check-in #{state.checkInNumber} in</Text>
              <Text style={styles.countdown} adjustsFontSizeToFit numberOfLines={1}>
                {formatDuration(state.nextCheckInAt - now)}
              </Text>
              <Text style={styles.ringSub}>of {state.waitMinutes} min</Text>
            </ProgressRing>
            <CheckInDots done={state.checkInNumber - 1} label={`crying ${Math.floor(state.cryingMs / MIN)} min`} />
          </View>
          <View style={styles.bottom}>
            <BigButton label="Stopped crying" variant="link" onPress={() => store.tap('quiet')} style={styles.linkAbove} />
            <View style={styles.row}>
              <BigButton label="Going in" variant="secondary" onPress={() => store.tap('check_in_start')} style={{ flex: 1 }} />
              <BigButton label="Asleep" onPress={() => store.tap('asleep')} style={{ flex: 1.4 }} />
            </View>
          </View>
        </>
      )}

      {state.kind === 'due' && (
        <>
          <View style={styles.middle}>
            <Glow>
              <ProgressRing progress={1} color={colors.accent} track={colors.accent}>
                <Text style={[styles.ringCaption, { color: colors.accent, fontFamily: fonts.bold }]}>Time to check in</Text>
                <Text style={[styles.countdown, { color: colors.accentText }]}>#{state.checkInNumber}</Text>
                <Text style={[styles.ringSub, { color: colors.accentDim }]}>
                  due {formatDuration(now - state.nextCheckInAt)} ago
                </Text>
              </ProgressRing>
            </Glow>
            <CheckInDots done={state.checkInNumber - 1} due label={`crying ${Math.floor(state.cryingMs / MIN)} min`} />
          </View>
          <View style={styles.bottom}>
            <BigButton label="I'm going in" variant="alert" onPress={() => store.tap('check_in_start')} />
            <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={styles.linkGap} />
          </View>
        </>
      )}

      {state.kind === 'in_room' && (
        <>
          <View style={styles.middle}>
            <ProgressRing
              progress={(now - state.since) / CHECK_IN_GOAL_MS}
              color={overTime ? colors.accent : colors.primary}
            >
              <Text style={styles.ringCaption}>In the room</Text>
              <Text style={[styles.countdown, overTime && { color: colors.accentText }]} adjustsFontSizeToFit numberOfLines={1}>
                {formatDuration(now - state.since)}
              </Text>
              <Text style={styles.ringSub}>check-in #{state.checkInNumber}</Text>
            </ProgressRing>
            <Text style={[styles.hint, overTime && styles.nudge]}>
              {overTime
                ? "That's 2 minutes. Time to say goodnight and step out."
                : 'Keep it calm and brief: a pat, your words, then out.'}
            </Text>
          </View>
          <View style={styles.bottom}>
            <BigButton label="Back out" onPress={() => store.tap('check_in_end')} />
            <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={styles.linkGap} />
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
        <ProgressRing progress={1}>
          <MoonIcon size={32} color={colors.primary} />
          <Text style={[styles.ringCaption, { marginTop: 8 }]}>Asleep at {formatClock(props.since)}</Text>
          <Text style={styles.countdown}>{Math.round(props.cryingMs / MIN)}</Text>
          <Text style={styles.ringSub}>min crying</Text>
        </ProgressRing>
        <CheckInDots done={props.checkIns} label={`${props.checkIns} check-in${props.checkIns === 1 ? '' : 's'}`} />
        {night.episodeCount > 1 && (
          <Text style={styles.hint}>
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

/** Soft pulsing peach glow behind the ring when a check-in is due. */
function Glow({ children }: { children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(0.15));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.55, duration: 900, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0.15, duration: 900, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View style={{ shadowColor: colors.accent, shadowRadius: 40, shadowOffset: { width: 0, height: 0 }, shadowOpacity: v }}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  header: { paddingTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  nightLabel: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.6 },
  subLabel: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: type.small, textAlign: 'center', marginTop: 2 },
  middle: { flex: 2, alignItems: 'center', justifyContent: 'center', gap: 20 },
  // Bottom third of the screen: main buttons for one thumb.
  bottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  linkGap: { marginTop: 6 },
  linkAbove: { marginBottom: 6 },
  quietTitle: { fontSize: 52, lineHeight: 64, marginTop: 4 },
  ringCaption: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: type.body, textAlign: 'center' },
  countdown: {
    color: colors.text,
    fontFamily: fonts.light,
    fontSize: type.countdown,
    fontVariant: ['tabular-nums'],
    lineHeight: type.countdown * 1.15,
  },
  ringSub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15 },
  nudge: { color: colors.accentText, fontFamily: fonts.bold },
  hint: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: 15, textAlign: 'center' },
  repeatRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  repeatText: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: type.body },
  undo: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  undoText: { color: colors.text, fontFamily: fonts.bold, fontSize: type.small },
});
