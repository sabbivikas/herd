import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ route }: Props) {
  const { email } = route.params;
  const { resendConfirmation, refreshProfile } = useAuth();

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.sub}>
          We sent a confirmation link to {email}. Tap it, then come back here.
        </Text>
        <Button title="I've confirmed my email" onPress={() => refreshProfile()} />
        <View style={{ height: spacing.sm }} />
        <Button title="Resend link" variant="outline" onPress={() => resendConfirmation(email)} />
        <View style={{ height: spacing.sm }} />
        <Text style={styles.note}>Phone verification is optional and lands in a later week.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center' },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: fontSizes.md, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 22 },
  note: { color: colors.textMuted, fontSize: fontSizes.xs, textAlign: 'center', marginTop: spacing.sm },
});
