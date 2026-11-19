/**
 * The daytime "Today" screen (layout "B, numbers first"): three tiles
 * (crying, check-ins, wakings) against the night before, the trend chart from
 * night 3, a thin timeline with one line per stretch of the night, Share, and
 * tonight's first wait. Peach & plum theme.
 */
import { router, useFocusEffect } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Night, isAddedLater, listNightsWithEvents } from '../data/db';
import { useNightStore } from '../data/NightStore';
import { nextWaitMinutes } from '../lib/ferber';
import { isPastNight } from '../lib/nightView';
import {
  Segment,
  SegmentKind,
  formatHours,
  morningHeadline,
  morningNote,
  morningTiles,
  shouldCelebrate,
  stretchLines,
  addedLaterLines,
  timeline,
  timelineEnd,
  totalSleepMs,
  upAt,
} from '../lib/morning';
import { NightEvent } from '../lib/session';
import { shouldAskForReview } from '../lib/review';
import { RoundNight, currentRound } from '../lib/shareCard';
import { summarizeNight } from '../lib/summary';
import { formatClock, formatMinutes, formatMinutesShort, spokenMinutes } from '../lib/time';
import { day, dayFonts } from '../theme/day';
import { ShareProgressButton } from './ShareProgress';
import { Confetti } from './Confetti';

export interface LastNights {
  last: { night: Night; events: NightEvent[] } | null;
  previous: { night: Night; events: NightEvent[] } | null;
  /** Crying minutes for every finished night, oldest first */
  crying: number[];
  /** The current training round's finished nights, oldest first (for the share card) */
  round: RoundNight[];
}

/** Last night (the most recent logged night up to now) and the one before it. */
export function useLastNights(): LastNights | null {
  const db = useSQLiteContext();
  const { baby, events } = useNightStore();
  // Refetch when tonight's log actually changes (not on every re-render).
  const eventsKey = `${events.length}:${events[events.length - 1]?.id ?? ''}:${events[events.length - 1]?.at ?? ''}`;
  const [data, setData] = useState<LastNights | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!baby) return;
      const now = Date.now();
      listNightsWithEvents(db, baby.id).then((rows) => {
        // Only finished nights: after 11am, tonight's night isn't "last night".
        const past = rows.filter((r) => isPastNight(r.night.nightKey, now));
        setData({
          last: past[0] ?? null,
          previous: past[1] ?? null,
          crying: past.map((r) => summarizeNight(r.events).cryingMinutes).reverse(),
          round: currentRound(
            past
              .map((r) => ({ nightNumber: r.night.nightNumber, cryingMinutes: summarizeNight(r.events).cryingMinutes }))
              .reverse(),
          ),
        });
      });
      // `events` changes whenever tonight's log (or a partner's sync) changes.
    }, [db, baby, eventsKey]), // eslint-disable-line react-hooks/exhaustive-deps
  );
  return data;
}

const KIND_COLOR: Record<SegmentKind, string> = {
  crying: day.coral,
  asleep: day.plum,
  settling: day.settling,
  feeding: day.feeding,
};
const KIND_LABEL: Record<SegmentKind, string> = {
  crying: 'Crying',
  asleep: 'Asleep',
  settling: 'Settling',
  feeding: 'Feeding',
};

export function TodaySummary({
  data,
  onStartTonight,
  onNotUpYet,
}: {
  data: LastNights;
  onStartTonight: () => void;
  /** Set when "Up for the day" can still be taken back (before 11am): the baby woke again */
  onNotUpYet?: () => void;
}) {
  const { baby, chart, settings, updateSetting, syncStatus } = useNightStore();
  const last = data.last!;

  // On a good morning (never during a night), ask for an App Store rating. Rarely: see lib/review.
  const cryingKey = data.crying.join(',');
  useEffect(() => {
    const ask = shouldAskForReview({
      crying: data.crying,
      asks: settings.reviewAsks,
      lastAskedAt: settings.reviewAskedAt,
      now: Date.now(),
    });
    if (!ask) return;
    // Let them read the summary first.
    const t = setTimeout(async () => {
      if (!(await StoreReview.isAvailableAsync().catch(() => false))) return;
      await updateSetting('reviewAsks', settings.reviewAsks + 1);
      await updateSetting('reviewAskedAt', Date.now());
      StoreReview.requestReview().catch(() => {});
    }, 6000);
    return () => clearTimeout(t);
    // Re-check when the nights or the ask record change.
  }, [cryingKey, settings.reviewAsks, settings.reviewAskedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = baby?.name ?? '';
  const summary = summarizeNight(last.events);
  const prevSummary = data.previous ? summarizeNight(data.previous.events) : null;
  const tiles = morningTiles(
    summary,
    data.previous && prevSummary ? { nightNumber: data.previous.night.nightNumber, summary: prevSummary } : null,
  );
  // A clearly better night: a confetti burst, once per night (lib/morning shouldCelebrate).
  // Confetti re-checks this with the latest data right before it plays, and only marks the
  // night as celebrated once it actually plays (on screen, not in the background).
  // Not while a sync is running: a partner's taps could still change last night's numbers.
  const celebrate =
    shouldCelebrate(summary, prevSummary) && settings.celebratedNight !== last.night.id && !syncStatus.syncing;
  const [playedFor, setPlayedFor] = useState<string | null>(null);
  const celebrateNow = useRef(celebrate);
  useEffect(() => {
    celebrateNow.current = celebrate;
  });
  const note = morningNote(data.crying);
  const tonightNumber = last.night.nightNumber + 1;
  const tonightFirstWait = nextWaitMinutes(chart, last.night.chartNight + 1, 0);
  // From night 3 on, the trend chart: every night of this round, last night highlighted.
  const bars = data.round.length >= 3 ? data.round.slice(-7) : [];
  const maxBar = Math.max(1, ...bars.map((b) => b.cryingMinutes));

  const end = timelineEnd(last.night.nightKey, last.events);
  const upTime = upAt(last.events);
  const sleepMs = totalSleepMs(last.events);
  const addedLater = isAddedLater(last.night);
  const segs = timeline(last.events, end);
  const start = segs[0]?.from ?? end;
  const span = Math.max(1, end - start);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>
          {greeting} · Night {last.night.nightNumber}
        </Text>
        <Text style={styles.headline} accessibilityRole="header" accessibilityLabel={morningHeadline(name, last.events)}>
          {name.trim() ? `${name.trim()}'s night` : 'Last night'}
        </Text>
        {upTime != null && (
          <Text style={styles.upLine}>
            Up at {formatClock(upTime)}
            {sleepMs != null && sleepMs > 0 ? ` · ${formatHours(sleepMs)} of sleep` : ''}
          </Text>
        )}
        {onNotUpYet && (
          <Pressable onPress={onNotUpYet} accessibilityRole="button" hitSlop={10} style={{ marginTop: 6 }}>
            <Text style={styles.link}>Not up yet? Back to the night ›</Text>
          </Pressable>
        )}

        <View style={styles.tiles}>
          {tiles.map((t) => (
            <View key={t.label} style={styles.tile} accessible accessibilityLabel={t.spoken}>
              <Text style={styles.small}>{t.label}</Text>
              <Text style={styles.tileValue} adjustsFontSizeToFit numberOfLines={1}>
                {t.value}
              </Text>
              {t.delta && <Text style={styles.delta}>{t.delta}</Text>}
            </View>
          ))}
        </View>

        {bars.length > 0 && (
          <View
            style={styles.card}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Crying by night: ${bars.map((b) => `night ${b.nightNumber}, ${spokenMinutes(b.cryingMinutes)}`).join('; ')}`}
          >
            <View style={styles.chart}>
              {bars.map((b, i) => {
                const lastBar = i === bars.length - 1;
                return (
                  <View key={`${b.nightNumber}-${i}`} style={styles.col}>
                    <Text style={[styles.colValue, lastBar && styles.colValueLast]} numberOfLines={1}>
                      {formatMinutesShort(b.cryingMinutes)}
                    </Text>
                    <View
                      style={[
                        styles.colBar,
                        { height: Math.max(4, (b.cryingMinutes / maxBar) * 110) },
                        lastBar && { backgroundColor: day.plum },
                      ]}
                    />
                    <Text style={[styles.colLabel, lastBar && styles.colValueLast]}>{b.nightNumber}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.small, { textAlign: 'center' }]}>crying, by night</Text>
          </View>
        )}

        <View style={styles.card}>
          {addedLater ? (
            <Text style={styles.small}>Added afterwards · totals only</Text>
          ) : (
            <>
              <Text style={styles.small}>
                {formatClock(start)} → {formatClock(end)}
              </Text>
              <View
                style={styles.bar}
                accessible
                accessibilityRole="image"
                accessibilityLabel={segs
                  .map((s) => `${KIND_LABEL[s.kind]} ${formatClock(s.from)} to ${formatClock(s.to)}`)
                  .join('; ')}
              >
                {segs.map((s: Segment, i) => (
                  <View
                    key={i}
                    style={{
                      flex: (s.to - s.from) / span,
                      minWidth: 3,
                      backgroundColor: KIND_COLOR[s.kind],
                    }}
                  />
                ))}
              </View>
            </>
          )}
          <View>
            {(addedLater ? addedLaterLines(last.events) : stretchLines(last.events, formatClock)).map((l, i) => (
              <View key={i} style={styles.moment}>
                <Text style={styles.momentTime}>{l.label}</Text>
                <Text style={styles.momentText}>{l.text}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/night/[id]',
                params: { id: last.night.id },
              })
            }
            accessibilityRole="link"
            style={styles.linkRow}
          >
            <Text style={styles.link}>See the full night ›</Text>
          </Pressable>
        </View>

        {note && <Text style={styles.note}>{note}</Text>}

        <ShareProgressButton
          name={name}
          input={{
            round: data.round,
            last: {
              nightNumber: last.night.nightNumber,
              nightKey: last.night.nightKey,
              addedLater,
              events: last.events,
              summary,
              end,
            },
            previous:
              tiles[0].delta != null && data.previous
                ? {
                    nightNumber: data.previous.night.nightNumber,
                    cryingMinutes: summarizeNight(data.previous.events).cryingMinutes,
                  }
                : null,
          }}
        />

        <View
          style={styles.card}
          accessible
          accessibilityLabel={`Tonight, night ${tonightNumber}. First wait ${tonightFirstWait} minutes.`}
        >
          <Text style={styles.small}>Tonight, night {tonightNumber}</Text>
          <Text style={styles.tonight}>First wait {formatMinutes(tonightFirstWait)}</Text>
        </View>

        <Pressable onPress={onStartTonight} accessibilityRole="button" style={styles.startBtn}>
          <Text style={styles.startText}>Starting bedtime early? Open the night screen</Text>
        </Pressable>
      </ScrollView>
      {(celebrate || playedFor === last.night.id) && (
        <Confetti
          key={last.night.id}
          haptics={settings.haptics}
          canStart={() => celebrateNow.current}
          onStarted={() => {
            setPlayedFor(last.night.id);
            updateSetting('celebratedNight', last.night.id);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: day.bg },
  note: {
    color: day.text,
    fontFamily: dayFonts.medium,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  scroll: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40, gap: 16 },
  kicker: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 14 },
  headline: {
    color: day.plum,
    fontFamily: dayFonts.display,
    fontSize: 31,
    lineHeight: 35,
    letterSpacing: -0.9,
  },
  upLine: {
    color: day.text,
    fontFamily: dayFonts.bold,
    fontSize: 16,
    marginTop: -6,
  },
  card: { backgroundColor: day.card, borderRadius: 24, padding: 18, gap: 10 },
  small: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 13 },
  bar: {
    height: 14,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 2,
  },
  moment: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: day.line,
  },
  momentTime: {
    width: 76,
    color: day.plum,
    fontFamily: dayFonts.bold,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  momentText: {
    flex: 1,
    color: day.text,
    fontFamily: dayFonts.regular,
    fontSize: 15,
  },
  linkRow: { paddingTop: 6 },
  link: { color: day.plum, fontFamily: dayFonts.bold, fontSize: 15 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, backgroundColor: day.card, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 12 },
  tileValue: { color: day.plum, fontFamily: dayFonts.display, fontSize: 26, letterSpacing: -0.5, marginTop: 2 },
  delta: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 13 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 150 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  colValue: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 11, marginBottom: 4 },
  colValueLast: { color: day.plum },
  colBar: { width: 26, borderRadius: 7, backgroundColor: day.coralSoft },
  colLabel: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 12, marginTop: 6 },
  tonight: { color: day.plum, fontFamily: dayFonts.display, fontSize: 21, marginTop: 2 },
  startBtn: { alignSelf: 'center', paddingVertical: 12 },
  startText: {
    color: day.dim,
    fontFamily: dayFonts.medium,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
