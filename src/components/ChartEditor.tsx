/**
 * Interval chart editor: pick a preset, or edit any cell (which makes the
 * chart Custom). Values are whole minutes, 1–120.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chart, ChartPreset, chartForPreset, setChartCell } from '../lib/ferber';
import { colors, fonts, type } from '../theme/night';

const PRESETS: { key: ChartPreset; label: string; hint: string }[] = [
  { key: 'ferber', label: 'Ferber', hint: 'The standard chart.' },
  { key: 'gentle', label: 'Gentle', hint: 'Same start, takes about 1.5× as many nights to reach the longest waits.' },
  { key: 'custom', label: 'Custom', hint: 'Your own numbers. Tap any number to change it.' },
];

interface Props {
  preset: ChartPreset;
  customChart: Chart | null;
  onChange: (preset: ChartPreset, customChart: Chart | null) => void;
}

export function ChartEditor({ preset, customChart, onChange }: Props) {
  const chart = chartForPreset(preset, customChart);
  const hint = PRESETS.find((p) => p.key === preset)?.hint;

  const pickPreset = (p: ChartPreset) => {
    // Custom starts from whatever is showing now, unless a custom chart already exists.
    if (p === 'custom') onChange('custom', customChart ?? chart.map((r) => [0, 1, 2].map((c) => r[Math.min(c, r.length - 1)])));
    else onChange(p, customChart);
  };

  return (
    <View>
      <View style={styles.segment}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => pickPreset(p.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: preset === p.key }}
            style={[styles.segBtn, preset === p.key && styles.segBtnOn]}
          >
            <Text style={[styles.segText, preset === p.key && styles.segTextOn]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>{hint}</Text>

      <View style={styles.headRow}>
        {['Night', '1st wait', '2nd wait', '3rd +'].map((h) => (
          <Text key={h} style={[styles.cell, styles.head]}>
            {h}
          </Text>
        ))}
      </View>
      {chart.map((row, r) => (
        <View key={r} style={styles.row}>
          <Text style={[styles.cell, styles.head, styles.nightCell]}>{r === chart.length - 1 ? `${r + 1}+` : r + 1}</Text>
          {[0, 1, 2].map((c) => {
            const value = row[Math.min(c, row.length - 1)];
            return (
              <CellInput
                key={`${r}-${c}-${value}`}
                value={value}
                label={`Night ${r + 1}, wait ${c + 1}, minutes`}
                onCommit={(v) => onChange('custom', setChartCell(chart, r, c, v))}
              />
            );
          })}
        </View>
      ))}
      <Text style={styles.hint}>Minutes. The last row is used for every night after it.</Text>

      {preset !== 'ferber' && (
        <Pressable onPress={() => onChange('ferber', null)} style={styles.reset} accessibilityRole="button">
          <Text style={styles.resetText}>Reset to Ferber default</Text>
        </Pressable>
      )}
    </View>
  );
}

function CellInput({ value, label, onCommit }: { value: number; label: string; onCommit: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  const commit = () => {
    const n = parseInt(text, 10);
    if (!Number.isFinite(n) || n < 1) {
      setText(String(value));
      return;
    }
    if (n !== value) onCommit(n);
  };
  return (
    <View style={styles.cell}>
      <TextInput
        value={text}
        onChangeText={(t) => setText(t.replace(/[^0-9]/g, ''))}
        onEndEditing={commit}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={3}
        selectTextOnFocus
        accessibilityLabel={label}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 999, padding: 4, marginBottom: 8 },
  segBtn: { flex: 1, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segBtnOn: { backgroundColor: colors.buttonBg },
  segText: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 15 },
  segTextOn: { color: colors.text, fontFamily: fonts.bold },
  hint: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: type.small, marginVertical: 8, lineHeight: 20 },
  headRow: { flexDirection: 'row', marginTop: 4, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cell: { flex: 1, paddingHorizontal: 3 },
  head: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 13 },
  nightCell: { fontSize: type.body, color: colors.text },
  input: {
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.buttonBg,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: type.body,
    textAlign: 'center',
  },
  reset: { alignSelf: 'flex-start', paddingVertical: 10 },
  resetText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 15 },
});
