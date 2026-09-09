import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { backendReady, enterDemo } = useAuth();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.logo}>HERD</Text>
        <Text style={styles.tagline}>Music videos by indie artists.{'\n'}Hearts decide the charts.</Text>
      </View>
      <View style={styles.actions}>
        <Button title="Create account" onPress={() => navigation.navigate('EmailAuth', { mode: 'signup' })} />
        <View style={{ height: spacing.sm }} />
        <Button
          title="Sign in"
          variant="outline"
          onPress={() => navigation.navigate('EmailAuth', { mode: 'signin' })}
        />
        {!backendReady && (
          <>
            <View style={{ height: spacing.md }} />
            <Button title="Preview the app (demo mode)" variant="ghost" onPress={enterDemo} />
            <Text style={styles.demoNote}>Staging backend not connected yet - demo data only.</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { color: colors.text, fontSize: fontSizes.hero, fontWeight: '800', letterSpacing: 8 },
  tagline: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
  },
  actions: { paddingBottom: spacing.lg },
  demoNote: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
