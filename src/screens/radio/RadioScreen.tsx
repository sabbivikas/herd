import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/Screen';
import { colors, fontSizes, spacing } from '../../theme';
import { isRadioPlaying, pauseRadio, playRadio } from '../../features/radio/radioService';

// Week-1 spike: play/pause with background audio + lock-screen controls.
// Now-playing metadata and the persistent mini-player land in week 6.
export function RadioScreen() {
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    if (playing) {
      await pauseRadio();
      setPlaying(false);
    } else {
      await playRadio();
      setPlaying(await isRadioPlaying().catch(() => true));
      setPlaying(true);
    }
  }

  return (
    <Screen>
      <View style={styles.body}>
        <View style={styles.artwork}>
          <Ionicons name="radio" size={72} color={colors.accent} />
        </View>
        <Text style={styles.station}>Herd Radio</Text>
        <Text style={styles.nowPlaying}>Live - indie rotation</Text>
        <Pressable onPress={toggle} style={styles.playButton} accessibilityRole="button">
          <Ionicons name={playing ? 'pause' : 'play'} size={40} color={colors.text} />
        </Pressable>
        <Text style={styles.note}>Keeps playing with the screen off. Pauses when a feed video plays.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  station: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700' },
  nowPlaying: { color: colors.textMuted, fontSize: fontSizes.md, marginTop: spacing.xs },
  playButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  note: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
