import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import {
  getAllMedicines,
  getTodayLog,
  getMedicineStatus,
  seedMedicineData,
} from '../utils/medicineStorage';

// ---------------------------------------------------------------------------
// Dato
// ---------------------------------------------------------------------------

const DAYS = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
const MONTHS = [
  'januar','februar','marts','april','maj','juni',
  'juli','august','september','oktober','november','december',
];

function formatDate(d) {
  return `${DAYS[d.getDay()]} d. ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 10) return 'Godmorgen';
  if (h < 18) return 'God eftermiddag';
  return 'God aften';
}

// ---------------------------------------------------------------------------
// Genveje
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { id: 'ai',      label: 'AI-assistent', icon: 'chatbubble-ellipses', route: 'AI-assistent', isTab: true },
  { id: 'medicin', label: 'Medicin',      icon: 'medkit',              route: 'Medicin',      isTab: true },
  { id: 'plan',    label: 'Dagens plan',  icon: 'calendar',            route: null },
  { id: 'hjaelp',  label: 'Kontakter',    icon: 'people',              route: 'Hjælp',        isTab: true },
];

// ---------------------------------------------------------------------------
// Skærm
// ---------------------------------------------------------------------------

export default function HomeScreen({ navigation }) {
  const [nextMedicine, setNextMedicine] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await seedMedicineData();
        const meds = await getAllMedicines();
        const log = await getTodayLog();
        const upcoming = meds
          .map((m) => ({ ...m, status: getMedicineStatus(m, log) }))
          .filter((m) => m.status.key !== 'taken')
          .sort((a, b) => a.time.localeCompare(b.time));
        if (active) setNextMedicine(upcoming[0] || null);
      })();
      return () => { active = false; };
    }, [])
  );

  const goTab = (r) => navigation.getParent()?.navigate(r);

  const handleAction = (a) => {
    if (!a.route) return;
    a.isTab ? goTab(a.route) : navigation.navigate(a.route);
  };

  return (
    <ScreenWrapper>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatar}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={s.greetingText}>{getGreeting()}</Text>
            <Text style={s.dateText}>{formatDate(new Date())}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => navigation.navigate('Indstillinger')}
          accessibilityLabel="Indstillinger"
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Check-in hero ── */}
      <TouchableOpacity
        style={s.hero}
        onPress={() => goTab('Check-in')}
        activeOpacity={0.8}
        accessibilityLabel="Start daglig check-in"
      >
        {/* Dekorativ cirkel */}
        <View style={s.heroCircle} />
        <View style={s.heroInner}>
          <View style={s.heroIconWrap}>
            <Ionicons name="heart" size={36} color={colors.white} />
          </View>
          <Text style={s.heroTitle}>Hvordan har du det?</Text>
          <Text style={s.heroSub}>
            Tryk her for din daglige check-in
          </Text>
        </View>
        <View style={s.heroArrow}>
          <Ionicons name="arrow-forward" size={22} color={colors.white} />
        </View>
      </TouchableOpacity>

      {/* ── Næste medicin ── */}
      {nextMedicine && (
        <TouchableOpacity
          style={s.medCard}
          onPress={() => goTab('Medicin')}
          activeOpacity={0.7}
          accessibilityLabel={`Næste medicin: ${nextMedicine.name} kl. ${nextMedicine.time}`}
        >
          <View style={s.medLeft}>
            <View style={s.medDot} />
            <View>
              <Text style={s.medLabel}>Næste medicin</Text>
              <Text style={s.medName}>{nextMedicine.name}</Text>
            </View>
          </View>
          <View style={s.medTimeBadge}>
            <Ionicons name="time-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={s.medTimeText}>{nextMedicine.time}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── Genveje ── */}
      <Text style={s.sectionTitle}>Genveje</Text>
      <View style={s.grid}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={s.gridCard}
            onPress={() => handleAction(a)}
            activeOpacity={0.7}
            accessibilityLabel={a.label}
          >
            <View style={s.gridIcon}>
              <Ionicons name={a.icon} size={28} color={colors.primary} />
            </View>
            <Text style={s.gridLabel}>{a.label}</Text>
            {!a.route && <Text style={s.gridBadge}>Kommer snart</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

// ---------------------------------------------------------------------------
// Styles — moderne hvid/grøn
// ---------------------------------------------------------------------------

const GREEN = colors.primary;        // #2E7D6F
const GREEN_LIGHT = colors.primaryLight; // #E8F5F1
const WHITE = colors.white;
const BG = '#F6F9F8';               // lidt varmere end #FAFAFA

const s = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#00000012',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  // Hero check-in
  hero: {
    backgroundColor: GREEN,
    borderRadius: 28,
    padding: spacing.lg + 4,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    minHeight: 160,
    justifyContent: 'center',
  },
  heroCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF12',
  },
  heroInner: {
    zIndex: 1,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 18,
    color: WHITE,
    opacity: 0.85,
  },
  heroArrow: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF25',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Medicin-kort
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#0001',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
    marginRight: 14,
  },
  medLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  medName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  medTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  medTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: GREEN,
  },

  // Genveje
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  gridCard: {
    width: '48%',
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#0001',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  gridIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  gridBadge: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 6,
  },
});
