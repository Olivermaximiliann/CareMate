import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Card } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function HomeScreen({ navigation }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Godmorgen';
    if (hour < 18) return 'God eftermiddag';
    return 'God aften';
  };

  return (
    <ScreenWrapper>
      {/* Indstillinger-knap */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Indstillinger')}
          accessibilityRole="button"
          accessibilityLabel="Åbn indstillinger"
        >
          <Ionicons name="settings-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.greeting}>
        <Ionicons name="sunny-outline" size={44} color={colors.primary} />
        <Text style={[typography.h1, styles.greetingText]}>
          {getGreeting()}!
        </Text>
        <Text style={[typography.body, styles.subtitle]}>
          Hvad kan jeg hjælpe dig med i dag?
        </Text>
      </View>

      <Card
        title="Daglig check-in"
        description="Fortæl os hvordan du har det"
        icon="heart-circle-outline"
        iconColor={colors.warning}
        onPress={() => navigation.navigate('Check-in')}
      />

      <Card
        title="AI-assistent"
        description="Stil spørgsmål eller få hjælp"
        icon="chatbubble-ellipses-outline"
        iconColor={colors.primary}
        onPress={() => navigation.navigate('AI-assistent')}
      />

      <Card
        title="Medicin"
        description="Se dine medicinpåmindelser"
        icon="medkit-outline"
        iconColor={colors.secondary}
        onPress={() => navigation.navigate('Medicin')}
      />

      <Card
        title="Kontakter og hjælp"
        description="Ring til pårørende eller nødtjenester"
        icon="call-outline"
        iconColor={colors.danger}
        onPress={() => navigation.navigate('Hjælp')}
      />

      <Card
        title="Indstillinger"
        description="Profil, påmindelser og tilgængelighed"
        icon="settings-outline"
        iconColor={colors.textSecondary}
        onPress={() => navigation.navigate('Indstillinger')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: -spacing.sm,
  },
  topBarSpacer: {
    flex: 1,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  greetingText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
