/**
 * Chat-service til CareMate AI-assistent.
 *
 * I V1 bruges mock-svar baseret på keyword-matching.
 * Strukturen er designet så en rigtig AI-service (f.eks. OpenAI, Anthropic)
 * nemt kan erstatte mock-logikken ved at udskifte sendMessage().
 *
 * Fremtidig integration:
 * - Udskift sendMessage() med et API-kald
 * - Tilføj conversation history til context
 * - Tilføj streaming-support
 */

/**
 * Forslåede spørgsmål vist som hurtigknapper.
 * Kan udvides dynamisk baseret på brugerens kontekst.
 */
export const SUGGESTIONS = [
  {
    id: 'schedule',
    text: 'Hvad skal jeg i dag?',
    icon: 'calendar-outline',
  },
  {
    id: 'medicine',
    text: 'Hvornår skal jeg tage min medicin?',
    icon: 'medkit-outline',
  },
  {
    id: 'lonely',
    text: 'Jeg føler mig lidt ensom',
    icon: 'heart-outline',
  },
  {
    id: 'call',
    text: 'Ring til min datter',
    icon: 'call-outline',
  },
];

/**
 * Velkomstbesked fra assistenten.
 */
export const WELCOME_MESSAGE = {
  id: 'welcome',
  text: 'Hej! Jeg er CareMate, din digitale hjælper.\n\nDu kan skrive til mig, eller vælge et af forslagene herunder. Jeg er her for at hjælpe dig.',
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Mock-svar (keyword-baseret)
// ---------------------------------------------------------------------------

const RESPONSES = [
  {
    keywords: ['hej', 'godmorgen', 'god dag', 'god aften', 'god eftermiddag', 'halløj'],
    reply: 'Hej med dig! Det er dejligt at høre fra dig. Hvad kan jeg hjælpe med i dag?',
  },
  {
    keywords: ['hvad skal jeg i dag', 'plan', 'kalender', 'program', 'aftaler'],
    reply: 'I dag har du ingen særlige aftaler registreret. Det kunne være en god dag til en rolig gåtur eller at ringe til nogen, du holder af.\n\nSkal jeg hjælpe med noget andet?',
  },
  {
    keywords: ['medicin', 'pille', 'tablet', 'tage min medicin'],
    reply: 'Du kan se alle dine medicinpåmindelser under fanen "Medicin" i bunden af skærmen.\n\nDer kan du se, hvornår du skal tage dem, og markere når du har taget dem. Skal jeg hjælpe med noget andet?',
  },
  {
    keywords: ['ensom', 'alene', 'savner', 'ked af det', 'trist', 'ikke så godt'],
    reply: 'Det er helt okay at føle sådan – det gør vi alle engang imellem.\n\nMåske kunne det hjælpe at ringe til en du holder af? Du kan finde dine kontakter under fanen "Hjælp".\n\nJeg er her, hvis du har brug for at snakke.',
  },
  {
    keywords: ['ring', 'opkald', 'telefon', 'datter', 'søn', 'familie', 'pårørende'],
    reply: 'Du kan ringe til dine pårørende via fanen "Hjælp" i bunden af skærmen.\n\nDer finder du dine gemte kontakter. Tryk blot på den person, du vil ringe til.',
  },
  {
    keywords: ['tak', 'mange tak', 'tusind tak'],
    reply: 'Det var så lidt! Jeg er altid her, hvis du har brug for hjælp. Ha\' en rigtig god dag.',
  },
  {
    keywords: ['hjælp', 'hvad kan du', 'hvad kan jeg spørge om'],
    reply: 'Jeg kan hjælpe dig med mange ting:\n\n• Minde dig om din medicin\n• Fortælle om din dag\n• Hjælpe dig med at ringe til nogen\n• Bare snakke, hvis du har brug for det\n\nSpørg bare løs – der er ingen dumme spørgsmål.',
  },
  {
    keywords: ['vejr', 'regner', 'sol', 'temperatur'],
    reply: 'Jeg kan desværre ikke tjekke vejret lige nu. Men du kan kigge ud af vinduet, eller spørge en du kender.\n\nKan jeg hjælpe med noget andet?',
  },
  {
    keywords: ['sove', 'søvn', 'træt', 'ikke sove'],
    reply: 'Godt søvn er vigtigt. Her er et par tips:\n\n• Prøv at gå i seng på samme tid hver aften\n• Undgå skærme en time inden sengetid\n• En kop varm te kan hjælpe\n\nHvis du ofte har svært ved at sove, så snak med din læge om det.',
  },
  {
    keywords: ['ondt', 'smerte', 'gør ondt', 'syg'],
    reply: 'Det er jeg ked af at høre. Hvis det er noget akut, bør du kontakte din læge eller ringe 1813 (lægevagten).\n\nDu finder nyttige numre under fanen "Hjælp". Pas godt på dig selv.',
  },
];

const FALLBACK_REPLY =
  'Tak for din besked. Jeg forstår ikke helt, men jeg gør mit bedste.\n\nPrøv evt. at spørge på en anden måde, eller vælg et af forslagene. Jeg er her for at hjælpe dig.';

/**
 * Find det bedste mock-svar baseret på beskedens indhold.
 */
function findMockResponse(messageText) {
  const lower = messageText.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of RESPONSES) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        // Længere keywords giver højere score (mere specifikt match)
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch ? bestMatch.reply : FALLBACK_REPLY;
}

// ---------------------------------------------------------------------------
// Offentlig API
// ---------------------------------------------------------------------------

/**
 * Send en besked og få et svar.
 *
 * I V1: returnerer et mock-svar efter en simuleret forsinkelse.
 * I fremtiden: erstattes med et rigtigt API-kald.
 *
 * @param {string} messageText - Brugerens besked
 * @param {Array} _conversationHistory - Fuld samtalehistorik (til fremtidig brug)
 * @returns {Promise<string>} - Assistentens svar
 */
export async function sendMessage(messageText, _conversationHistory = []) {
  // Simuler netværksforsinkelse (400-900ms)
  const delay = 400 + Math.random() * 500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return findMockResponse(messageText);
}

/**
 * Opret et besked-objekt.
 * Konsistent struktur til brug i UI og fremtidig persistering.
 */
export function createMessage(text, sender) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text,
    sender, // 'user' | 'ai'
    timestamp: new Date().toISOString(),
  };
}
