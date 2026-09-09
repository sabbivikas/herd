import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { colors, fontSizes, spacing } from '../../theme';

// Demo posts; reads news_posts (markdown body rendered in-app) from week 8.
const DEMO_POSTS = [
  { id: '1', title: 'Welcome to Herd', date: 'Sep 2026', excerpt: 'Indie music videos, decided by hearts.' },
  { id: '2', title: 'Artist submissions are open', date: 'Sep 2026', excerpt: 'Know an artist? Send them our way.' },
];

export function NewsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>News</Text>
      <FlatList
        data={DEMO_POSTS}
        keyExtractor={(post) => post.id}
        contentContainerStyle={{ paddingVertical: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.hero} />
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.excerpt}>{item.excerpt}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hero: { height: 120, borderRadius: 12, backgroundColor: colors.surfaceAlt, marginBottom: spacing.md },
  postTitle: { color: colors.text, fontSize: fontSizes.lg, fontWeight: '700' },
  date: { color: colors.textMuted, fontSize: fontSizes.xs, marginTop: 2 },
  excerpt: { color: colors.textMuted, fontSize: fontSizes.sm, marginTop: spacing.sm },
});
