import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@caremate_medicines';
const LOG_KEY = '@caremate_medicine_log';

/**
 * Datastruktur for en medicin:
 * {
 *   id: string,
 *   name: string,          // Medicinens navn
 *   time: string,          // Planlagt tidspunkt ('HH:MM')
 *   dosage: string | null, // Valgfri dosering (til fremtidig brug)
 *   notes: string | null,  // Valgfri note
 *   active: boolean,       // Om medicinen stadig er aktiv
 *   createdAt: string,     // ISO timestamp
 * }
 *
 * Datastruktur for en registrering (log):
 * {
 *   id: string,
 *   medicineId: string,    // Refererer til medicin
 *   date: string,          // 'YYYY-MM-DD'
 *   takenAt: string,       // ISO timestamp for hvornår den blev taget
 * }
 *
 * Designet til fremtidig udvidelse med:
 * - Notifikationer (time-feltet bruges til scheduling)
 * - Adherence-tracking (log giver fuld historik)
 * - Backend-sync (id + timestamps)
 */

// ---------------------------------------------------------------------------
// Status-beregning
// ---------------------------------------------------------------------------

export const STATUS = {
  upcoming: {
    key: 'upcoming',
    label: 'Kommer snart',
    icon: 'time-outline',
    color: '#5C6BC0',
    lightColor: '#E8EAF6',
  },
  taken: {
    key: 'taken',
    label: 'Taget',
    icon: 'checkmark-circle',
    color: '#2E7D6F',
    lightColor: '#E8F5F1',
  },
  missed: {
    key: 'missed',
    label: 'Ikke registreret',
    icon: 'alert-circle-outline',
    color: '#F9A825',
    lightColor: '#FFF8E1',
  },
};

/** Returnerer status for en medicin baseret på tid og log */
export function getMedicineStatus(medicine, todayLog) {
  const isTaken = todayLog.some((log) => log.medicineId === medicine.id);
  if (isTaken) return STATUS.taken;

  const now = new Date();
  const [hours, minutes] = medicine.time.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // Giv 30 minutters buffer efter planlagt tid
  const bufferMs = 30 * 60 * 1000;
  if (now.getTime() < scheduledTime.getTime() + bufferMs) {
    return STATUS.upcoming;
  }

  return STATUS.missed;
}

// ---------------------------------------------------------------------------
// Hjælpefunktioner
// ---------------------------------------------------------------------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Medicin CRUD
// ---------------------------------------------------------------------------

/** Hent alle aktive mediciner sorteret efter tidspunkt */
export async function getAllMedicines() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const medicines = raw ? JSON.parse(raw) : [];
    return medicines
      .filter((m) => m.active)
      .sort((a, b) => a.time.localeCompare(b.time));
  } catch {
    return [];
  }
}

/** Tilføj en ny medicin */
export async function addMedicine(name, time, dosage = null, notes = null) {
  const medicines = await getAllMedicines();
  const entry = {
    id: generateId(),
    name: name.trim(),
    time: time.trim(),
    dosage: dosage?.trim() || null,
    notes: notes?.trim() || null,
    active: true,
    createdAt: new Date().toISOString(),
  };
  medicines.push(entry);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  return entry;
}

/** Fjern en medicin (soft delete) */
export async function removeMedicine(id) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const medicines = raw ? JSON.parse(raw) : [];
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, active: false } : m
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Stille fejl
  }
}

// ---------------------------------------------------------------------------
// Log / registrering
// ---------------------------------------------------------------------------

/** Hent dagens log */
export async function getTodayLog() {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    const today = getToday();
    return logs.filter((l) => l.date === today);
  } catch {
    return [];
  }
}

/** Registrér at en medicin er taget */
export async function markMedicineTaken(medicineId) {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    const today = getToday();

    // Tjek om allerede registreret i dag
    const alreadyTaken = logs.some(
      (l) => l.medicineId === medicineId && l.date === today
    );
    if (alreadyTaken) return null;

    const entry = {
      id: generateId(),
      medicineId,
      date: today,
      takenAt: new Date().toISOString(),
    };
    logs.push(entry);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs));
    return entry;
  } catch {
    return null;
  }
}

/** Fortryd registrering for en medicin i dag */
export async function unmarkMedicineTaken(medicineId) {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    const today = getToday();
    const updated = logs.filter(
      (l) => !(l.medicineId === medicineId && l.date === today)
    );
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(updated));
  } catch {
    // Stille fejl
  }
}

/**
 * Hent adherence-data for de seneste N dage.
 * Returnerer et array af { date, total, taken } objekter.
 * (Til fremtidig brug i trendvisning.)
 */
export async function getAdherenceHistory(days = 7) {
  try {
    const rawMeds = await AsyncStorage.getItem(STORAGE_KEY);
    const medicines = rawMeds ? JSON.parse(rawMeds).filter((m) => m.active) : [];
    const rawLogs = await AsyncStorage.getItem(LOG_KEY);
    const logs = rawLogs ? JSON.parse(rawLogs) : [];

    const history = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.date === dateStr);

      history.push({
        date: dateStr,
        total: medicines.length,
        taken: dayLogs.length,
      });
    }

    return history;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Mock-data
// ---------------------------------------------------------------------------

const DEFAULT_MEDICINES = [
  {
    id: 'med_1',
    name: 'Hjertemedicin',
    time: '08:00',
    dosage: '1 tablet',
    notes: null,
    active: true,
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'med_2',
    name: 'Blodtrykspille',
    time: '12:00',
    dosage: '1 tablet',
    notes: 'Tag med mad',
    active: true,
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'med_3',
    name: 'Vitaminer',
    time: '18:00',
    dosage: '2 tabletter',
    notes: null,
    active: true,
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

/** Seed standardmediciner hvis ingen findes */
export async function seedMedicineData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const medicines = raw ? JSON.parse(raw) : [];
    if (medicines.length > 0) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEDICINES));
  } catch {
    // Stille fejl
  }
}
