import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';

const STATUS_BADGES = ['processing', 'live', 'rejected', 'taken_down'] as const;

export function YouScreen() {
  const { profile, signOut } = useAuth();
  const isArtist = profile?.user_type === 'artist';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.banner} />
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.textMuted} />
          </View>
        </View>
        <Text style={styles.name}>{profile?.display_name ?? 'Your profile'}</Text>
        <Text style={styles.handle}>@{profile?.handle ?? 'handle'}</Text>
        <Text style={styles.hearts}>0 total hearts</Text>

        {isArtist && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Videos</Text>
              <View style={styles.uploadBadge}>
                <Text style={styles.uploadText}>Upload (week 2)</Text>
              </View>
            </View>
            <View style={styles.badges}>
              {STATUS_BADGES.map((s) => (
                <View key={s} style={styles.badge}>
                  <Text style={styles.badgeText}>{s}</Text>
                </View>
              ))}
            </View>
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.gridCell} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button title="Edit profile" variant="outline" onPress={() => {}} disabled />
          <View style={{ height: spacing.sm }} />
          <Button title="Sign out" variant="ghost" onPress={() => void signOut()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { height: 110, borderRadius: 16, backgroundColor: colors.surfaceAlt, marginTop: spacing.md },
  avatarWrap: { alignItems: 'center', marginTop: -36 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: fontSizes.lg, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm },
  handle: { color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center', marginTop: 2 },
  hearts: { color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center', marginTop: spacing.sm },
  section: { marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: fontSizes.md, fontWeight: '700' },
  uploadBadge: { backgroundColor: colors.surfaceAlt, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  uploadText: { color: colors.textMuted, fontSize: fontSizes.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  badge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: spacing.xs,
  },
  badgeText: { color: colors.textMuted, fontSize: fontSizes.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: spacing.sm },
  gridCell: { width: '48%', aspectRatio: 9 / 14, borderRadius: 12, backgroundColor: colors.surface },
  actions: { marginTop: spacing.xl },
});
