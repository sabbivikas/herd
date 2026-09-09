import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailAuth'>;

export function EmailAuthScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  async function submit() {
    setError(null);
    if (isSignup) {
      if (password.length < 8) {
        setError('Password needs at least 8 characters.');
        return;
      }
      // Age gate runs before the account is created.
      navigation.navigate('AgeGate', { email: email.trim(), password });
      return;
    }
    setBusy(true);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={isSignup ? 'Continue' : 'Sign in'}
          onPress={submit}
          loading={busy}
          disabled={!email.includes('@') || password.length === 0}
        />
        <View style={{ height: spacing.md }} />
        {/* Apple Sign-In button ships alongside email (App Store rule once any
            social login exists); wired in week 2 with expo-apple-authentication. */}
        <Button title="Continue with Apple" variant="outline" onPress={() => {}} disabled />
        <View style={{ height: spacing.sm }} />
        <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center' },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', marginBottom: spacing.lg },
  error: { color: colors.danger, fontSize: fontSizes.sm, marginBottom: spacing.md },
});
