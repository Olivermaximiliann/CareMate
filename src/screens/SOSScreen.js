import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, BigButton, Card } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';

const EMERGENCY_CONTACTS = [
  { id: '1', name: 'Pårørende', phone: '+4512345678', icon: 'people-outline' },
  { id: '2', name: 'Læge', phone: '+4587654321', icon: 'medical-outline' },
];

function callNumber(phone, name) {
  const url = `tel:${phone}`;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Kan ikke ringe', `Kunne ikke åbne opkald til ${name}. Prøv igen.`);
    }
  });
}

export default function SOSScreen() {
  const [sosPressed, setSosPressed] = useState(false);

  const handleSOS = () => {
    setSosPressed(true);
    Alert.alert(
      'Nødopkald',
      'Er du sikker på, at du vil ringe 112?',
      [
        {
          text: 'Annullér',
          style: 'cancel',
          onPress: () => setSosPressed(false),
        },
        {
          text: 'Ring 112',
          style: 'destructive',
          onPress: () => {
            callNumber('112', 'Alarmcentralen');
            setSosPressed(false);
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper title="Kontakter og hjælp">
      {/* SOS-knap */}
      <View style={styles.sosContainer}>
        <BigButton
          title="Få hjælp nu – Ring 112"
          icon="warning-outline"
          variant="danger"
          onPress={handleSOS}
          style={styles.sosButton}
        />
        <Text style={[typography.bodySmall, styles.sosHint]}>
          Tryk for at ringe til alarmcentralen
        </Text>
      </View>

      {/* Kontakter */}
      <Text style={[typography.h2, styles.sectionTitle]}>
        Dine kontakter
      </Text>

      {EMERGENCY_CONTACTS.map((contact) => (
        <Card
          key={contact.id}
          title={contact.name}
          description={contact.phone}
          icon={contact.icon}
          iconColor={colors.primary}
          onPress={() => callNumber(contact.phone, contact.name)}
        />
      ))}

      {/* Nyttige numre */}
      <Text style={[typography.h2, styles.sectionTitle]}>
        Nyttige numre
      </Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={28} color={colors.danger} />
          <View style={styles.infoText}>
            <Text style={typography.h3}>112</Text>
            <Text style={typography.bodySmall}>Akut nødsituation</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="medkit" size={28} color={colors.secondary} />
          <View style={styles.infoText}>
            <Text style={typography.h3}>1813</Text>
            <Text style={typography.bodySmall}>Lægevagten (ikke akut)</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={28} color={colors.primary} />
          <View style={styles.infoText}>
            <Text style={typography.h3}>70 201 201</Text>
            <Text style={typography.bodySmall}>Giftlinjen</Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sosContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sosButton: {
    width: '100%',
    minHeight: 88,
    borderRadius: borderRadius.xl,
  },
  sosHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoText: {
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
