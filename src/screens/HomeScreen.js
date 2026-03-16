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
        <Ionicons name="sunny-outline" size={36} color={colors.primary} />
        <Text style={[typography.h1, styles.greetingText]}>
          {getGreeting()}!
        </Text>
        <Text style={[typography.body, styles.subtitle]}>
          Hvad kan jeg hjælpe dig med?
        </Text>
      </View>

      <Card
        title="Tal med CareMate"
        description="Stil spørgsmål eller få hjælp"
        icon="chatbubble-ellipses-outline"
        iconColor={colors.primary}
        onPress={() => navigation.navigate('Chat')}
      />

      <Card
        title="Medicin"
        description="Se dine påmindelser"
        icon="medkit-outline"
        iconColor={colors.secondary}
        onPress={() => navigation.navigate('Medicin')}
      />

      <Card
        title="Nødopkald"
        description="Ring efter hjælp"
        icon="call-outline"
        iconColor={colors.danger}
        onPress={() => navigation.navigate('SOS')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  greeting: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  greetingText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
