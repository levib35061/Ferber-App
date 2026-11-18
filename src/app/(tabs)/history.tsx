/**
 * History (Milestone 1: read-only list). Milestone 2 adds night detail,
 * event editing and notes.
 */
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Night, listNightsWithEvents } from '../../data/db';
import { useNightStore } from '../../data/NightStore';
import { NightEvent } from '../../lib/session';
import { summarizeNight } from '../../lib/summary';
import { formatMinutes } from '../../lib/time';
import { makeStyles } from '../../theme';

export default function HistoryScreen() {
  const styles = stylesHook();
  const db = useSQLiteContext();
  const { baby } = useNightStore();
  const [rows, setRows] = useState<{ night: Night; events: NightEvent[] }[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (baby) listNightsWithEvents(db, baby.id).then(setRows);
    }, [db, baby]),
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.title}>History</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.night.id}
        ListEmptyComponent={<Text style={styles.empty}>No nights logged yet.</Text>}
        renderItem={({ item }) => {
          const s = summarizeNight(item.events);
          const date = new Date(`${item.night.nightKey}T12:00:00`).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
              onPress={() => router.push({ pathname: '/night/[id]', params: { id: item.night.id } })}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Night {item.night.nightNumber}</Text>
                <Text style={styles.rowSub}>
                  {date}
                  {item.night.note ? ' · has a note' : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowTitle}>{formatMinutes(s.cryingMinutes)}</Text>
                <Text style={styles.rowSub}>
                  {s.checkIns} check-in{s.checkIns === 1 ? '' : 's'} · {s.wakings} waking{s.wakings === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const stylesHook = makeStyles(({ colors, fonts, type }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
    title: { color: colors.text, fontSize: type.huge, fontFamily: fonts.bold, marginVertical: 16 },
    empty: { color: colors.textDim, fontFamily: fonts.regular, fontSize: type.body },
    row: {
      flexDirection: 'row',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    chevron: { color: colors.textFaint, fontSize: 22, marginLeft: 12, alignSelf: 'center' },
    rowTitle: { color: colors.text, fontSize: type.body, fontFamily: fonts.semibold },
    rowSub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: type.small, marginTop: 2 },
  }),
);
