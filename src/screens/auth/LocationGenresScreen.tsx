import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Chip } from '../../components/Chip';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LocationGenres'>;

// TEMP placeholder list until Mario's genre taxonomy lands (week 2); mirrors supabase/seed.sql.
const GENRES = ['Hip-Hop', 'R&B', 'Pop', 'Electronic', 'Afrobeats', 'Latin', 'Country', 'Rock'];

export function LocationGenresScreen({ navigation, route }: Props) {
  const { userType } = route.params;
  const { session, saveProfile } = useAuth();
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(genre: string) {
    setPicked((cur) => (cur.includes(genre) ? cur.filter((g) => g !== genre) : [...cur, genre]));
  }

  async function submit() {
    setError(null);
    setBusy(true);
    const err = await saveProfile({ country: country.trim(), region: region.trim() });
    if (!err && session) {
      // The approved schema has no user-genre-preferences table yet (flagged
      // as a schema gap). Stored locally until the contract is extended.
      await AsyncStorage.setItem(`genre_prefs:${session.userId}`, JSON.stringify(picked));
    }
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (userType === 'artist') {
      navigation.navigate('ArtistExtras');
    }
    // Listeners fall through: profile is complete, RootNavigator swaps to the feed.
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Where are you, and what do you listen to?</Text>
        <TextField label="Country" value={country} onChangeText={setCountry} placeholder="Country" />
        <TextField label="Region / state" value={region} onChangeText={setRegion} placeholder="Region (no precise location)" />
        <Text style={styles.sectionLabel}>Genres you are into</Text>
        <View style={styles.chips}>
          {GENRES.map((g) => (
            <Chip key={g} label={g} selected={picked.includes(g)} onPress={() => toggle(g)} />
          ))}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={userType === 'artist' ? 'Continue' : 'Start watching'}
          onPress={submit}
          loading={busy}
          disabled={country.trim().length === 0 || picked.length === 0}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', marginBottom: spacing.lg },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.sm, marginBottom: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: fontSizes.sm, marginBottom: spacing.md },
});
