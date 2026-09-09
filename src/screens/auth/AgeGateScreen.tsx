import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { colors, fontSizes, spacing } from '../../theme';
import { isOldEnough, MIN_AGE } from '../../lib/age';
import { useAuth } from '../../state/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'AgeGate'>;

const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function AgeGateScreen({ navigation, route }: Props) {
  const { email, password } = route.params;
  const { signUp } = useAuth();
  const [dob, setDob] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!DOB_PATTERN.test(dob)) {
      setError('Use the format YYYY-MM-DD.');
      return;
    }
    const parsed = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      setError('That date does not look right.');
      return;
    }
    if (!isOldEnough(parsed)) {
      navigation.replace('Blocked');
      return;
    }
    setBusy(true);
    const err = await signUp(email, password, dob);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    navigation.replace('VerifyEmail', { email });
  }

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Your date of birth</Text>
        <Text style={styles.sub}>Herd is {MIN_AGE}+ only.</Text>
        <TextField
          label="Date of birth"
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Create account" onPress={submit} loading={busy} disabled={dob.length === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center' },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: fontSizes.md, marginTop: spacing.xs, marginBottom: spacing.lg },
  error: { color: colors.danger, fontSize: fontSizes.sm, marginBottom: spacing.md },
});
