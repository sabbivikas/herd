import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes } from '../theme';

// Restores the session; RootNavigator swaps this for auth, onboarding,
// or the feed as soon as the session state resolves.
export function SplashScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>HERD</Text>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 24 },
  logo: { color: colors.text, fontSize: fontSizes.hero, fontWeight: '800', letterSpacing: 8 },
});
