/**
 * Night screen — the product. Usable half-asleep with one thumb:
 * huge countdown, big buttons in the bottom third, no confirmation dialogs
 * (Undo instead). "Moonlight" look: navy, lavender ring, peach when due.
 */
import { useIsFocused, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../../components/BigButton';
import { CheckInDots, MoonIcon, ProgressRing } from '../../components/Moonlight';
import { TodaySummary, useLastNights } from '../../components/TodaySummary';
import { useNow } from '../../components/useNow';
import { useNightStore } from '../../data/NightStore';
import { IN_ROOM_NOTE, waitingNote } from '../../lib/encourage';
import { chooseView } from '../../lib/nightView';
import { Action, UNDO_WINDOW_MS } from '../../lib/session';
import { asleepLines, episodeCryingMs, summarizeNight } from '../../lib/summary';
import { formatClock, formatDuration, isMorningWindow, isVeryEarly, spokenDuration } from '../../lib/time';
import { ThemeProvider } from '../../theme';
import { day, dayFonts } from '../../theme/day';
import { colors, fonts, type } from '../../theme/night';

const ACTION_LABEL: Record<Action, string> = {
  down: 'Down',
  cry: 'Crying',
  quiet: 'Stopped crying',
  feed_start: 'Night feed',
  feed_end: 'Done feeding',
  up: 'Up for the day',
  woke: 'Woke up',
  check_in_start: 'Going in',
  check_in_end: 'Back out',
  wait_more: 'Wait longer',
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
    store.settings.keepAwake &&
    (state.kind === 'quiet' || state.kind === 'waiting' || state.kind === 'due' || state.kind === 'in_room');
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
    if (!due || !store.settings.haptics || store.duty === 'partner') return;
    // "Check-in due" has its own pattern (three firm pulses), used for nothing else:
    // with the silent switch on, the vibration is the alert.
    const timers: ReturnType<typeof setTimeout>[] = [];
    const pulse = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    const buzz = () => [0, 220, 440].forEach((ms) => timers.push(setTimeout(pulse, ms)));
    buzz();
    const id = setInterval(buzz, 3000);
    return () => {
      clearInterval(id);
      timers.forEach(clearTimeout);
    };
  }, [due, store.settings.haptics, store.duty]);

  // VoiceOver: say what changed, since the screen swaps without a new page.
  const announcement =
    state.kind === 'due'
      ? `Time to check in. Check-in ${state.checkInNumber}.`
      : state.kind === 'waiting'
        ? `Check-in ${state.checkInNumber} in ${state.waitMinutes} minutes.`
        : state.kind === 'in_room'
          ? 'In the room.'
          : state.kind === 'asleep'
            ? 'Asleep.'
            : state.kind === 'quiet'
              ? 'Timer paused.'
              : state.kind === 'feeding'
                ? 'Night feed. Timer paused.'
                : null;
  const [lastAnnounced, setLastAnnounced] = useState<string | null>(null);
  useEffect(() => {
    if (!store.ready || announcement === lastAnnounced) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastAnnounced(announcement);
    if (announcement && lastAnnounced !== null) AccessibilityInfo.announceForAccessibility(announcement);
  }, [announcement, lastAnnounced, store.ready]);

  // In the room: one gentle buzz when the check-in reaches 2 minutes.
  const overTime = state.kind === 'in_room' && now - state.since >= CHECK_IN_GOAL_MS;
  useEffect(() => {
    if (overTime && store.settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [overTime, store.settings.haptics]);

  // Daytime: show last night's summary ("Today") unless something is in progress.
  const lastNights = useLastNights();
  const { view, canShowToday } = chooseView({
    now,
    stateKind: state.kind,
    bedtimeEarly: store.bedtimeEarly,
    lastNightKey: lastNights?.last?.night.nightKey ?? null,
  });
  const showToday = store.ready && view === 'today';

  // The tab is called "Today" (with a peach tab bar) while the summary shows.
  const navigation = useNavigation();
  const focused = useIsFocused();
  useEffect(() => {
    navigation.setOptions({
      title: showToday ? 'Today' : 'Night',
      tabBarStyle: showToday
        ? { backgroundColor: day.bg, borderTopWidth: 0 }
        : { backgroundColor: colors.bg, borderTopWidth: 0 },
      tabBarActiveTintColor: showToday ? day.plum : colors.text,
      tabBarInactiveTintColor: showToday ? day.dim : colors.textFaint,
      tabBarLabelStyle: {
        fontSize: 14,
        fontFamily: showToday ? dayFonts.bold : fonts.bold,
      },
    });
  }, [navigation, showToday]);

  if (!store.ready) return <View style={styles.root} />;

  if (showToday && lastNights) {
    return (
      <>
        {focused && <StatusBar style="dark" />}
        <TodaySummary data={lastNights} onStartTonight={() => store.setBedtimeEarly(true)} />
      </>
    );
  }

  const undoLeft = store.lastTap ? UNDO_WINDOW_MS - (now - store.lastTap.tappedAt) : 0;

  // Active night screens stay dark at any hour: you're in a dark nursery.
  return (
    <ThemeProvider mode="night">
      <SafeAreaView style={styles.root} edges={['top']}>
        {focused && <StatusBar style="light" />}
        {/* For 10 s after a tap, Undo takes the label's place (same height, nothing moves). */}
        <View style={styles.header}>
          {store.lastTap && undoLeft > 0 ? (
            <Pressable
              style={styles.undo}
              onPress={store.undo}
              accessibilityRole="button"
              accessibilityLabel={`Undo ${ACTION_LABEL[store.lastTap.type]}`}
              hitSlop={12}
            >
              <Text maxFontSizeMultiplier={1.3} style={styles.undoText}>
                Undo “{ACTION_LABEL[store.lastTap.type]}” · {Math.ceil(undoLeft / 1000)}s
              </Text>
            </Pressable>
          ) : (
            <>
              <MoonIcon />
              <Text maxFontSizeMultiplier={1.3} style={styles.nightLabel} accessibilityRole="header">
                {store.baby?.name ? `${store.baby.name.toUpperCase()} · ` : ''}
                NIGHT {store.nightNumber}
              </Text>
            </>
          )}
        </View>
        {store.chartNight !== store.nightNumber && (
          <Text style={styles.subLabel}>using night {store.chartNight} intervals</Text>
        )}
        {store.duty !== 'solo' && <DutyBar duty={store.duty} onSet={store.setDuty} />}
        {isMorningWindow(now) &&
          (state.kind === 'quiet' || state.kind === 'waiting' || state.kind === 'due' || state.kind === 'feeding') && (
            <Pressable onPress={() => store.tap('up')} accessibilityRole="button" style={styles.upPill} hitSlop={8}>
              <Text maxFontSizeMultiplier={1.3} style={styles.upPillText}>
                Up for the day? End the night
              </Text>
            </Pressable>
          )}

        {state.kind === 'idle' && (
          <>
            <View style={styles.middle}>
              <ProgressRing progress={0} accessibilityLabel="Ready when you are">
                <MoonIcon size={56} color={colors.primary} />
                <Text maxFontSizeMultiplier={1.25} style={[styles.ringCaption, { marginTop: 16 }]}>
                  Ready when you are
                </Text>
              </ProgressRing>
              {store.hasPreviousNight && (
                <View style={styles.repeatRow}>
                  <Text style={styles.repeatText}>{"Repeat last night's intervals"}</Text>
                  <Switch
                    value={store.repeatLastNight}
                    onValueChange={store.setRepeatLastNight}
                    trackColor={{
                      true: colors.primary,
                      false: colors.buttonBg,
                    }}
                    thumbColor={colors.text}
                    accessibilityLabel="Repeat last night's intervals"
                  />
                </View>
              )}
            </View>
            <View style={styles.bottom}>
              <BigButton label="Down for the night" onPress={() => store.tap('down')} />
              <BigButton label="Night waking" variant="link" onPress={() => store.tap('woke')} style={styles.linkGap} />
              {store.bedtimeEarly && canShowToday && (
                <BigButton label="Not yet? Back to Today" variant="link" onPress={() => store.setBedtimeEarly(false)} />
              )}
            </View>
          </>
        )}

        {state.kind === 'quiet' && (
          <>
            <View style={styles.middle}>
              <ProgressRing
                progress={0}
                accessibilityLabel={
                  state.checkInNumber === 1
                    ? 'Settling. No timer until they cry.'
                    : `Quiet. Timer paused for ${spokenDuration(now - state.since)}.`
                }
              >
                <MoonIcon size={40} color={colors.primary} />
                <Text maxFontSizeMultiplier={1} style={[styles.countdown, styles.quietTitle]}>
                  {state.checkInNumber === 1 ? 'Settling' : 'Quiet'}
                </Text>
                <Text maxFontSizeMultiplier={1.25} style={styles.ringSub}>
                  {state.checkInNumber === 1
                    ? 'No timer until they cry'
                    : `Timer paused · ${formatDuration(now - state.since)}`}
                </Text>
              </ProgressRing>
              <CheckInDots
                done={state.checkInNumber - 1}
                label={state.cryingMs > 0 ? `crying ${Math.floor(state.cryingMs / MIN)} min` : undefined}
              />
            </View>
            <View style={styles.bottom}>
              <BigButton
                label="Night feed"
                variant="link"
                onPress={() => store.tap('feed_start')}
                style={styles.linkAbove}
              />
              <View style={styles.row}>
                <BigButton label="Asleep" variant="secondary" onPress={() => store.tap('asleep')} style={{ flex: 1 }} />
                <BigButton label="Crying" onPress={() => store.tap('cry')} style={{ flex: 1.4 }} />
              </View>
            </View>
          </>
        )}

        {state.kind === 'waiting' && (
          <>
            <View style={styles.middle}>
              <ProgressRing
                progress={(now - state.waitStartedAt) / (state.waitMinutes * MIN)}
                accessibilityLabel={`Check-in ${state.checkInNumber} in ${spokenDuration(state.nextCheckInAt - now)}, of a ${state.waitMinutes} minute wait`}
              >
                <Text maxFontSizeMultiplier={1.25} style={styles.ringCaption}>
                  Check-in #{state.checkInNumber} in
                </Text>
                <Text maxFontSizeMultiplier={1} style={styles.countdown} adjustsFontSizeToFit numberOfLines={1}>
                  {formatDuration(state.nextCheckInAt - now)}
                </Text>
                <Text maxFontSizeMultiplier={1.25} style={styles.ringSub}>
                  of {state.waitMinutes} min
                </Text>
              </ProgressRing>
              <CheckInDots done={state.checkInNumber - 1} label={`crying ${Math.floor(state.cryingMs / MIN)} min`} />
              <WaitingNote
                nightNumber={store.nightNumber}
                checkInsDone={state.checkInNumber - 1}
                waking={state.waking}
                at={state.waitStartedAt}
              />
            </View>
            <View style={styles.bottom}>
              <View style={[styles.row, styles.linkRow]}>
                <BigButton label="Stopped crying" variant="link" onPress={() => store.tap('quiet')} style={{ flex: 1 }} />
                <BigButton label="Night feed" variant="link" onPress={() => store.tap('feed_start')} style={{ flex: 1 }} />
              </View>
              <View style={styles.row}>
                <BigButton
                  label="Going in"
                  variant="secondary"
                  onPress={() => store.tap('check_in_start')}
                  style={{ flex: 1 }}
                />
                <BigButton label="Asleep" onPress={() => store.tap('asleep')} style={{ flex: 1.4 }} />
              </View>
            </View>
          </>
        )}

        {state.kind === 'due' && (
          <>
            <View style={styles.middle}>
              <Glow>
                <ProgressRing
                  progress={1}
                  color={colors.accent}
                  track={colors.accent}
                  accessibilityLabel={`Time to check in. Check-in ${state.checkInNumber}, due ${spokenDuration(now - state.nextCheckInAt)} ago`}
                >
                  <Text
                    maxFontSizeMultiplier={1.25}
                    style={[styles.ringCaption, { color: colors.accent, fontFamily: fonts.bold }]}
                  >
                    Time to check in
                  </Text>
                  <Text maxFontSizeMultiplier={1} style={[styles.countdown, { color: colors.accentText }]}>
                    #{state.checkInNumber}
                  </Text>
                  <Text maxFontSizeMultiplier={1.25} style={[styles.ringSub, { color: colors.accentDim }]}>
                    due {formatDuration(now - state.nextCheckInAt)} ago
                  </Text>
                </ProgressRing>
              </Glow>
              <CheckInDots done={state.checkInNumber - 1} due label={`crying ${Math.floor(state.cryingMs / MIN)} min`} />
            </View>
            <View style={styles.bottom}>
              <BigButton label="I'm going in" variant="alert" onPress={() => store.tap('check_in_start')} />
              <View style={[styles.row, styles.linkGap, { gap: 0 }]}>
                <BigButton
                  label="Wait a little longer"
                  variant="link"
                  onPress={() => store.tap('wait_more')}
                  style={{ flex: 1.3 }}
                />
                <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={{ flex: 1 }} />
              </View>
            </View>
          </>
        )}

        {state.kind === 'in_room' && (
          <>
            <View style={styles.middle}>
              <ProgressRing
                progress={(now - state.since) / CHECK_IN_GOAL_MS}
                color={overTime ? colors.accent : colors.primary}
                accessibilityLabel={`In the room for ${spokenDuration(now - state.since)}, check-in ${state.checkInNumber}`}
              >
                <Text maxFontSizeMultiplier={1.25} style={styles.ringCaption}>
                  In the room
                </Text>
                <Text
                  maxFontSizeMultiplier={1}
                  style={[styles.countdown, overTime && { color: colors.accentText }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {formatDuration(now - state.since)}
                </Text>
                <Text maxFontSizeMultiplier={1.25} style={styles.ringSub}>
                  check-in #{state.checkInNumber}
                </Text>
              </ProgressRing>
              <Text style={[styles.hint, overTime && styles.nudge]}>
                {overTime ? "That's 2 minutes. Time to say goodnight and step out." : IN_ROOM_NOTE}
              </Text>
            </View>
            <View style={styles.bottom}>
              <BigButton label="Back out" onPress={() => store.tap('check_in_end')} />
              <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={styles.linkGap} />
            </View>
          </>
        )}

        {state.kind === 'feeding' && (
          <>
            <View style={styles.middle}>
              <ProgressRing
                progress={0}
                accessibilityLabel={`Night feed for ${spokenDuration(now - state.since)}. Timer paused.`}
              >
                <Text maxFontSizeMultiplier={1.25} style={styles.ringCaption}>
                  Night feed
                </Text>
                <Text maxFontSizeMultiplier={1} style={styles.countdown} adjustsFontSizeToFit numberOfLines={1}>
                  {formatDuration(now - state.since)}
                </Text>
                <Text maxFontSizeMultiplier={1.25} style={styles.ringSub}>
                  timer paused
                </Text>
              </ProgressRing>
              <Text style={styles.hint}>
                {`When you're done, put ${store.baby?.name || 'baby'} down awake. If they cry, the waits start again from the first one.`}
              </Text>
            </View>
            <View style={styles.bottom}>
              <BigButton label="Done feeding" onPress={() => store.tap('feed_end')} />
              <BigButton label="Asleep" variant="link" onPress={() => store.tap('asleep')} style={styles.linkGap} />
            </View>
          </>
        )}

        {state.kind === 'up' && (
          <View style={styles.middle}>
            <MoonIcon size={40} color={colors.primary} />
            <Text maxFontSizeMultiplier={1.25} style={styles.ringCaption}>
              Up for the day at {formatClock(state.since)}
            </Text>
            <Text style={styles.hint}>{"Tonight's tracking is done. See you at bedtime."}</Text>
          </View>
        )}

        {state.kind === 'asleep' && (
          <AsleepView
            since={state.since}
            cryingMs={episodeCryingMs(state.episode)}
            checkIns={state.episode.checkIns}
            wasWaking={state.episode.start.type !== 'down'}
            night={summarizeNight(store.events)}
            onWoke={() => store.tap('woke')}
            onFeed={() => store.tap('feed_start')}
            onUp={() => store.tap('up')}
            morning={isMorningWindow(now)}
            veryEarly={isVeryEarly(now)}
          />
        )}
      </SafeAreaView>
    </ThemeProvider>
  );
}

function AsleepView(props: {
  since: number;
  cryingMs: number;
  checkIns: number;
  /** The stretch that just ended started with a waking (not bedtime) */
  wasWaking: boolean;
  night: ReturnType<typeof summarizeNight>;
  onWoke: () => void;
  onFeed: () => void;
  onUp: () => void;
  /** 5am–11am: offer "Up for the day" */
  morning: boolean;
  /** before 6am: remind that it's usually still a night waking */
  veryEarly: boolean;
}) {
  const { night } = props;
  // The big number is always the whole night's crying; the lines below explain
  // the stretch that just ended and the night so far.
  const lines = asleepLines(night, {
    cryingMinutes: Math.round(props.cryingMs / MIN),
    checkIns: props.checkIns,
    wasWaking: props.wasWaking,
  });
  return (
    <>
      <View style={styles.middle}>
        <ProgressRing
          progress={1}
          accessibilityLabel={`Asleep at ${formatClock(props.since)}. ${night.cryingMinutes} minutes crying tonight. ${lines.latest}.${lines.tonight ? ` ${lines.tonight}.` : ''}`}
        >
          <MoonIcon size={32} color={colors.primary} />
          <Text maxFontSizeMultiplier={1.25} style={[styles.ringCaption, { marginTop: 8 }]}>
            Asleep at {formatClock(props.since)}
          </Text>
          <Text maxFontSizeMultiplier={1} style={styles.countdown}>
            {night.cryingMinutes}
          </Text>
          <Text maxFontSizeMultiplier={1.25} style={styles.ringSub}>
            min crying tonight
          </Text>
        </ProgressRing>
        <Text maxFontSizeMultiplier={1.3} style={styles.asleepLatest}>
          {lines.latest}
        </Text>
        {lines.tonight && (
          <Text maxFontSizeMultiplier={1.3} style={[styles.hint, { marginTop: -12 }]}>
            {lines.tonight}
          </Text>
        )}
      </View>
      <View style={styles.bottom}>
        {props.morning && props.veryEarly && (
          <Text style={[styles.hint, styles.earlyHint]}>Before 6am? Most plans treat it as a night waking.</Text>
        )}
        {props.morning ? (
          <View style={styles.row}>
            <BigButton label="Woke up" variant="secondary" onPress={props.onWoke} style={{ flex: 1 }} />
            <BigButton label="Up for the day" onPress={props.onUp} style={{ flex: 1.3 }} />
          </View>
        ) : (
          <BigButton label="Woke up" variant="secondary" onPress={props.onWoke} />
        )}
        <BigButton label="Night feed" variant="link" onPress={props.onFeed} style={styles.linkGap} />
      </View>
    </>
  );
}

/** One calm line under the countdown at the hard moments (see lib/encourage). */
function WaitingNote(props: { nightNumber: number; checkInsDone: number; waking: boolean; at: number }) {
  const { height } = useWindowDimensions();
  const note = waitingNote({
    nightNumber: props.nightNumber,
    checkInsDone: props.checkInsDone,
    waking: props.waking,
    hour: new Date(props.at).getHours(),
  });
  // Small phones (iPhone SE) have no room under the ring: the timer and buttons come first.
  if (!note || height < 720) return null;
  return (
    <Text style={[styles.hint, styles.note]} maxFontSizeMultiplier={1.3}>
      {note}
    </Text>
  );
}

/** With a partner: who gets tonight's check-in alerts. */
function DutyBar({ duty, onSet }: { duty: 'unset' | 'me' | 'partner'; onSet: (who: 'me' | 'partner') => void }) {
  const text =
    duty === 'me'
      ? "You're on duty tonight"
      : duty === 'partner'
        ? 'Partner is on duty · alerts off here'
        : "Who's on duty tonight?";
  const action = duty === 'me' ? 'Hand off' : duty === 'partner' ? 'Take over' : "I'm on";
  return (
    <View style={styles.duty}>
      <View style={[styles.dutyDot, { backgroundColor: duty === 'me' ? colors.primary : colors.dotEmpty }]} />
      <Text maxFontSizeMultiplier={1.3} style={styles.dutyText} numberOfLines={1}>
        {text}
      </Text>
      <Pressable
        onPress={() => onSet(duty === 'me' ? 'partner' : 'me')}
        accessibilityRole="button"
        accessibilityLabel={`${text}. ${action}`}
        hitSlop={10}
      >
        <Text maxFontSizeMultiplier={1.3} style={styles.dutyAction}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

/** Soft pulsing peach glow behind the ring when a check-in is due. */
function Glow({ children }: { children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(0.35));
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion, () => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (reduceMotion) return; // steady glow instead of a pulse
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 0.55,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(v, {
          toValue: 0.15,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, reduceMotion]);
  return (
    <Animated.View
      style={{
        shadowColor: colors.accent,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: v,
      }}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  header: {
    marginTop: 8,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nightLabel: {
    color: colors.textDim,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: 0.6,
  },
  subLabel: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: type.small,
    textAlign: 'center',
    marginTop: 2,
  },
  middle: { flex: 2, alignItems: 'center', justifyContent: 'center', gap: 20 },
  // Bottom third of the screen: main buttons for one thumb.
  bottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  linkGap: { marginTop: 6 },
  linkAbove: { marginBottom: 6 },
  linkRow: { marginBottom: 6, gap: 0 },
  quietTitle: { fontSize: 52, lineHeight: 64, marginTop: 4 },
  ringCaption: {
    color: colors.textDim,
    fontFamily: fonts.semibold,
    fontSize: type.body,
    textAlign: 'center',
  },
  countdown: {
    color: colors.text,
    fontFamily: fonts.light,
    fontSize: type.countdown,
    fontVariant: ['tabular-nums'],
    lineHeight: type.countdown * 1.15,
  },
  ringSub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15 },
  upPill: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  upPillText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14 },
  earlyHint: { marginBottom: 10 },
  duty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dutyDot: { width: 8, height: 8, borderRadius: 4 },
  dutyText: {
    color: colors.textDim,
    fontFamily: fonts.semibold,
    fontSize: 14,
    flexShrink: 1,
  },
  dutyAction: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14 },
  nudge: { color: colors.accentText, fontFamily: fonts.bold },
  note: { paddingHorizontal: 12, lineHeight: 21 },
  asleepLatest: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: type.body, textAlign: 'center' },
  hint: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: 'center',
  },
  repeatRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  repeatText: {
    color: colors.textDim,
    fontFamily: fonts.semibold,
    fontSize: type.body,
  },
  undo: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  undoText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: type.small,
  },
});
