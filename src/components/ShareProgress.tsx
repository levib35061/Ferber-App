/**
 * "Share last night" / "Share this progress" on the Today screen: a preview of the card
 * (Peach & plum), an optional baby's name, and the iOS share sheet with the
 * card as an image. The card is drawn here and captured with
 * react-native-view-shot, so what you see is exactly what's sent.
 */
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { Segment, SegmentKind } from '../lib/morning';
import { ShareCard as ShareCardT, ShareInput, shareCard } from '../lib/shareCard';
import { formatClock, formatMinutesShort } from '../lib/time';
import { day, dayFonts } from '../theme/day';

type Input = Omit<ShareInput, 'name' | 'fmt'>;

const SEG_COLOR: Record<SegmentKind, string> = {
  crying: day.coral,
  asleep: day.plum,
  settling: day.settling,
  feeding: day.feeding,
};

export function ShareProgressButton({ input, name }: { input: Input; name: string }) {
  const [open, setOpen] = useState(false);
  const preview = shareCard({ ...input, fmt: formatClock });
  // Every morning can be shared; a clearly good run gets the bolder button.
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={[styles.entry, preview.celebrate && styles.entryBold]}
      >
        <Text style={[styles.entryText, preview.celebrate && styles.entryTextBold]}>
          {preview.celebrate ? 'Share this progress' : 'Share last night'}
        </Text>
      </Pressable>
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <ShareSheet input={input} name={name} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function ShareSheet({ input, name, onClose }: { input: Input; name: string; onClose: () => void }) {
  const [withName, setWithName] = useState(!!name.trim());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const card = shareCard({ ...input, name: withName ? name : '', fmt: formatClock });

  const share = async () => {
    setBusy(true);
    setError(null);
    try {
      // 1080 × 1350: a 4:5 image that fits messages and social posts.
      const uri = await captureRef(cardRef, { format: 'png', result: 'tmpfile', width: 1080, height: 1350 });
      await Share.share({ url: uri, message: card.message });
    } catch {
      setError("Couldn't make the image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.sheet}>
      <View style={styles.sheetTop}>
        <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.previewWrap}>
        <View
          ref={cardRef}
          collapsable={false}
          style={styles.card}
          accessible
          accessibilityRole="image"
          accessibilityLabel={card.message.replace(/ Timed with Check In.*$/, '')}
        >
          <Text style={styles.kicker} maxFontSizeMultiplier={1}>
            {card.kicker}
          </Text>
          {card.layout === 'night' ? <NightCard card={card} /> : <ProgressCard card={card} />}
          <View style={styles.footer}>
            <Text style={styles.brand} maxFontSizeMultiplier={1}>
              Check In
            </Text>
            <Text style={styles.site} maxFontSizeMultiplier={1}>
              ferbertimer.com
            </Text>
          </View>
        </View>
      </View>

      {!!name.trim() && (
        <View style={styles.row}>
          <Text style={styles.rowText}>Show {name.trim()}&apos;s name</Text>
          <Switch value={withName} onValueChange={setWithName} trackColor={{ true: day.plum, false: day.line }} />
        </View>
      )}
      <Pressable
        onPress={share}
        disabled={busy}
        accessibilityRole="button"
        style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.8 }]}
      >
        {busy ? <ActivityIndicator color={day.onPlum} /> : <Text style={styles.shareText}>Share</Text>}
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.small}>Only what&apos;s on the card is shared. Nothing is posted for you.</Text>
    </SafeAreaView>
  );
}

/** Nights 1–2: last night in full. */
function NightCard({ card }: { card: ShareCardT }) {
  const segs = card.segments;
  const start = segs[0]?.from ?? 0;
  const span = Math.max(1, (segs[segs.length - 1]?.to ?? start) - start);
  return (
    <>
      <Text style={[styles.label, { marginTop: 10 }]} maxFontSizeMultiplier={1}>
        Crying last night
      </Text>
      <Text style={styles.big} maxFontSizeMultiplier={1} adjustsFontSizeToFit numberOfLines={1}>
        {card.headline}
      </Text>
      {card.delta && (
        <Text style={styles.delta} maxFontSizeMultiplier={1}>
          {card.delta}
        </Text>
      )}
      <View style={styles.grid}>
        {card.stats.map((st) => (
          <View key={st.label} style={styles.gridCell}>
            <Text style={styles.label} maxFontSizeMultiplier={1}>
              {st.label}
            </Text>
            <Text style={styles.statValue} maxFontSizeMultiplier={1} adjustsFontSizeToFit numberOfLines={1}>
              {st.value}
            </Text>
          </View>
        ))}
      </View>
      {segs.length > 0 && (
        <View style={{ marginTop: 'auto' }}>
          <View style={styles.timeRow}>
            <Text style={styles.label} maxFontSizeMultiplier={1}>
              {card.from}
            </Text>
            <Text style={styles.label} maxFontSizeMultiplier={1}>
              {card.to}
            </Text>
          </View>
          <View style={styles.strip}>
            {segs.map((sg: Segment, i) => (
              <View key={i} style={{ flex: (sg.to - sg.from) / span, minWidth: 2, backgroundColor: SEG_COLOR[sg.kind] }} />
            ))}
          </View>
        </View>
      )}
    </>
  );
}

/** Night 3 on: every night of the round, last night's numbers underneath. */
function ProgressCard({ card }: { card: ShareCardT }) {
  const max = Math.max(...card.bars.map((b) => b.cryingMinutes), 1);
  return (
    <>
      <Text style={styles.headline} maxFontSizeMultiplier={1}>
        {card.headline}
      </Text>
      <View style={styles.chart}>
        {card.bars.map((b, i) => {
          const lastBar = i === card.bars.length - 1;
          return (
            <View key={`${b.nightNumber}-${i}`} style={styles.col}>
              <Text style={[styles.colValue, lastBar && styles.colValueLast]} maxFontSizeMultiplier={1} numberOfLines={1}>
                {formatMinutesShort(b.cryingMinutes)}
              </Text>
              <View
                style={[
                  styles.barFill,
                  { height: Math.max(4, (b.cryingMinutes / max) * 95) },
                  lastBar && { backgroundColor: day.plum },
                ]}
              />
              <Text style={styles.colLabel} maxFontSizeMultiplier={1}>
                {b.nightNumber}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.chips}>
        {card.stats.map((st) => (
          <View key={st.label} style={styles.chip}>
            <Text style={styles.chipLabel} maxFontSizeMultiplier={1} numberOfLines={1}>
              {st.label}
            </Text>
            <Text style={styles.chipValue} maxFontSizeMultiplier={1} adjustsFontSizeToFit numberOfLines={1}>
              {st.value}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  entry: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999, backgroundColor: day.card },
  entryText: { color: day.plum, fontFamily: dayFonts.bold, fontSize: 16 },
  entryBold: { backgroundColor: day.plum },
  entryTextBold: { color: day.onPlum },
  sheet: { flex: 1, backgroundColor: day.bg, paddingHorizontal: 22 },
  sheetTop: { height: 48, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  close: { color: day.plum, fontFamily: dayFonts.bold, fontSize: 17 },
  previewWrap: { alignItems: 'center', marginTop: 4 },
  // Drawn at 288 × 360 (4:5) and captured at 1080 × 1350.
  card: { width: 288, height: 360, borderRadius: 28, backgroundColor: day.card, padding: 22, overflow: 'hidden' },
  kicker: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 12.5 },
  label: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 10.5 },
  big: { color: day.plum, fontFamily: dayFonts.display, fontSize: 48, letterSpacing: -1.5, lineHeight: 52 },
  delta: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  gridCell: { width: 119, backgroundColor: day.bg, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 9 },
  statValue: { color: day.plum, fontFamily: dayFonts.display, fontSize: 18, letterSpacing: -0.3 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  strip: { height: 10, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', gap: 1.5, marginTop: 4 },
  headline: {
    color: day.plum,
    fontFamily: dayFonts.display,
    fontSize: 23,
    lineHeight: 27,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, marginTop: 'auto' },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  colValue: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 9.5, marginBottom: 4 },
  colValueLast: { color: day.plum, fontSize: 11 },
  barFill: { width: 22, borderRadius: 7, backgroundColor: day.coralSoft },
  colLabel: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 10.5, marginTop: 5 },
  chips: { flexDirection: 'row', gap: 5, marginTop: 10 },
  chip: { flex: 1, backgroundColor: day.bg, borderRadius: 11, paddingVertical: 6, alignItems: 'center' },
  chipLabel: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 9 },
  chipValue: { color: day.plum, fontFamily: dayFonts.display, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: day.line,
  },
  brand: { color: day.plum, fontFamily: dayFonts.display, fontSize: 14 },
  site: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 },
  rowText: { color: day.text, fontFamily: dayFonts.medium, fontSize: 16 },
  shareBtn: {
    marginTop: 20,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: day.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { color: day.onPlum, fontFamily: dayFonts.display, fontSize: 18 },
  error: { color: day.coral, fontFamily: dayFonts.bold, fontSize: 14, textAlign: 'center', marginTop: 10 },
  small: { color: day.dim, fontFamily: dayFonts.regular, fontSize: 13, textAlign: 'center', marginTop: 12 },
});
