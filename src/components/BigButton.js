import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function BigButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  style,
}) {
  const bgColor = {
    primary: colors.primary,
    danger: colors.danger,
    secondary: colors.white,
  }[variant];

  const textColor = variant === 'secondary' ? colors.primary : colors.white;
  const borderColor = variant === 'secondary' ? colors.primary : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor },
        variant === 'secondary' && styles.outlined,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={30}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text style={[typography.button, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    minHeight: 72,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  outlined: {
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  icon: {
    marginRight: spacing.sm,
  },
});
