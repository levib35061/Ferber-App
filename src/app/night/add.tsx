/**
 * History → "Add a missed night": a night that wasn't logged live, entered as
 * a short summary (bedtime, crying, check-ins, number of wakings, up time). The events
 * come from src/lib/missedNight.ts and are written like any other taps.
 */
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNow } from '../../components/useNow';
import { createNight, insertEvent, listNightsWithEvents, setNightAddedLater } from '../../data/db';
import { useNightStore } from '../../data/NightStore';
import {
  ClockTime,
  MAX_CRYING_MIN,
  MAX_WAKINGS,
  MissedStretch,
  MissedWakings,
  maxWakingCheckIns,
  addableNightKeys,
  maxCheckIns,
  missedNightEvents,
} from '../../lib/missedNight';
import { atTimeInNight } from '../../lib/time';
import { needsUnlock } from '../../lib/trial';
import { makeStyles, useTheme } from '../../theme';

const dayLabel = (key: string) =>
  new Date(`${key}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

export default function AddMissedNight() {
  const styles = stylesHook();
  const db = useSQLiteContext();
  const { baby, reload, unlocked, nightsUsed, sync, saveBaby } = useNightStore();
  const [keys, setKeys] = useState<string[] | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [bedtime, setBedtime] = useState<MissedStretch>({ at: { h: 19, m: 30 }, cryingMin: 0, checkIns: 0 });
  const [wakings, setWakings] = useState<MissedWakings>({ count: 0, cryingMin: 0, checkIns: 0 });
  const [up, setUp] = useState<ClockTime | null>({ h: 6, m: 30 });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const now = useNow(30_000);

  useEffect(() => {
    if (!baby) return;
    listNightsWithEvents(db, baby.id).then((rows) => {
      const k = addableNightKeys(rows[0]?.night.nightKey ?? null, Date.now());
      setKeys(k);
      setKey(k[0] ?? null);
    });
  }, [db, baby]);

  const result = useMemo(
    () => (key ? missedNightEvents({ nightKey: key, now, bedtime, wakings, up }) : null),
    [key, now, bedtime, wakings, up],
  );

  const save = async () => {
    if (!baby || !key || !result || saving) return;
    if ('error' in result) return setError(result.error);
    setError(null);
    if (needsUnlock({ unlocked, nightsUsed, startsNewNight: true })) return router.push('/unlock');
    setSaving(true);
    try {
      // A missed night before this round's start date belongs to the round: move the start back to it,
      // so it counts as the earlier night (e.g. night 1) and tonight follows on from it.
      const roundStart = baby.trainingStartDate && key < baby.trainingStartDate ? key : baby.trainingStartDate;
      if (roundStart !== baby.trainingStartDate) await saveBaby({ ...baby, trainingStartDate: roundStart });
      const night = await createNight(db, baby.id, result.events[0].at, false, roundStart);
      // Marked "added later" before any tap is written, so a sync in between never shows
      // the spread-out (made-up) times on the partner's phone.
      await setNightAddedLater(db, night.id);
      for (const e of result.events) await insertEvent(db, night.id, e.type, e.at, sync.userId);
      await reload();
      router.replace({ pathname: '/night/[id]', params: { id: night.id } });
    } catch (e) {
      setError(`Couldn't save that night: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  if (!keys) return <SafeAreaView style={styles.root} />;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text style={styles.back}>‹ History</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 60, gap: 14 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add a missed night</Text>
        {keys.length === 0 ? (
          <Text style={styles.hint}>
            You can add a night that&apos;s newer than your latest logged night, up to last night. To fix an earlier night,
            open it in History and add or edit its taps.
          </Text>
        ) : (
          <>
            <Text style={styles.hint}>
              Your best guess is fine. It&apos;s counted like any other night in your recap and charts.
            </Text>

            <Text style={styles.label}>Which night</Text>
            <View style={styles.chips}>
              {keys.map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setKey(k)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: k === key }}
                  style={[styles.chip, k === key && styles.chipOn]}
                >
                  <Text style={[styles.chipText, k === key && styles.chipTextOn]}>{dayLabel(k)}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bedtime</Text>
              <Stretch value={bedtime} onChange={setBedtime} nightKey={key!} timeLabel="Down at" />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Night wakings</Text>
              <Stepper
                label="Wakings"
                value={wakings.count}
                step={1}
                max={MAX_WAKINGS}
                onChange={(count) =>
                  setWakings({
                    count,
                    cryingMin: count === 0 ? 0 : wakings.cryingMin,
                    checkIns: Math.min(wakings.checkIns, maxWakingCheckIns({ count, cryingMin: wakings.cryingMin })),
                  })
                }
              />
              {wakings.count > 0 && (
                <>
                  <Stepper
                    label="Minutes crying, total"
                    value={wakings.cryingMin}
                    step={5}
                    max={MAX_CRYING_MIN}
                    onChange={(cryingMin) =>
                      setWakings({
                        ...wakings,
                        cryingMin,
                        checkIns: Math.min(wakings.checkIns, maxWakingCheckIns({ count: wakings.count, cryingMin })),
                      })
                    }
                  />
                  <Stepper
                    label="Check-ins"
                    value={wakings.checkIns}
                    step={1}
                    max={maxWakingCheckIns(wakings)}
                    onChange={(checkIns) => setWakings({ ...wakings, checkIns })}
                  />
                </>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>Up for the day</Text>
                <Pressable onPress={() => setUp(up ? null : { h: 6, m: 30 })} hitSlop={10} accessibilityRole="button">
                  <Text style={styles.remove}>{up ? "Don't know" : 'Add'}</Text>
                </Pressable>
              </View>
              {up && <TimeRow label="Up at" nightKey={key!} value={up} onChange={setUp} />}
            </View>

            {(error || (result && 'error' in result)) && (
              <Text style={styles.error}>{result && 'error' in result ? result.error : error}</Text>
            )}
            <Pressable
              onPress={save}
              disabled={saving || !result || 'error' in result}
              accessibilityRole="button"
              style={[styles.saveBtn, (!result || 'error' in result) && { opacity: 0.5 }]}
            >
              <Text style={styles.saveText}>Save night</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stretch(props: {
  value: MissedStretch;
  onChange: (v: MissedStretch) => void;
  nightKey: string;
  timeLabel: string;
}) {
  const v = props.value;
  return (
    <>
      <TimeRow
        label={props.timeLabel}
        nightKey={props.nightKey}
        value={v.at}
        onChange={(at) => props.onChange({ ...v, at })}
      />
      <Stepper
        label="Minutes crying"
        value={v.cryingMin}
        step={5}
        max={MAX_CRYING_MIN}
        onChange={(cryingMin) => props.onChange({ ...v, cryingMin, checkIns: Math.min(v.checkIns, maxCheckIns(cryingMin)) })}
      />
      <Stepper
        label="Check-ins"
        value={v.checkIns}
        step={1}
        max={maxCheckIns(v.cryingMin)}
        onChange={(checkIns) => props.onChange({ ...v, checkIns })}
      />
    </>
  );
}

function TimeRow(props: { label: string; nightKey: string; value: ClockTime; onChange: (t: ClockTime) => void }) {
  const styles = stylesHook();
  const { colors, scheme } = useTheme();
  const date = new Date(atTimeInNight(props.nightKey, props.value.h, props.value.m));
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{props.label}</Text>
      <DateTimePicker
        value={date}
        mode="time"
        display="compact"
        themeVariant={scheme}
        textColor={colors.text}
        accentColor={colors.primary}
        onChange={(_, d) => d && props.onChange({ h: d.getHours(), m: d.getMinutes() })}
      />
    </View>
  );
}

function Stepper(props: { label: string; value: number; step: number; max: number; onChange: (n: number) => void }) {
  const styles = stylesHook();
  const set = (n: number) => props.onChange(Math.max(0, Math.min(props.max, n)));
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${props.label}: ${props.value}`}
      accessibilityRole="adjustable"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => set(props.value + (e.nativeEvent.actionName === 'increment' ? props.step : -props.step))}
    >
      <Text style={styles.rowLabel}>{props.label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => set(props.value - props.step)}
          hitSlop={8}
          style={styles.stepBtn}
          accessibilityLabel={`${props.label}: less`}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{props.value}</Text>
        <Pressable
          onPress={() => set(props.value + props.step)}
          hitSlop={8}
          style={styles.stepBtn}
          accessibilityLabel={`${props.label}: more`}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
    topBar: { paddingVertical: 8 },
    back: { color: colors.primary, fontFamily: fonts.bold, fontSize: type.body },
    title: { color: colors.text, fontFamily: fonts.bold, fontSize: type.huge, marginTop: 4 },
    hint: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
    label: { color: colors.textDim, fontFamily: fonts.bold, fontSize: type.small, marginTop: 4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface },
    chipOn: { backgroundColor: colors.primary },
    chipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    chipTextOn: { color: colors.bg },
    card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 10 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: type.body },
    remove: { color: colors.primary, fontFamily: fonts.bold, fontSize: 15 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
    // The label wraps rather than pushing the buttons off screen (large text sizes too).
    rowLabel: {
      flex: 1,
      flexShrink: 1,
      paddingRight: 10,
      color: colors.text,
      fontFamily: fonts.regular,
      fontSize: type.body,
    },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 },
    stepBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepText: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
    stepValue: { color: colors.text, fontFamily: fonts.bold, fontSize: type.body, minWidth: 34, textAlign: 'center' },
    addBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
    addText: { color: colors.primary, fontFamily: fonts.bold, fontSize: type.body },
    error: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
    saveBtn: {
      marginTop: 6,
      minHeight: 56,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveText: { color: colors.bg, fontFamily: fonts.bold, fontSize: type.body },
  }),
);
