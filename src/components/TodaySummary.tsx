/**
 * The daytime "Today" screen: last night as a short story. Headline, a
 * timeline bar, the key moments, total crying vs the night before, and
 * tonight's first wait. Peach & plum theme.
 */
import { router, useFocusEffect } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Night, listNightsWithEvents } from '../data/db';
import { useNightStore } from '../data/NightStore';
import { nextWaitMinutes } from '../lib/ferber';
import { isPastNight } from '../lib/nightView';
import {
  Segment,
  SegmentKind,
  compareCrying,
  formatHours,
  moments,
  morningHeadline,
  morningNote,
  timeline,
  totalSleepMs,
  upAt,
} from '../lib/morning';
import { NightEvent } from '../lib/session';
import { shouldAskForReview } from '../lib/review';
import { summarizeNight } from '../lib/summary';
import { formatClock } from '../lib/time';
import { day, dayFonts } from '../theme/day';

export interface LastNights {
  last: { night: Night; events: NightEvent[] } | null;
  previous: { night: Night; events: NightEvent[] } | null;
  /** Crying minutes for every finished night, oldest first */
  crying: number[];
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

/** When the night "ends" on the timeline: "Up for the day" if logged, else 6:30am (or the last event if later). */
function timelineEnd(key: string, events: NightEvent[]): number {
  const up = upAt(events);
  if (up != null) return up;
  const [y, m, d] = key.split('-').map(Number);
  const morning = new Date(y, m - 1, d + 1, 6, 30).getTime();
  const lastAt = Math.max(...events.map((e) => e.at));
  return Math.max(morning, lastAt);
}

export function TodaySummary({ data, onStartTonight }: { data: LastNights; onStartTonight: () => void }) {
  const { baby, chart, settings, updateSetting } = useNightStore();
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
  const compare = compareCrying(
    summary.cryingMinutes,
    data.previous && prevSummary
      ? {
          nightNumber: data.previous.night.nightNumber,
          cryingMinutes: prevSummary.cryingMinutes,
        }
      : null,
  );
  const note = morningNote(data.crying);
  const tonightNumber = last.night.nightNumber + 1;
  const tonightFirstWait = nextWaitMinutes(chart, last.night.chartNight + 1, 0);

  const end = timelineEnd(last.night.nightKey, last.events);
  const upTime = upAt(last.events);
  const sleepMs = totalSleepMs(last.events);
  const segs = timeline(last.events, end);
  const start = segs[0]?.from ?? end;
  const span = Math.max(1, end - start);
  const kinds = (['crying', 'asleep', 'settling', 'feeding'] as SegmentKind[]).filter((k) => segs.some((s) => s.kind === k));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>
          {greeting} · Night {last.night.nightNumber}
        </Text>
        <Text style={styles.headline} accessibilityRole="header">
          {morningHeadline(name, last.events)}
        </Text>
        {upTime != null && (
          <Text style={styles.upLine}>
            Up at {formatClock(upTime)}
            {sleepMs != null && sleepMs > 0 ? ` · ${formatHours(sleepMs)} of sleep` : ''}
          </Text>
        )}

        <View style={styles.card}>
          <View style={styles.timeRow}>
            <Text style={styles.small}>{formatClock(start)}</Text>
            <Text style={styles.small}>{formatClock(end)}</Text>
          </View>
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
          <View style={styles.legend}>
            {kinds.map((k) => (
              <View key={k} style={styles.legendItem}>
                <View style={[styles.swatch, { backgroundColor: KIND_COLOR[k] }]} />
                <Text style={styles.small}>{KIND_LABEL[k]}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 4 }}>
            {moments(last.events, formatClock).map((m, i) => (
              <View key={i} style={styles.moment}>
                <Text style={styles.momentTime}>{formatClock(m.at)}</Text>
                <Text style={styles.momentText}>{m.text}</Text>
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

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: day.plum }]}>
            <Text style={[styles.small, { color: day.onPlumDim }]}>Total crying</Text>
            <Text style={[styles.statValue, { color: day.onPlum }]}>{summary.cryingMinutes} min</Text>
            {compare && <Text style={[styles.statNote, { color: day.coralSoft }]}>{compare}</Text>}
          </View>
          <View style={[styles.stat, { backgroundColor: day.card }]}>
            <Text style={styles.small}>Tonight, night {tonightNumber}</Text>
            <Text style={styles.statValue}>{tonightFirstWait} min</Text>
            <Text style={[styles.statNote, { color: day.dim }]}>first wait</Text>
          </View>
        </View>

        {note && <Text style={styles.note}>{note}</Text>}

        <Pressable onPress={onStartTonight} accessibilityRole="button" style={styles.startBtn}>
          <Text style={styles.startText}>Starting bedtime early? Open the night screen</Text>
        </Pressable>
      </ScrollView>
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
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 13 },
  bar: {
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 2,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  moment: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: day.line,
  },
  momentTime: {
    width: 72,
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
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statValue: {
    color: day.plum,
    fontFamily: dayFonts.display,
    fontSize: 28,
    marginTop: 2,
  },
  statNote: { fontFamily: dayFonts.bold, fontSize: 13 },
  startBtn: { alignSelf: 'center', paddingVertical: 12 },
  startText: {
    color: day.dim,
    fontFamily: dayFonts.medium,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
