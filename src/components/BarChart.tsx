/**
 * Single-series column chart (one value per night). Thin columns with a 4px
 * rounded top, square at the baseline; recessive gridlines; values only on
 * the first, latest and tapped column. Tap a column to read its value.
 */
import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '../theme/night';

export interface Bar {
  key: string;
  label: string; // x-axis label (night number)
  value: number;
}

const H = 220;
const TOP = 24; // room for cap labels
const BOTTOM = 26; // x-axis labels
const LEFT = 34; // y-axis labels
const MAX_BAR = 24;

function niceMax(v: number): number {
  if (v <= 5) return 5;
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= v) return m * step;
  return 10 * step;
}

function columnPath(x: number, w: number, y: number, base: number): string {
  const r = Math.min(4, w / 2, base - y);
  if (base - y <= 0) return '';
  return `M${x},${base} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${base} Z`;
}

export function BarChart({ bars, unit, accessibilityLabel }: { bars: Bar[]; unit: string; accessibilityLabel: string }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const max = niceMax(Math.max(1, ...bars.map((b) => b.value)));
  const plotW = Math.max(0, width - LEFT);
  const plotH = H - TOP - BOTTOM;
  const base = TOP + plotH;
  const slot = bars.length ? plotW / bars.length : 0;
  const barW = Math.min(MAX_BAR, slot * 0.6);
  const ticks = [0, max / 2, max];
  const labelEvery = bars.length > 14 ? 2 : 1;
  const sel = bars.find((b) => b.key === selected);

  return (
    <View>
      <Text style={styles.readout}>
        {sel ? `Night ${sel.label}: ${sel.value} ${unit}` : 'Tap a bar to see its value'}
      </Text>
      <View onLayout={onLayout} accessibilityLabel={accessibilityLabel} style={{ height: H }}>
        {width > 0 && (
          <Svg width={width} height={H}>
            {ticks.map((t) => {
              const y = base - (t / max) * plotH;
              return (
                <React.Fragment key={t}>
                  <Line x1={LEFT} x2={width} y1={y} y2={y} stroke={colors.border} strokeWidth={t === 0 ? 1 : StyleSheet.hairlineWidth} />
                  <SvgText x={LEFT - 8} y={y + 4} fill={colors.textFaint} fontSize={12} fontFamily={fonts.regular} textAnchor="end">
                    {Math.round(t)}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {bars.map((b, i) => {
              const x = LEFT + i * slot + (slot - barW) / 2;
              const y = base - (b.value / max) * plotH;
              const showValue = i === 0 || i === bars.length - 1 || b.key === selected;
              const dim = selected != null && b.key !== selected;
              return (
                <React.Fragment key={b.key}>
                  <Path d={columnPath(x, barW, y, base)} fill={colors.primary} opacity={dim ? 0.45 : 1} />
                  {showValue && (
                    <SvgText x={x + barW / 2} y={y - 6} fill={colors.text} fontSize={12} fontFamily={fonts.bold} textAnchor="middle">
                      {b.value}
                    </SvgText>
                  )}
                  {i % labelEvery === 0 && (
                    <SvgText x={x + barW / 2} y={H - 8} fill={colors.textDim} fontSize={12} fontFamily={fonts.regular} textAnchor="middle">
                      {b.label}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        )}
        {/* Hit targets: the whole column slot, wider and taller than the bar. */}
        <View style={[StyleSheet.absoluteFill, { left: LEFT, flexDirection: 'row' }]}>
          {bars.map((b) => (
            <Pressable
              key={b.key}
              style={{ flex: 1 }}
              onPress={() => setSelected(selected === b.key ? null : b.key)}
              accessibilityRole="button"
              accessibilityLabel={`Night ${b.label}, ${b.value} ${unit}`}
            />
          ))}
        </View>
      </View>
      <Text style={styles.axis}>Night</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 14, marginBottom: 8, minHeight: 20 },
  axis: { color: colors.textFaint, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', marginTop: 2, marginLeft: LEFT },
});
