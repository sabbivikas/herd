import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      accessibilityRole="button"
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    margin: 4,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { color: colors.textMuted, fontSize: fontSizes.sm },
  selectedLabel: { color: colors.text, fontWeight: '600' },
});
