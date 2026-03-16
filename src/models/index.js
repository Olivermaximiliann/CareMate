/**
 * CareMate – Datamodeller
 *
 * Centrale datastrukturer til hele appen.
 * Bruges som referencestrukturer og til at oprette nye objekter med fabriksfunktioner.
 *
 * Bemærk: Disse er plain JS-objekter – ikke ORM/database-modeller.
 * De kan bruges med AsyncStorage, en REST-API eller en lokal database.
 */

// ---------------------------------------------------------------------------
// Hjælpefunktioner
// ---------------------------------------------------------------------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Bruger / Profil
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name            - Brugerens fulde navn
 * @property {string} [nickname]      - Kaldenavn (bruges i hilsener)
 * @property {string} [birthDate]     - YYYY-MM-DD
 * @property {string} [phone]         - Telefonnummer
 * @property {string} [address]       - Adresse
 * @property {string} [photoUri]      - Lokalt billede-URI
 * @property {string} createdAt       - ISO-dato
 */

export function createUserProfile(overrides = {}) {
  return {
    id: generateId(),
    name: '',
    nickname: '',
    birthDate: '',
    phone: '',
    address: '',
    photoUri: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Kontakt
// ---------------------------------------------------------------------------

/**
 * @typedef {'family' | 'medical' | 'homecare' | 'emergency' | 'other'} ContactType
 *
 * @typedef {Object} Contact
 * @property {string}      id
 * @property {string}      name
 * @property {string}      [relation]     - F.eks. "Datter", "Egen læge"
 * @property {string}      phone
 * @property {ContactType} type
 * @property {number}      priority       - Lavere = vigtigere (1 = primær)
 * @property {boolean}     isEmergency    - Markér som nødkontakt
 * @property {string}      [photoUri]
 * @property {string}      [notes]
 * @property {string}      createdAt
 */

export function createContact(overrides = {}) {
  return {
    id: generateId(),
    name: '',
    relation: '',
    phone: '',
    type: 'family',
    priority: 10,
    isEmergency: false,
    photoUri: '',
    notes: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Medicin
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Medicine
 * @property {string}  id
 * @property {string}  name            - Medicinens navn
 * @property {string}  dosage          - F.eks. "1 tablet", "5 ml"
 * @property {string}  time            - HH:MM – hvornår den skal tages
 * @property {string}  [frequency]     - 'daily' | 'weekly' | 'asNeeded'
 * @property {string}  [notes]         - Evt. bemærkninger
 * @property {boolean} active          - Om medicinen stadig bruges
 * @property {boolean} reminderEnabled - Påmindelser slået til
 * @property {string}  createdAt
 */

export function createMedicine(overrides = {}) {
  return {
    id: generateId(),
    name: '',
    dosage: '',
    time: '08:00',
    frequency: 'daily',
    notes: '',
    active: true,
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * @typedef {Object} MedicineLog
 * @property {string} id
 * @property {string} medicineId
 * @property {string} date             - YYYY-MM-DD
 * @property {string} [takenAt]        - ISO-dato for hvornår den blev taget
 * @property {boolean} skipped         - Om dosis blev sprunget over
 */

export function createMedicineLog(medicineId, overrides = {}) {
  return {
    id: generateId(),
    medicineId,
    date: today(),
    takenAt: null,
    skipped: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Daglig check-in
// ---------------------------------------------------------------------------

/**
 * @typedef {'good' | 'okay' | 'not_good'} MoodLevel
 *
 * @typedef {Object} CheckIn
 * @property {string}    id
 * @property {string}    date           - YYYY-MM-DD
 * @property {MoodLevel} mood
 * @property {string}    [note]         - Fritekst fra brugeren
 * @property {number}    [painLevel]    - 0-10 skala (fremtidig brug)
 * @property {number}    [sleepHours]   - Timer sovet (fremtidig brug)
 * @property {string}    createdAt
 */

export function createCheckIn(overrides = {}) {
  return {
    id: generateId(),
    date: today(),
    mood: 'okay',
    note: '',
    painLevel: null,
    sleepHours: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Dagens plan / aktiviteter
// ---------------------------------------------------------------------------

/**
 * @typedef {'appointment' | 'medicine' | 'activity' | 'social' | 'reminder'} PlanItemType
 *
 * @typedef {Object} PlanItem
 * @property {string}       id
 * @property {string}       date          - YYYY-MM-DD
 * @property {string}       time          - HH:MM
 * @property {string}       title         - Kort beskrivelse
 * @property {string}       [description] - Uddybende info
 * @property {PlanItemType} type
 * @property {boolean}      completed
 * @property {string}       [linkedId]    - Evt. reference til medicin/kontakt
 * @property {string}       createdAt
 */

export function createPlanItem(overrides = {}) {
  return {
    id: generateId(),
    date: today(),
    time: '09:00',
    title: '',
    description: '',
    type: 'activity',
    completed: false,
    linkedId: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Brugerindstillinger
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} UserSettings
 * @property {boolean} largeText            - Stor skrift
 * @property {boolean} highContrast         - Høj kontrast
 * @property {boolean} medicineReminders    - Medicinpåmindelser
 * @property {boolean} checkInReminders     - Check-in påmindelser
 * @property {string}  checkInReminderTime  - HH:MM
 * @property {boolean} voiceControlEnabled  - Stemmestyring (placeholder)
 * @property {string}  emergencyMessage     - Standardbesked ved nødopkald
 */

export const DEFAULT_SETTINGS = {
  largeText: false,
  highContrast: false,
  medicineReminders: true,
  checkInReminders: true,
  checkInReminderTime: '09:00',
  voiceControlEnabled: false,
  emergencyMessage: 'Jeg har brug for hjælp. Send venligst nogen.',
};

export function createSettings(overrides = {}) {
  return { ...DEFAULT_SETTINGS, ...overrides };
}
