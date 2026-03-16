import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Genanvendelig kontaktkort-komponent.
 *
 * Viser kontaktens navn, relation, og store knapper til "Ring" og "Besked".
 * Designet til ældre med store trykflader og tydelig visuel prioritering.
 *
 * Props:
 * - contact: { name, relation?, phone?, avatar? }
 * - onCall: function(contact) – handler for opkald
 * - onMessage: function(contact) – handler for besked
 */
export default function ContactCard({ contact, onCall, onMessage }) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.card} accessibilityLabel={`Kontakt: ${contact.name}`}>
      {/* Kontaktinfo */}
      <View style={styles.infoRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={typography.h3} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.relation ? (
            <Text style={[typography.bodySmall, styles.relation]} numberOfLines={1}>
              {contact.relation}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Handlingsknapper */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => onCall(contact)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Ring til ${contact.name}`}
        >
          <Ionicons name="call" size={26} color={colors.white} />
          <Text style={styles.callButtonText}>Ring</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onMessage(contact)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Send besked til ${contact.name}`}
        >
          <Ionicons name="chatbubble-outline" size={26} color={colors.primary} />
          <Text style={styles.messageButtonText}>Besked</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  nameBlock: {
    flex: 1,
  },
  relation: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  callButton: {
    backgroundColor: colors.primary,
  },
  callButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
  },
  messageButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  messageButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
});
