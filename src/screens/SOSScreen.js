import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, BigButton, ContactCard } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';

// ---------------------------------------------------------------------------
// Kontaktdata
//
// Datastrukturen er designet til at kunne udvides med:
// - type: 'family' | 'medical' | 'homecare' | 'emergency'
// - priority: til sortering og fremhævning
// - availability: til fremtidig visning af tilgængelighed
// - avatar: til profilbilleder
// ---------------------------------------------------------------------------

const CONTACTS = [
  {
    id: '1',
    name: 'Anna Jensen',
    relation: 'Datter',
    phone: '+4512345678',
    type: 'family',
    priority: 1,
  },
  {
    id: '2',
    name: 'Erik Jensen',
    relation: 'Søn',
    phone: '+4587654321',
    type: 'family',
    priority: 2,
  },
  {
    id: '3',
    name: 'Dr. Møller',
    relation: 'Egen læge',
    phone: '+4555667788',
    type: 'medical',
    priority: 3,
  },
];

// ---------------------------------------------------------------------------
// Nyttige numre
// ---------------------------------------------------------------------------

const USEFUL_NUMBERS = [
  {
    id: 'sos',
    number: '112',
    label: 'Akut nødsituation',
    icon: 'call',
    iconColor: colors.danger,
  },
  {
    id: 'doctor',
    number: '1813',
    label: 'Lægevagten (ikke akut)',
    icon: 'medkit',
    iconColor: colors.secondary,
  },
  {
    id: 'poison',
    number: '70 201 201',
    label: 'Giftlinjen',
    icon: 'information-circle',
    iconColor: colors.primary,
  },
];

// ---------------------------------------------------------------------------
// Hjælpefunktioner
// ---------------------------------------------------------------------------

function openPhone(phone, name) {
  const url = `tel:${phone}`;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        'Kan ikke ringe',
        `Kunne ikke åbne opkald til ${name}. Prøv igen.`
      );
    }
  });
}

function openSMS(phone, name) {
  const url = `sms:${phone}`;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        'Kan ikke sende besked',
        `Kunne ikke åbne besked til ${name}. Prøv igen.`
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Skærm
// ---------------------------------------------------------------------------

export default function SOSScreen() {
  const handleSOS = () => {
    Alert.alert(
      'Få hjælp nu',
      'Hvem vil du kontakte?',
      [
        {
          text: 'Ring 112 (nødopkald)',
          style: 'destructive',
          onPress: () => openPhone('112', 'Alarmcentralen'),
        },
        {
          text: 'Ring til pårørende',
          onPress: () => {
            const first = CONTACTS.find((c) => c.type === 'family');
            if (first) openPhone(first.phone, first.name);
          },
        },
        { text: 'Annullér', style: 'cancel' },
      ]
    );
  };

  const handleCall = (contact) => {
    openPhone(contact.phone, contact.name);
  };

  const handleMessage = (contact) => {
    openSMS(contact.phone, contact.name);
  };

  const handleUsefulNumber = (entry) => {
    const cleanNumber = entry.number.replace(/\s/g, '');
    openPhone(cleanNumber, entry.label);
  };

  return (
    <ScreenWrapper title="Kontakter og hjælp">
      {/* Få hjælp nu */}
      <View style={styles.sosContainer}>
        <BigButton
          title="Få hjælp nu"
          icon="hand-left-outline"
          variant="danger"
          onPress={handleSOS}
          style={styles.sosButton}
        />
        <Text style={[typography.caption, styles.sosHint]}>
          Ring 112 eller kontakt en pårørende
        </Text>
      </View>

      {/* Betroede kontakter */}
      <Text style={[typography.h2, styles.sectionTitle]}>
        Dine kontakter
      </Text>

      {CONTACTS.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onCall={handleCall}
          onMessage={handleMessage}
        />
      ))}

      {/* Nyttige numre */}
      <Text style={[typography.h2, styles.sectionTitle]}>
        Nyttige numre
      </Text>

      <View style={styles.numbersCard}>
        {USEFUL_NUMBERS.map((entry, index) => (
          <React.Fragment key={entry.id}>
            {index > 0 && <View style={styles.divider} />}
            <TouchableOpacity
              style={styles.numberRow}
              onPress={() => handleUsefulNumber(entry)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Ring ${entry.number}, ${entry.label}`}
            >
              <Ionicons name={entry.icon} size={30} color={entry.iconColor} />
              <View style={styles.numberInfo}>
                <Text style={typography.h3}>{entry.number}</Text>
                <Text style={typography.bodySmall}>{entry.label}</Text>
              </View>
              <Ionicons name="call-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </ScreenWrapper>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Få hjælp nu
  sosContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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

  // Sektioner
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  // Nyttige numre
  numbersCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 64,
  },
  numberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
