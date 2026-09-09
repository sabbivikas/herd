import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, spacing } from '../../theme';
import type { FeedVideo } from './types';

// Bottom-left overlay: artist, @handle, track title, genre tag.
export function FeedOverlay({ video }: { video: FeedVideo }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.artist}>{video.artistName}</Text>
      <Text style={styles.handle}>@{video.artistHandle}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {video.title}
      </Text>
      {video.genreSlug && (
        <View style={styles.genreTag}>
          <Text style={styles.genreText}>{video.genreSlug}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    bottom: 96,
    right: 96,
  },
  artist: { color: colors.text, fontSize: fontSizes.lg, fontWeight: '700' },
  handle: { color: colors.textMuted, fontSize: fontSizes.sm, marginTop: 2 },
  title: { color: colors.text, fontSize: fontSizes.md, marginTop: spacing.sm },
  genreTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  genreText: { color: colors.text, fontSize: fontSizes.xs, fontWeight: '600' },
});
