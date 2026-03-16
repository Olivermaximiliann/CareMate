import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Genanvendelig komponent der viser forslag som store trykbare chips.
 *
 * Props:
 * - suggestions: Array af { id, text, icon }
 * - onSelect: function(suggestion) – kaldes når et forslag vælges
 * - visible: boolean – om komponenterne skal vises
 */
export default function SuggestionChips({ suggestions, onSelect, visible = true }) {
  if (!visible || !suggestions || suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[typography.bodySmall, styles.label]}>
        Prøv at spørge om:
      </Text>
      <View style={styles.chipGrid}>
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.chip}
            onPress={() => onSelect(suggestion)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={suggestion.text}
          >
            {suggestion.icon && (
              <Ionicons
                name={suggestion.icon}
                size={22}
                color={colors.primary}
                style={styles.chipIcon}
              />
            )}
            <Text style={styles.chipText} numberOfLines={2}>
              {suggestion.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: '48%',
    minHeight: 52,
  },
  chipIcon: {
    marginRight: spacing.xs,
    flexShrink: 0,
  },
  chipText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
    flexShrink: 1,
  },
});
