/**
 * Progress: crying minutes per night (or check-ins per night) for the
 * current training round, plus one plain-language trend line.
 */
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarChart } from '../../components/BarChart';
import { listNightsWithEvents } from '../../data/db';
import { useNightStore } from '../../data/NightStore';
import { NightPoint, trendLine } from '../../lib/progress';
import { summarizeNight } from '../../lib/summary';
import { makeStyles } from '../../theme';

const MAX_NIGHTS = 21;

export default function ProgressScreen() {
  const styles = stylesHook();
  const db = useSQLiteContext();
  const { baby } = useNightStore();
  const [points, setPoints] = useState<(NightPoint & { id: string })[]>([]);
  const [view, setView] = useState<'crying' | 'checkIns'>('crying');

  useFocusEffect(
    useCallback(() => {
      if (!baby) return;
      listNightsWithEvents(db, baby.id).then((rows) => {
        const round = rows.filter((r) => !baby.trainingStartDate || r.night.nightKey >= baby.trainingStartDate);
        const pts = round
          .map((r) => {
            const s = summarizeNight(r.events);
            return {
              id: r.night.id,
              nightNumber: r.night.nightNumber,
              cryingMinutes: s.cryingMinutes,
              checkIns: s.checkIns,
            };
          })
          .sort((a, b) => a.nightNumber - b.nightNumber)
          .slice(-MAX_NIGHTS);
        setPoints(pts);
      });
    }, [db, baby]),
  );

  const bars = points.map((p) => ({
    key: p.id,
    label: String(p.nightNumber),
    value: view === 'crying' ? p.cryingMinutes : p.checkIns,
  }));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.trend}>{trendLine(points)}</Text>

        <View style={styles.segment} accessibilityRole="tablist">
          {(
            [
              ['crying', 'Crying minutes'],
              ['checkIns', 'Check-ins'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setView(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === key }}
              style={[styles.segBtn, view === key && styles.segBtnOn]}
            >
              <Text style={[styles.segText, view === key && styles.segTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.chartTitle}>{view === 'crying' ? 'Crying minutes per night' : 'Check-ins per night'}</Text>
        {points.length === 0 ? (
          <Text style={styles.empty}>Nights you log will show up here.</Text>
        ) : (
          <BarChart
            bars={bars}
            unit={view === 'crying' ? 'min' : 'check-ins'}
            accessibilityLabel={view === 'crying' ? 'Crying minutes per night' : 'Check-ins per night'}
          />
        )}
        <Text style={styles.footnote}>
          Crying time runs from Down (or Woke up) to Asleep, including time spent on check-ins. Every night is listed in
          History.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
    title: { color: colors.text, fontSize: type.huge, fontFamily: fonts.bold, marginVertical: 16 },
    trend: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, lineHeight: 28, marginBottom: 20 },
    segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 999, padding: 4, marginBottom: 20 },
    segBtn: { flex: 1, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    segBtnOn: { backgroundColor: colors.buttonBg },
    segText: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 15 },
    segTextOn: { color: colors.text, fontFamily: fonts.bold },
    chartTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: type.body, marginBottom: 4 },
    empty: { color: colors.textDim, fontFamily: fonts.regular, fontSize: type.body, marginVertical: 40 },
    footnote: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 20 },
  }),
);
