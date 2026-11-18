/**
 * One night: summary, every tap as a timeline (grouped by episode), fix or
 * delete a tap, add a missed one, and a note.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EVENT_LABEL, EventSheet } from '../../components/EventSheet';
import {
  Night,
  getNight,
  isAddedLater,
  softDeleteNightEvents,
  insertEvent,
  listEvents,
  setNightNote,
  softDeleteEvent,
  updateEventTime,
} from '../../data/db';
import { useNightStore } from '../../data/NightStore';
import { EventType, NightEvent, episodes } from '../../lib/session';
import { episodeCryingMs, summarizeNight } from '../../lib/summary';
import { formatClock, formatMinutes } from '../../lib/time';
import { makeStyles, useTheme } from '../../theme';

type Sheet = { mode: 'edit'; event: NightEvent } | { mode: 'add' } | null;

export default function NightDetailScreen() {
  const styles = stylesHook();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const store = useNightStore();
  const [night, setNight] = useState<Night | null>(null);
  const [events, setEvents] = useState<NightEvent[]>([]);
  const [note, setNote] = useState('');
  const [sheet, setSheet] = useState<Sheet>(null);

  const load = useCallback(async () => {
    const n = await getNight(db, id);
    const evs = n ? await listEvents(db, n.id) : [];
    setNight(n);
    setEvents(evs.filter((e) => !e.deletedAt));
    setNote(n?.note ?? '');
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async load from SQLite
    load();
  }, [load]);

  /** After any change: refresh this screen and the store (which re-syncs tonight's alert). */
  const changed = async () => {
    setSheet(null);
    await load();
    await store.reload();
  };

  if (!night) return <View style={styles.root} />;

  const summary = summarizeNight(events);
  const eps = episodes(events);
  const inEpisode = new Set(eps.flatMap((ep) => ep.events.map((e) => e.id)));
  const strays = events.filter((e) => !inEpisode.has(e.id));
  const date = new Date(`${night.nightKey}T12:00:00`).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to History"
        >
          <Text style={styles.back}>‹ History</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Night {night.nightNumber}</Text>
        <Text style={styles.sub}>
          {date}
          {night.chartNight !== night.nightNumber ? ` · night ${night.chartNight} intervals` : ''}
        </Text>

        <View style={styles.stats}>
          <Stat label="Crying" value={formatMinutes(summary.cryingMinutes)} />
          <Stat label="Check-ins" value={String(summary.checkIns)} />
          <Stat label="Wakings" value={String(summary.wakings)} />
        </View>

        {isAddedLater(night) ? (
          <AddedLater
            night={night}
            events={events}
            onDeleted={async () => {
              await store.reload();
              router.back();
            }}
          />
        ) : (
          <>
            {eps.map((ep, i) => (
              <View key={ep.start.id} style={styles.episode}>
                <Text style={styles.epTitle}>
                  {ep.start.type === 'down'
                    ? 'Bedtime'
                    : `Waking ${eps.slice(0, i + 1).filter((x) => x.start.type !== 'down').length}`}
                  {' · '}
                  {ep.end ? `${formatMinutes(episodeCryingMs(ep) / 60_000)} crying` : 'not finished'}
                </Text>
                {ep.events.map((e) => (
                  <EventRow key={e.id} e={e} onPress={() => setSheet({ mode: 'edit', event: e })} />
                ))}
              </View>
            ))}
            {strays.length > 0 && (
              <View style={styles.episode}>
                <Text style={styles.epTitle}>Not part of an episode</Text>
                {strays.map((e) => (
                  <EventRow key={e.id} e={e} onPress={() => setSheet({ mode: 'edit', event: e })} />
                ))}
              </View>
            )}

            <Pressable onPress={() => setSheet({ mode: 'add' })} style={styles.addBtn} accessibilityRole="button">
              <Text style={styles.addText}>+ Add a missed tap</Text>
            </Pressable>
          </>
        )}

        <Text style={styles.label}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          onEndEditing={() => setNightNote(db, night.id, note)}
          placeholder="Teething? Late nap? Anything worth remembering."
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.note}
        />
      </ScrollView>

      {sheet && (
        <EventSheet
          visible
          mode={sheet.mode}
          nightKey={night.nightKey}
          initialType={sheet.mode === 'edit' ? sheet.event.type : nextLikelyType(events)}
          initialAt={sheet.mode === 'edit' ? sheet.event.at : (events[events.length - 1]?.at ?? night.startedAt)}
          onClose={() => setSheet(null)}
          onSave={async (t: EventType, at: number) => {
            if (sheet.mode === 'edit') await updateEventTime(db, sheet.event.id, at);
            else await insertEvent(db, night.id, t, at);
            await changed();
          }}
          onDelete={
            sheet.mode === 'edit'
              ? async () => {
                  await softDeleteEvent(db, sheet.event.id, Date.now());
                  await changed();
                }
              : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

/**
 * A night entered afterwards: only its totals are known, so no times for the
 * wakings or check-ins (they were spread out evenly just to count them).
 */
function AddedLater({ night, events, onDeleted }: { night: Night; events: NightEvent[]; onDeleted: () => void }) {
  const styles = stylesHook();
  const db = useSQLiteContext();
  const [confirm, setConfirm] = useState(false);
  const live = events.filter((e) => !e.deletedAt);
  const down = live.find((e) => e.type === 'down');
  const up = live.find((e) => e.type === 'up');
  return (
    <View style={styles.episode}>
      <Text style={styles.epTitle}>Added afterwards</Text>
      {down && (
        <View style={styles.eventRow}>
          <Text style={styles.eventTime}>{formatClock(down.at)}</Text>
          <Text style={styles.eventLabel}>Down for the night</Text>
        </View>
      )}
      {up && (
        <View style={styles.eventRow}>
          <Text style={styles.eventTime}>{formatClock(up.at)}</Text>
          <Text style={styles.eventLabel}>Up for the day</Text>
        </View>
      )}
      <Text style={styles.addedNote}>
        Entered as totals, so the times of night wakings and check-ins aren&apos;t shown. To change it, delete this night and
        add it again.
      </Text>
      <Pressable
        onPress={async () => {
          if (!confirm) return setConfirm(true);
          await softDeleteNightEvents(db, night.id);
          onDeleted();
        }}
        style={styles.addBtn}
        accessibilityRole="button"
      >
        <Text style={styles.deleteText}>{confirm ? 'Tap again to delete this night' : 'Delete this night'}</Text>
      </Pressable>
    </View>
  );
}

function nextLikelyType(events: NightEvent[]): EventType {
  const last = events[events.length - 1];
  if (!last) return 'down';
  if (last.type === 'down' || last.type === 'quiet') return 'cry';
  if (last.type === 'check_in_start') return 'check_in_end';
  if (last.type === 'feed_start') return 'feed_end';
  if (last.type === 'asleep') return 'woke';
  return 'asleep';
}

function Stat({ label, value }: { label: string; value: string }) {
  const styles = stylesHook();
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function EventRow({ e, onPress }: { e: NightEvent; onPress: () => void }) {
  const styles = stylesHook();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.eventRow, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityHint="Edit or delete this tap"
    >
      <Text style={styles.eventTime}>{formatClock(e.at)}</Text>
      <Text style={styles.eventLabel}>{EVENT_LABEL[e.type]}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
    topBar: { paddingVertical: 8 },
    back: { color: colors.primary, fontFamily: fonts.bold, fontSize: type.body },
    title: { color: colors.text, fontFamily: fonts.bold, fontSize: type.huge, marginTop: 4 },
    sub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15, marginTop: 2 },
    stats: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 8 },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 14 },
    statLabel: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 13 },
    statValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, marginTop: 2 },
    episode: { marginTop: 20 },
    epTitle: {
      color: colors.textDim,
      fontFamily: fonts.bold,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    eventRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    eventTime: {
      width: 92,
      color: colors.text,
      fontFamily: fonts.semibold,
      fontSize: type.body,
      fontVariant: ['tabular-nums'],
    },
    eventLabel: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: type.body },
    chevron: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: 22 },
    addBtn: {
      marginTop: 20,
      height: 52,
      borderRadius: 999,
      backgroundColor: colors.buttonBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addText: { color: colors.text, fontFamily: fonts.bold, fontSize: type.body },
    addedNote: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, marginTop: 10 },
    deleteText: { color: colors.accent, fontFamily: fonts.bold, fontSize: type.body },
    label: {
      color: colors.textDim,
      fontFamily: fonts.bold,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 28,
      marginBottom: 8,
    },
    note: {
      minHeight: 96,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 14,
      color: colors.text,
      fontFamily: fonts.regular,
      fontSize: type.body,
      textAlignVertical: 'top',
    },
  }),
);
