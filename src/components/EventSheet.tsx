/**
 * Bottom sheet for fixing a logged tap (change its time or delete it) or
 * adding one that was missed. Daytime screen, so a confirm on delete is fine.
 */
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { EventType } from '../lib/session';
import { atTimeInNight } from '../lib/time';
import { colors, fonts, type } from '../theme/night';

export const EVENT_LABEL: Record<EventType, string> = {
  down: 'Down for the night',
  cry: 'Started crying',
  quiet: 'Stopped crying',
  feed_start: 'Started night feed',
  feed_end: 'Done feeding',
  woke: 'Woke up',
  check_in_start: 'Went in',
  check_in_end: 'Came out',
  asleep: 'Asleep',
};

const ADD_ORDER: EventType[] = ['down', 'cry', 'quiet', 'check_in_start', 'check_in_end', 'feed_start', 'feed_end', 'asleep', 'woke'];

interface Props {
  visible: boolean;
  mode: 'edit' | 'add';
  nightKey: string;
  initialType: EventType;
  initialAt: number;
  onSave: (type: EventType, at: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function EventSheet(props: Props) {
  const [kind, setKind] = useState<EventType>(props.initialType);
  const [time, setTime] = useState(() => new Date(props.initialAt));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => props.onSave(kind, atTimeInNight(props.nightKey, time.getHours(), time.getMinutes()));

  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <Pressable style={styles.backdrop} onPress={props.onClose} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <Text style={styles.title}>{props.mode === 'add' ? 'Add a missed tap' : EVENT_LABEL[kind]}</Text>

        {props.mode === 'add' && (
          <View style={styles.chips}>
            {ADD_ORDER.map((t) => (
              <Pressable
                key={t}
                onPress={() => setKind(t)}
                accessibilityRole="button"
                accessibilityState={{ selected: kind === t }}
                style={[styles.chip, kind === t && styles.chipOn]}
              >
                <Text style={[styles.chipText, kind === t && styles.chipTextOn]}>{EVENT_LABEL[t]}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <DateTimePicker
          value={time}
          mode="time"
          display="spinner"
          themeVariant="dark"
          textColor={colors.text}
          minuteInterval={1}
          onChange={(_, d) => d && setTime(d)}
          style={{ alignSelf: 'stretch' }}
        />

        <View style={styles.row}>
          <Pressable onPress={props.onClose} style={[styles.btn, styles.btnSecondary]} accessibilityRole="button">
            <Text style={styles.btnSecondaryText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={save} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
            <Text style={styles.btnPrimaryText}>Save</Text>
          </Pressable>
        </View>

        {props.onDelete && (
          <Pressable
            onPress={() => (confirmDelete ? props.onDelete?.() : setConfirmDelete(true))}
            style={styles.delete}
            accessibilityRole="button"
          >
            <Text style={styles.deleteText}>{confirmDelete ? 'Tap again to delete' : 'Delete this tap'}</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: type.big, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.buttonBg },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  chipTextOn: { color: colors.onPrimary },
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.buttonBg },
  btnPrimaryText: { color: colors.onPrimary, fontFamily: fonts.extrabold, fontSize: 18 },
  btnSecondaryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
  delete: { alignSelf: 'center', padding: 12 },
  deleteText: { color: colors.accent, fontFamily: fonts.bold, fontSize: type.body },
});
