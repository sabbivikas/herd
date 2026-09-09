import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { Chip } from '../../components/Chip';
import { colors, fontSizes, spacing } from '../../theme';

type ChartRow = { rank: number; title: string; artist: string; movement: 'up' | 'down' | 'new' };

// Demo rows; the real chart reads the cached materialized view (week 4) -
// never computed on open.
const DEMO_ROWS: ChartRow[] = [
  { rank: 1, title: 'Backseat Confessions', artist: 'Juno V', movement: 'up' },
  { rank: 2, title: 'Baila Conmigo', artist: 'Sol Marín', movement: 'new' },
  { rank: 3, title: 'Midnight Static', artist: 'Nova Ray', movement: 'down' },
  { rank: 4, title: 'Gravel Road', artist: 'The Hollow Pines', movement: 'up' },
  { rank: 5, title: 'Neon Communion', artist: 'Nova Ray', movement: 'new' },
];

const MARKERS = { up: '▲', down: '▼', new: 'NEW' } as const;

export function ChartsScreen() {
  const [scope, setScope] = useState('Top 25');

  return (
    <Screen>
      <Text style={styles.title}>Charts</Text>
      <View style={styles.scopes}>
        {['Top 25', 'Hip-Hop', 'Electronic', 'Latin'].map((s) => (
          <Chip key={s} label={s} selected={scope === s} onPress={() => setScope(s)} />
        ))}
      </View>
      <FlatList
        data={DEMO_ROWS}
        keyExtractor={(row) => String(row.rank)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{item.rank}</Text>
            <View style={styles.thumb} />
            <View style={styles.meta}>
              <Text style={styles.track}>{item.title}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
            </View>
            <Text
              style={[
                styles.movement,
                item.movement === 'up' && { color: colors.success },
                item.movement === 'down' && { color: colors.danger },
                item.movement === 'new' && { color: colors.accentAlt },
              ]}
            >
              {MARKERS[item.movement]}
            </Text>
          </View>
        )}
      />
      <Text style={styles.note}>Hourly refresh. Search and genre feeds land in week 5.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', marginTop: spacing.md },
  scopes: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rank: { color: colors.textMuted, fontSize: fontSizes.lg, width: 32, fontWeight: '700' },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.surfaceAlt },
  meta: { flex: 1, marginLeft: spacing.md },
  track: { color: colors.text, fontSize: fontSizes.md, fontWeight: '600' },
  artist: { color: colors.textMuted, fontSize: fontSizes.sm, marginTop: 2 },
  movement: { fontSize: fontSizes.sm, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: fontSizes.xs, textAlign: 'center', paddingVertical: spacing.md },
});
