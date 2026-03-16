import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Genanvendelig medicinkort-komponent.
 *
 * Props:
 * - name: string           – Medicinens navn
 * - time: string           – Planlagt tidspunkt ('HH:MM')
 * - dosage: string | null  – Valgfri dosering
 * - status: object         – Status-objekt fra medicineStorage (STATUS.taken/upcoming/missed)
 * - onTake: function       – Kaldes når "Jeg har taget den" trykkes
 * - onUndo: function       – Kaldes for at fortryde registrering
 * - onLongPress: function  – Valgfri long-press handler (f.eks. slet)
 */
export default function MedicineCard({
  name,
  time,
  dosage,
  status,
  onTake,
  onUndo,
  onLongPress,
}) {
  const isTaken = status.key === 'taken';

  return (
    <View
      style={[styles.card, isTaken && styles.cardTaken]}
      accessibilityRole="summary"
      accessibilityLabel={`${name}, klokken ${time}, ${status.label}`}
    >
      {/* Status-badge øverst */}
      <View style={[styles.statusBadge, { backgroundColor: status.lightColor }]}>
        <Ionicons name={status.icon} size={22} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>

      {/* Medicin-info */}
      <View style={styles.infoSection}>
        <View style={[styles.iconCircle, { backgroundColor: isTaken ? status.lightColor : colors.primaryLight }]}>
          <Ionicons
            name="medkit"
            size={32}
            color={isTaken ? status.color : colors.primary}
          />
        </View>
        <View style={styles.textSection}>
          <Text style={[typography.h3, isTaken && styles.takenName]}>
            {name}
          </Text>
          <Text style={[typography.body, styles.timeText]}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            {'  '}Kl. {time}
          </Text>
          {dosage && (
            <Text style={[typography.bodySmall, styles.dosageText]}>
              {dosage}
            </Text>
          )}
        </View>
      </View>

      {/* Handlingsknap */}
      {!isTaken ? (
        <TouchableOpacity
          style={styles.takeButton}
          onPress={onTake}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Markér ${name} som taget`}
        >
          <Ionicons name="checkmark-circle-outline" size={28} color={colors.white} />
          <Text style={styles.takeButtonText}>Jeg har taget den</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.undoButton}
          onPress={onUndo}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Fortryd registrering af ${name}`}
        >
          <Ionicons name="arrow-undo-outline" size={22} color={colors.primary} />
          <Text style={styles.undoButtonText}>Fortryd</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardTaken: {
    backgroundColor: '#F8FBF9',
    elevation: 1,
    shadowOpacity: 0.08,
  },

  // Status-badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },

  // Medicin-info
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textSection: {
    flex: 1,
  },
  timeText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dosageText: {
    marginTop: spacing.xs,
  },
  takenName: {
    color: colors.textSecondary,
  },

  // Handlingsknapper
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  takeButtonText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  undoButtonText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
