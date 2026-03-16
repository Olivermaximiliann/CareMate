import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Card } from '../components';
import { colors, typography, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Godmorgen';
    if (hour < 18) return 'God eftermiddag';
    return 'God aften';
  };

  return (
    <ScreenWrapper>
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
