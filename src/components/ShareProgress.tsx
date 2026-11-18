/**
 * "Share this progress" on the Today screen: a preview of the progress card
 * (Peach & plum), an optional baby's name, and the iOS share sheet with the
 * card as an image. The card is drawn here and captured with
 * react-native-view-shot, so what you see is exactly what's sent.
 */
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { RoundNight, shareCard } from '../lib/shareCard';
import { formatMinutesShort } from '../lib/time';
import { day, dayFonts } from '../theme/day';

export function ShareProgressButton({ round, name }: { round: RoundNight[]; name: string }) {
  const [open, setOpen] = useState(false);
  const preview = shareCard(round);
  if (!preview) return null;
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
        <ShareSheet round={round} name={name} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function ShareSheet({ round, name, onClose }: { round: RoundNight[]; name: string; onClose: () => void }) {
  const [withName, setWithName] = useState(!!name.trim());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const card = shareCard(round, withName ? name : '');
  if (!card) return null;

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

  const max = Math.max(...card.bars.map((b) => b.cryingMinutes), 1);
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
          accessibilityLabel={`${card.headline}. ${card.span}.`}
        >
          <Text style={styles.kicker} maxFontSizeMultiplier={1}>
            {withName && name.trim() ? `${name.trim()} · ${card.span}` : card.span}
          </Text>
          <Text style={styles.headline} maxFontSizeMultiplier={1}>
            {card.headline}
          </Text>
          {card.bars.length === 0 && (
            <View style={styles.single}>
              <Text style={styles.singleValue} maxFontSizeMultiplier={1} adjustsFontSizeToFit numberOfLines={1}>
                {formatMinutesShort(round[round.length - 1].cryingMinutes)}
              </Text>
              <Text style={styles.axis} maxFontSizeMultiplier={1}>
                of crying
              </Text>
            </View>
          )}
          {card.bars.length > 0 && (
            <View style={styles.chart}>
              {card.bars.map((b, i) => {
                const lastBar = i === card.bars.length - 1;
                return (
                  <View key={b.nightNumber} style={styles.col}>
                    <Text style={[styles.colValue, lastBar && styles.colValueLast]} maxFontSizeMultiplier={1}>
                      {formatMinutesShort(b.cryingMinutes)}
                    </Text>
                    <View
                      style={[
                        styles.barFill,
                        { height: Math.max(4, (b.cryingMinutes / max) * 130) },
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
          )}
          {card.bars.length > 0 && (
            <Text style={styles.axis} maxFontSizeMultiplier={1}>
              crying, by night
            </Text>
          )}
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

const styles = StyleSheet.create({
  entry: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999, backgroundColor: day.card },
  entryText: { color: day.plum, fontFamily: dayFonts.bold, fontSize: 16 },
  entryBold: { backgroundColor: day.plum },
  entryTextBold: { color: day.onPlum },
  single: { marginTop: 'auto', alignItems: 'center', paddingBottom: 8 },
  singleValue: { color: day.plum, fontFamily: dayFonts.display, fontSize: 64, letterSpacing: -1.5 },
  sheet: { flex: 1, backgroundColor: day.bg, paddingHorizontal: 22 },
  sheetTop: { height: 48, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  close: { color: day.plum, fontFamily: dayFonts.bold, fontSize: 17 },
  previewWrap: { alignItems: 'center', marginTop: 4 },
  // Drawn at 288 × 360 (4:5) and captured at 1080 × 1350.
  card: { width: 288, height: 360, borderRadius: 28, backgroundColor: day.card, padding: 22, overflow: 'hidden' },
  kicker: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 12.5 },
  headline: {
    color: day.plum,
    fontFamily: dayFonts.display,
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 196, marginTop: 'auto' },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  colValue: { color: day.dim, fontFamily: dayFonts.bold, fontSize: 10, marginBottom: 4 },
  colValueLast: { color: day.plum, fontSize: 13 },
  barFill: { width: 22, borderRadius: 8, backgroundColor: day.coralSoft },
  colLabel: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 11, marginTop: 6 },
  axis: { color: day.dim, fontFamily: dayFonts.medium, fontSize: 11, textAlign: 'center', marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
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
