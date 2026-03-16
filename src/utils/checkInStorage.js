import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@caremate_checkins';

/**
 * Datastruktur for en daglig check-in:
 * {
 *   id: string,          // Unik identifikator
 *   date: string,        // 'YYYY-MM-DD'
 *   mood: string,        // 'good' | 'okay' | 'not_good'
 *   note: string | null, // Valgfri note
 *   createdAt: string,   // ISO timestamp
 * }
 *
 * Designet til at kunne udvides med:
 * - trendanalyse (mood over tid)
 * - advarsler (streaks af 'not_good')
 * - backend-sync (id + createdAt gør det nemt)
 */

export const MOODS = {
  good: {
    key: 'good',
    label: 'Godt',
    emoji: '😊',
    color: '#4CAF50',
    lightColor: '#E8F5E9',
  },
  okay: {
    key: 'okay',
    label: 'Okay',
    emoji: '😐',
    color: '#FF9800',
    lightColor: '#FFF3E0',
  },
  not_good: {
    key: 'not_good',
    label: 'Ikke så godt',
    emoji: '😔',
    color: '#E57373',
    lightColor: '#FFEBEE',
  },
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Hent alle check-ins sorteret nyeste først */
export async function getAllCheckIns() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

/** Gem en ny check-in for i dag */
export async function saveCheckIn(mood, note = null) {
  const entries = await getAllCheckIns();
  const today = getToday();

  // Fjern eksisterende check-in for i dag (overskriv)
  const filtered = entries.filter((e) => e.date !== today);

  const entry = {
    id: generateId(),
    date: today,
    mood,
    note: note?.trim() || null,
    createdAt: new Date().toISOString(),
  };

  filtered.unshift(entry);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return entry;
}

/** Hent check-in for i dag (eller null) */
export async function getTodayCheckIn() {
  const entries = await getAllCheckIns();
  return entries.find((e) => e.date === getToday()) || null;
}

/** Hent de seneste N check-ins */
export async function getRecentCheckIns(count = 7) {
  const entries = await getAllCheckIns();
  return entries.slice(0, count);
}

/**
 * Tæl på hinanden følgende dage med en bestemt mood,
 * regnet baglæns fra den seneste entry.
 * Returnerer antal dage i streak.
 */
export async function getConsecutiveMoodStreak(targetMood) {
  const entries = await getAllCheckIns();
  if (entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].date + 'T00:00:00');
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toISOString().split('T')[0];

    if (entries[i].date !== expectedStr) break;
    if (entries[i].mood !== targetMood) break;
    streak++;
  }

  return streak;
}

/**
 * Generer mock-data til udvikling og demo.
 * Skaber 14 dages check-ins med blandet humør.
 */
export async function seedMockData() {
  const existing = await getAllCheckIns();
  if (existing.length > 0) return; // Seed kun én gang

  const moods = ['good', 'okay', 'not_good'];
  const notes = [
    'Gik en dejlig tur i parken',
    'Snakkede med børnebørnene',
    null,
    'Lidt ondt i knæet i dag',
    'Sov godt i nat',
    null,
    'Besøg af naboen',
    'Savnede familien lidt',
    null,
    'Læste en god bog',
    'Havde svært ved at sove',
    null,
    'Godt vejr i dag',
    'Lidt træt',
  ];

  // Mønster: mest godt, nogle okay, et par ikke-så-godt
  const moodPattern = [
    'good', 'good', 'okay', 'good', 'not_good',
    'okay', 'good', 'good', 'okay', 'not_good',
    'good', 'okay', 'good', 'good',
  ];

  const entries = [];
  const today = new Date();

  for (let i = 13; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    entries.push({
      id: generateId(),
      date: date.toISOString().split('T')[0],
      mood: moodPattern[13 - i] || moods[Math.floor(Math.random() * 3)],
      note: notes[13 - i] || null,
      createdAt: date.toISOString(),
    });
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
