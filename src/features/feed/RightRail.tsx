import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSizes, spacing } from '../../theme';

type Props = {
  hearted: boolean;
  heartCount: number;
  onHeart: () => void;
  onShare: () => void;
};

// Right rail: heart with count, share. Long-press options live on the video.
export function RightRail({ hearted, heartCount, onHeart, onShare }: Props) {
  return (
    <View style={styles.rail}>
      <Pressable onPress={onHeart} style={styles.action} accessibilityRole="button" accessibilityLabel="Heart">
        <Ionicons
          name={hearted ? 'heart' : 'heart-outline'}
          size={34}
          color={hearted ? colors.accent : colors.text}
        />
        <Text style={styles.count}>{formatCount(heartCount)}</Text>
      </Pressable>
      <Pressable onPress={onShare} style={styles.action} accessibilityRole="button" accessibilityLabel="Share">
        <Ionicons name="share-social-outline" size={30} color={colors.text} />
      </Pressable>
    </View>
  );
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(count);
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: spacing.sm,
    bottom: 120,
    alignItems: 'center',
  },
  action: { alignItems: 'center', marginBottom: spacing.lg, padding: spacing.xs },
  count: { color: colors.text, fontSize: fontSizes.xs, marginTop: 2 },
});
