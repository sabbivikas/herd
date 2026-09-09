import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function Screen({ children, style, padded = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.body, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
