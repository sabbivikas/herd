import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { colors, fontSizes, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import { getSupabase } from '../../lib/supabase';

// Artist path only: bio, banner, external links. After this, onboarding is done.
export function ArtistExtrasScreen() {
  const { session, refreshProfile } = useAuth();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [links, setLinks] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const supabase = getSupabase();
    if (!supabase || !session) return;
    setBusy(true);
    const parsedLinks = links
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((url) => ({ label: url.replace(/^https?:\/\//, '').split('/')[0], url }));
    const { error: err } = await supabase.from('artist_profiles').upsert({
      user_id: session.userId,
      bio: bio.trim(),
      location_text: location.trim(),
      external_links: parsedLinks,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await refreshProfile();
    // RootNavigator sees the complete profile and swaps to the feed.
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Artist profile</Text>
        <TextField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell listeners who you are"
          multiline
        />
        <TextField label="Location (display only)" value={location} onChangeText={setLocation} placeholder="City, country" />
        <TextField
          label="Links (one per line)"
          value={links}
          onChangeText={setLinks}
          placeholder={'https://instagram.com/you\nhttps://your.site'}
          autoCapitalize="none"
          multiline
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Finish setup" onPress={submit} loading={busy} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', marginBottom: spacing.lg },
  error: { color: colors.danger, fontSize: fontSizes.sm, marginBottom: spacing.md },
});
