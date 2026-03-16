import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import { DEFAULT_SETTINGS } from '../models';

// ---------------------------------------------------------------------------
// Indstillingsskærm
// ---------------------------------------------------------------------------

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVoiceControl = () => {
    Alert.alert(
      'Stemmestyring',
      'Stemmestyring er ikke tilgængelig endnu, men vi arbejder på det.\n\nDu vil kunne styre CareMate med din stemme i en fremtidig opdatering.',
      [{ text: 'Forstået' }]
    );
  };

  return (
    <ScreenWrapper title="Indstillinger">
      {/* Tilbage-knap */}
      {navigation && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Gå tilbage"
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
          <Text style={styles.backText}>Tilbage</Text>
        </TouchableOpacity>
      )}

      {/* ---- Profil ---- */}
      <SectionHeader icon="person-circle-outline" title="Profil" />
      <SettingsCard>
        <SettingsRow
          icon="person-outline"
          label="Navn"
          value="Ikke angivet"
          onPress={() =>
            Alert.alert('Profil', 'Redigering af profil kommer snart.')
          }
        />
        <Divider />
        <SettingsRow
          icon="calendar-outline"
          label="Fødselsdato"
          value="Ikke angivet"
          onPress={() =>
            Alert.alert('Profil', 'Redigering af profil kommer snart.')
          }
        />
        <Divider />
        <SettingsRow
          icon="call-outline"
          label="Telefon"
          value="Ikke angivet"
          onPress={() =>
            Alert.alert('Profil', 'Redigering af profil kommer snart.')
          }
        />
      </SettingsCard>

      {/* ---- Nødkontakter ---- */}
      <SectionHeader icon="alert-circle-outline" title="Nødkontakter" />
      <SettingsCard>
        <SettingsRow
          icon="people-outline"
          label="Administrér kontakter"
          description="Tilføj eller redigér dine betroede kontakter"
          onPress={() =>
            Alert.alert(
              'Nødkontakter',
              'Fuld redigering af kontakter kommer snart.\n\nDine nuværende kontakter kan ses under fanen "Hjælp".'
            )
          }
          showArrow
        />
        <Divider />
        <SettingsRow
          icon="chatbubble-outline"
          label="Nødbesked"
          description={settings.emergencyMessage}
          onPress={() =>
            Alert.alert(
              'Nødbesked',
              'Redigering af din standardbesked ved nødopkald kommer snart.'
            )
          }
          showArrow
        />
      </SettingsCard>

      {/* ---- Medicin ---- */}
      <SectionHeader icon="medkit-outline" title="Medicinindstillinger" />
      <SettingsCard>
        <SettingsToggle
          icon="notifications-outline"
          label="Medicinpåmindelser"
          description="Få besked når det er tid til medicin"
          value={settings.medicineReminders}
          onToggle={() => toggle('medicineReminders')}
        />
      </SettingsCard>

      {/* ---- Påmindelser ---- */}
      <SectionHeader icon="alarm-outline" title="Påmindelser" />
      <SettingsCard>
        <SettingsToggle
          icon="heart-circle-outline"
          label="Daglig check-in"
          description="Påmindelse om at fortælle hvordan du har det"
          value={settings.checkInReminders}
          onToggle={() => toggle('checkInReminders')}
        />
        <Divider />
        <SettingsRow
          icon="time-outline"
          label="Tidspunkt for check-in"
          value={settings.checkInReminderTime}
          onPress={() =>
            Alert.alert(
              'Tidspunkt',
              'Valg af tidspunkt for check-in påmindelse kommer snart.'
            )
          }
        />
      </SettingsCard>

      {/* ---- Tilgængelighed ---- */}
      <SectionHeader icon="accessibility-outline" title="Tilgængelighed" />
      <SettingsCard>
        <SettingsToggle
          icon="text-outline"
          label="Stor skrift"
          description="Gør al tekst større og lettere at læse"
          value={settings.largeText}
          onToggle={() => toggle('largeText')}
        />
        <Divider />
        <SettingsToggle
          icon="contrast-outline"
          label="Høj kontrast"
          description="Tydeligere farver og kanter"
          value={settings.highContrast}
          onToggle={() => toggle('highContrast')}
        />
      </SettingsCard>

      {/* ---- Stemmestyring ---- */}
      <SectionHeader icon="mic-outline" title="Stemmestyring" />
      <SettingsCard>
        <SettingsRow
          icon="mic-outline"
          label="Aktiver stemmestyring"
          description="Styr CareMate med din stemme (kommer snart)"
          onPress={handleVoiceControl}
          showArrow
          dimmed
        />
      </SettingsCard>

      {/* Version */}
      <Text style={styles.versionText}>CareMate v1.0.0</Text>
    </ScreenWrapper>
  );
}

// ---------------------------------------------------------------------------
// Underkomponenter
// ---------------------------------------------------------------------------

function SectionHeader({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={[typography.h3, styles.sectionTitle]}>{title}</Text>
    </View>
  );
}

function SettingsCard({ children }) {
  return <View style={styles.card}>{children}</View>;
}

function SettingsRow({
  icon,
  label,
  value,
  description,
  onPress,
  showArrow = false,
  dimmed = false,
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={26}
        color={dimmed ? colors.textSecondary : colors.primary}
        style={styles.rowIcon}
      />
      <View style={styles.rowContent}>
        <Text
          style={[
            typography.body,
            dimmed && { color: colors.textSecondary },
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={typography.caption} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[typography.bodySmall, styles.rowValue]}>{value}</Text>
      ) : null}
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={22}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
}

function SettingsToggle({ icon, label, description, value, onToggle }) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={26}
        color={colors.primary}
        style={styles.rowIcon}
      />
      <View style={styles.rowContent}>
        <Text style={typography.body}>{label}</Text>
        {description ? (
          <Text style={typography.caption}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.textSecondary}
        accessibilityLabel={label}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.xs,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
    marginBottom: 0,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 64,
  },
  rowIcon: {
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowValue: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 30 + spacing.md, // ikon-bredde + margins
  },

  versionText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
