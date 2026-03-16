import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import {
  getAllMedicines,
  getTodayLog,
  getMedicineStatus,
  seedMedicineData,
} from '../utils/medicineStorage';

// ---------------------------------------------------------------------------
// Dato-formatering
// ---------------------------------------------------------------------------

const DAY_NAMES = [
  'Søndag', 'Mandag', 'Tirsdag', 'Onsdag',
  'Torsdag', 'Fredag', 'Lørdag',
];
const MONTH_NAMES = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

function formatDate(date) {
  const day = DAY_NAMES[date.getDay()];
  const d = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  return `${day} d. ${d}. ${month}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 10) return 'Godmorgen';
  if (hour < 18) return 'God eftermiddag';
  return 'God aften';
}

// ---------------------------------------------------------------------------
// Hurtigadgang-knapper
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  {
    id: 'ai',
    label: 'AI-assistent',
    icon: 'chatbubble-ellipses-outline',
    color: colors.primary,
    route: 'AI-assistent',
    isTab: true,
  },
  {
    id: 'medicin',
    label: 'Medicin',
    icon: 'medkit-outline',
    color: colors.secondary,
    route: 'Medicin',
    isTab: true,
  },
  {
    id: 'plan',
    label: 'Dagens plan',
    icon: 'calendar-outline',
    color: colors.warning,
    route: null, // Fremtidig skærm
  },
  {
    id: 'hjaelp',
    label: 'Kontakter',
    icon: 'call-outline',
    color: colors.danger,
    route: 'Hjælp',
    isTab: true,
  },
];

// ---------------------------------------------------------------------------
// Hovedskærm
// ---------------------------------------------------------------------------

export default function HomeScreen({ navigation }) {
  const [nextMedicine, setNextMedicine] = useState(null);

  // Hent næste medicin ved focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await seedMedicineData();
        const medicines = await getAllMedicines();
        const todayLog = await getTodayLog();

        // Find næste medicin der ikke er taget
        const now = new Date();
        const upcoming = medicines
          .map((m) => ({
            ...m,
            status: getMedicineStatus(m, todayLog),
          }))
          .filter((m) => m.status.key !== 'taken')
          .sort((a, b) => a.time.localeCompare(b.time));

        if (active && upcoming.length > 0) {
          setNextMedicine(upcoming[0]);
        } else if (active) {
          setNextMedicine(null);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const navigateToTab = (route) => {
    navigation.getParent()?.navigate(route);
  };

  const handleQuickAction = (action) => {
    if (!action.route) {
      // Dagens plan er endnu ikke implementeret
      return;
    }
    if (action.isTab) {
      navigateToTab(action.route);
    } else {
      navigation.navigate(action.route);
    }
  };

  const today = new Date();

  return (
    <ScreenWrapper>
      {/* Top-linje: dato + indstillinger */}
      <View style={styles.topBar}>
        <View>
          <Text style={[typography.body, styles.dateText]}>
            {formatDate(today)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Indstillinger')}
          accessibilityRole="button"
          accessibilityLabel="Åbn indstillinger"
        >
          <Ionicons name="settings-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Velkomst */}
      <View style={styles.greetingSection}>
        <Text style={typography.h1}>{getGreeting()}</Text>
        <Text style={[typography.body, styles.greetingSubtitle]}>
          Hvordan har du det i dag?
        </Text>
      </View>

      {/* ======= Daglig check-in (fremtrædende) ======= */}
      <TouchableOpacity
        style={styles.checkInCard}
        onPress={() => navigateToTab('Check-in')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Start daglig check-in"
      >
        <View style={styles.checkInIcon}>
          <Ionicons name="heart-circle" size={52} color={colors.white} />
        </View>
        <View style={styles.checkInContent}>
          <Text style={styles.checkInTitle}>Daglig check-in</Text>
          <Text style={styles.checkInDescription}>
            Fortæl os hvordan du har det – det tager kun et øjeblik
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={28} color={colors.white} style={{ opacity: 0.7 }} />
      </TouchableOpacity>

      {/* ======= Næste medicin ======= */}
      {nextMedicine && (
        <TouchableOpacity
          style={styles.medicineCard}
          onPress={() => navigateToTab('Medicin')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Næste medicin: ${nextMedicine.name} kl. ${nextMedicine.time}`}
        >
          <View style={styles.medicineIconWrap}>
            <Ionicons name="medkit" size={28} color={colors.secondary} />
          </View>
          <View style={styles.medicineContent}>
            <Text style={typography.caption}>Næste medicin</Text>
            <Text style={[typography.h3, { marginBottom: 0 }]}>
              {nextMedicine.name}
            </Text>
          </View>
          <View style={styles.medicineTime}>
            <Text style={styles.medicineTimeText}>
              kl. {nextMedicine.time}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ======= Hurtig adgang ======= */}
      <Text style={[typography.h3, styles.sectionLabel]}>Genveje</Text>

      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickCard}
            onPress={() => handleQuickAction(action)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: action.color + '15' },
              ]}
            >
              <Ionicons name={action.icon} size={32} color={action.color} />
            </View>
            <Text style={styles.quickLabel} numberOfLines={2}>
              {action.label}
            </Text>
            {!action.route && (
              <Text style={styles.quickBadge}>Snart</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Top-bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateText: {
    color: colors.textSecondary,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Velkomst
  greetingSection: {
    marginBottom: spacing.xl,
  },
  greetingSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Check-in hero
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    minHeight: 110,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkInIcon: {
    marginRight: spacing.md,
  },
  checkInContent: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  checkInDescription: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.85,
    lineHeight: 24,
  },

  // Medicin-kort
  medicineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  medicineIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  medicineContent: {
    flex: 1,
  },
  medicineTime: {
    backgroundColor: colors.secondary + '15',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  medicineTimeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.secondary,
  },

  // Genveje
  sectionLabel: {
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  quickBadge: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
