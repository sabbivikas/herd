import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { colors, fontSizes, spacing } from '../../theme';
import { MIN_AGE } from '../../lib/age';

// Hard stop. No child-account flow in v1, so there is nowhere to route to.
export function BlockedScreen() {
  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Herd is {MIN_AGE}+ only</Text>
        <Text style={styles.sub}>You need to be at least {MIN_AGE} years old to use Herd.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: fontSizes.md, marginTop: spacing.sm, textAlign: 'center' },
});
