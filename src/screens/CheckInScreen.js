import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, BigButton } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import {
  MOODS,
  saveCheckIn,
  getTodayCheckIn,
  getRecentCheckIns,
  getConsecutiveMoodStreak,
  seedMockData,
} from '../utils/checkInStorage';

// ---------------------------------------------------------------------------
// Underkomponenter
// ---------------------------------------------------------------------------

/** Stor humør-knap med emoji og label */
function MoodButton({ mood, selected, onPress }) {
  const isSelected = selected === mood.key;
  return (
    <TouchableOpacity
      style={[
        styles.moodButton,
        { borderColor: mood.color },
        isSelected && { backgroundColor: mood.lightColor, borderWidth: 3 },
      ]}
      onPress={() => onPress(mood.key)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={mood.label}
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
      <Text
        style={[
          typography.h3,
          styles.moodLabel,
          isSelected && { color: mood.color, fontWeight: '700' },
        ]}
      >
        {mood.label}
      </Text>
    </TouchableOpacity>
  );
}

/** Lille dag-indikator i historik-oversigten */
function DayDot({ entry }) {
  const mood = MOODS[entry.mood];
  const dayNames = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
  const date = new Date(entry.date + 'T00:00:00');
  const dayName = dayNames[date.getDay()];
  const dayNum = date.getDate();

  return (
    <View style={styles.dayDotContainer} accessibilityLabel={`${dayName} ${dayNum}: ${mood.label}`}>
      <View style={[styles.dayDot, { backgroundColor: mood.color }]}>
        <Text style={styles.dayDotEmoji}>{mood.emoji}</Text>
      </View>
      <Text style={styles.dayDotLabel}>{dayName}</Text>
      <Text style={styles.dayDotNum}>{dayNum}.</Text>
    </View>
  );
}

/** Rolig markering ved negativ streak */
function AttentionBanner({ streak }) {
  if (streak < 3) return null;

  return (
    <View style={styles.attentionBanner} accessibilityRole="alert">
      <Ionicons name="heart-outline" size={28} color={colors.secondary} />
      <View style={styles.attentionTextContainer}>
        <Text style={[typography.body, styles.attentionTitle]}>
          Vi har lagt mærke til noget
        </Text>
        <Text style={[typography.bodySmall, styles.attentionBody]}>
          Du har haft det lidt svært de seneste {streak} dage.
          Det er helt okay – overvej at tale med en du stoler på.
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Hovedskærm
// ---------------------------------------------------------------------------

export default function CheckInScreen() {
  const [todayEntry, setTodayEntry] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);
  const [negativeStreak, setNegativeStreak] = useState(0);
  const [saved, setSaved] = useState(false);

  // Fade-animation til bekræftelse
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadData = useCallback(async () => {
    await seedMockData();
    const today = await getTodayCheckIn();
    const recent = await getRecentCheckIns(7);
    const streak = await getConsecutiveMoodStreak('not_good');

    setTodayEntry(today);
    setRecentEntries(recent);
    setNegativeStreak(streak);

    if (today) {
      setSelectedMood(today.mood);
      setNote(today.note || '');
      setSaved(true);
    } else {
      setSelectedMood(null);
      setNote('');
      setSaved(false);
    }
  }, []);

  // Genindlæs data hver gang skærmen får fokus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async () => {
    if (!selectedMood) return;

    await saveCheckIn(selectedMood, note);
    setSaved(true);

    // Fade-in bekræftelse
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Genindlæs data
    await loadData();
  };

  const handleChangeAnswer = () => {
    setSaved(false);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <ScreenWrapper title="Daglig check-in">
      {/* Spørgsmål */}
      <View style={styles.questionSection}>
        <Ionicons name="sunny" size={40} color={colors.warning} />
        <Text style={[typography.h2, styles.questionText]}>
          Hvordan har du det i dag?
        </Text>
      </View>

      {/* Humørvalg */}
      <View style={styles.moodRow}>
        {Object.values(MOODS).map((mood) => (
          <MoodButton
            key={mood.key}
            mood={mood}
            selected={selectedMood}
            onPress={(key) => {
              if (!saved) setSelectedMood(key);
            }}
          />
        ))}
      </View>

      {/* Valgfri note */}
      {selectedMood && !saved && (
        <View style={styles.noteSection}>
          <Text style={[typography.body, styles.noteLabel]}>
            Vil du tilføje en note? (valgfrit)
          </Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="F.eks. Gik en dejlig tur i dag..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={200}
            accessibilityLabel="Skriv en valgfri note"
          />
        </View>
      )}

      {/* Gem-knap */}
      {selectedMood && !saved && (
        <BigButton
          title="Gem min check-in"
          icon="checkmark-circle-outline"
          onPress={handleSave}
          style={styles.saveButton}
        />
      )}

      {/* Bekræftelse */}
      {saved && (
        <View style={styles.confirmationSection}>
          <Animated.View style={[styles.confirmationBadge, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            <Text style={[typography.body, styles.confirmationText]}>Gemt!</Text>
          </Animated.View>

          <View style={styles.todaySummary}>
            <Text style={styles.todayEmoji}>
              {MOODS[selectedMood]?.emoji}
            </Text>
            <Text style={[typography.h3, styles.todaySummaryText]}>
              Du sagde: {MOODS[selectedMood]?.label}
            </Text>
            {note ? (
              <Text style={[typography.bodySmall, styles.todayNote]}>
                "{note}"
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangeAnswer}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
            <Text style={[typography.bodySmall, styles.changeText]}>
              Ret mit svar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Opmærksomhedsmarkering */}
      <AttentionBanner streak={negativeStreak} />

      {/* Historik */}
      {recentEntries.length > 0 && (
        <View style={styles.historySection}>
          <Text style={[typography.h2, styles.historyTitle]}>
            Seneste dage
          </Text>
          <View style={styles.historyRow}>
            {recentEntries.map((entry) => (
              <DayDot key={entry.id} entry={entry} />
            ))}
          </View>

          {/* Detaljeret liste */}
          {recentEntries.slice(0, 5).map((entry) => {
            const mood = MOODS[entry.mood];
            const date = new Date(entry.date + 'T00:00:00');
            const formatted = date.toLocaleDateString('da-DK', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            });
            return (
              <View key={entry.id} style={styles.historyItem}>
                <View style={[styles.historyDot, { backgroundColor: mood.color }]} />
                <View style={styles.historyItemContent}>
                  <Text style={typography.body}>
                    {mood.emoji} {mood.label}
                  </Text>
                  <Text style={typography.caption}>{formatted}</Text>
                  {entry.note && (
                    <Text style={[typography.caption, styles.historyNote]}>
                      "{entry.note}"
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenWrapper>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Spørgsmål
  questionSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  questionText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Humørknapper
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    backgroundColor: colors.white,
    minHeight: 120,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  moodEmoji: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  moodLabel: {
    textAlign: 'center',
  },

  // Note
  noteSection: {
    marginBottom: spacing.lg,
  },
  noteLabel: {
    marginBottom: spacing.sm,
  },
  noteInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 22,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Gem-knap
  saveButton: {
    marginBottom: spacing.lg,
  },

  // Bekræftelse
  confirmationSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confirmationText: {
    marginLeft: spacing.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  todaySummary: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  todayEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  todaySummaryText: {
    textAlign: 'center',
  },
  todayNote: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  changeText: {
    marginLeft: spacing.xs,
    color: colors.primary,
  },

  // Opmærksomhedsmarkering
  attentionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3E8FF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  attentionTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  attentionTitle: {
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  attentionBody: {
    color: colors.text,
  },

  // Historik
  historySection: {
    marginTop: spacing.md,
  },
  historyTitle: {
    marginBottom: spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  dayDotContainer: {
    alignItems: 'center',
  },
  dayDot: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dayDotEmoji: {
    fontSize: 20,
  },
  dayDotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayDotNum: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Detaljeret historik
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
  },
  historyDot: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    marginTop: 8,
    marginRight: spacing.md,
  },
  historyItemContent: {
    flex: 1,
  },
  historyNote: {
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
