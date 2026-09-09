import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled }: Props) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'outline' && styles.outline,
        pressed && !off && styles.pressed,
        off && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.text : colors.accent} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'outline' && { color: colors.text },
            variant === 'ghost' && { color: colors.textMuted },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: colors.accent },
  ghost: { backgroundColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { color: colors.text, fontSize: fontSizes.md, fontWeight: '600' },
});
