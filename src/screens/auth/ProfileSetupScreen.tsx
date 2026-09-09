import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Chip } from '../../components/Chip';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProfileSetup'>;

const HANDLE_PATTERN = /^[a-z0-9_]{3,24}$/;

export function ProfileSetupScreen({ navigation }: Props) {
  const { saveProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [userType, setUserType] = useState<'listener' | 'artist'>('listener');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!HANDLE_PATTERN.test(handle)) {
      setError('Handle: 3-24 chars, lowercase letters, numbers, underscores.');
      return;
    }
    setBusy(true);
    const err = await saveProfile({
      display_name: displayName.trim(),
      handle: handle.trim().toLowerCase(),
      user_type: userType,
    });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    navigation.navigate('LocationGenres', { userType });
  }

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Set up your profile</Text>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="How you appear on Herd" />
        <TextField
          label="Handle"
          value={handle}
          onChangeText={setHandle}
          placeholder="@handle"
          autoCapitalize="none"
        />
        <Text style={styles.sectionLabel}>I am here as a</Text>
        <View style={styles.chips}>
          <Chip label="Listener" selected={userType === 'listener'} onPress={() => setUserType('listener')} />
          <Chip label="Artist" selected={userType === 'artist'} onPress={() => setUserType('artist')} />
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title="Continue"
          onPress={submit}
          loading={busy}
          disabled={displayName.trim().length === 0 || handle.trim().length === 0}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center' },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', marginBottom: spacing.lg },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.sm, marginBottom: spacing.xs },
  chips: { flexDirection: 'row', marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: fontSizes.sm, marginBottom: spacing.md },
});
