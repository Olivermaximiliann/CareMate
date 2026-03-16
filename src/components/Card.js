import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function Card({ title, description, icon, iconColor, onPress, style }) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={title}
    >
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primary) + '15' }]}>
          <Ionicons name={icon} size={36} color={iconColor || colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={typography.h3}>{title}</Text>
        {description && (
          <Text style={[typography.bodySmall, styles.description]}>{description}</Text>
        )}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={28} color={colors.textSecondary} />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: spacing.xs,
  },
});
