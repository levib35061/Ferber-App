/**
 * Settings home: a baby card on top, then one row per topic with a short
 * description of what's inside.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, SettingsPage, TopicRow } from '../../../components/SettingsUI';
import { useNightStore } from '../../../data/NightStore';
import { ageInMonths } from '../../../lib/time';
import { colors, fonts } from '../../../theme/night';

function syncedAgo(ms: number | null): string {
  if (!ms) return 'not synced yet';
  const min = Math.round((Date.now() - ms) / 60_000);
  return min < 1 ? 'synced just now' : `synced ${min} min ago`;
}

export default function SettingsHome() {
  const { baby, nightNumber, syncStatus } = useNightStore();
  if (!baby) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const months = baby.birthDate ? ageInMonths(baby.birthDate) : null;
  const subtitle = [months != null ? `${months} month${months === 1 ? '' : 's'}` : null, `Night ${nightNumber} of training`]
    .filter(Boolean)
    .join(' · ');
  const partners = Math.max(0, syncStatus.memberCount - 1);
  const partnerDesc = !syncStatus.familyId
    ? 'Invite your partner to share nights'
    : partners > 0
      ? `Shared with ${partners} · ${syncedAgo(syncStatus.lastSyncedAt)}`
      : 'Waiting for your partner to join';

  return (
    <SettingsPage title="Settings" back={false}>
      <Pressable
        onPress={() => router.push('/settings/baby')}
        accessibilityRole="button"
        accessibilityLabel={`${baby.name || 'Your baby'}, ${subtitle}. Edit`}
        style={({ pressed }) => [styles.babyCard, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.avatar}>
          <Icon name="moon" size={30} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.babyName} numberOfLines={1}>
            {baby.name || 'Your baby'}
          </Text>
          <Text style={styles.babySub}>{subtitle}</Text>
        </View>
        <Text style={styles.edit}>Edit</Text>
      </Pressable>

      <TopicRow icon="clock" title="Sleep plan" description="Interval chart, presets, new round" onPress={() => router.push('/settings/plan')} />
      <TopicRow icon="bell" title="Night mode & alerts" description="Sound, vibration, screen, test alert" onPress={() => router.push('/settings/alerts')} />
      <TopicRow icon="people" title="Partner sharing" description={partnerDesc} onPress={() => router.push('/settings/partner')} />
      <TopicRow icon="info" title="Help & about" description="How it works, privacy, contact" onPress={() => router.push('/settings/about')} />
      {__DEV__ && (
        <TopicRow icon="flask" title="Testing" description="Sample week, erase nights (development only)" onPress={() => router.push('/settings/testing')} />
      )}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  babyCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.surface, borderRadius: 26, padding: 20, marginBottom: 18 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.buttonBg, alignItems: 'center', justifyContent: 'center' },
  babyName: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 24 },
  babySub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 15, marginTop: 2 },
  edit: { color: colors.primary, fontFamily: fonts.bold, fontSize: 15 },
});
