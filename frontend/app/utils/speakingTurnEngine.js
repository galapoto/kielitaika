const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MODES = ['guided', 'roleplay', 'fluency', 'shadowing'];

const DEFAULT_OUTPUT = Object.freeze({
  ai_reply_fi: 'Hyvä! Jatketaan.',
  feedback: {
    one_big_win: 'Hyvä yritys — puhuit rohkeasti.',
    one_fix_now: 'Puhu hieman hitaammin ja selkeämmin, ja yritä uudestaan.',
    better_version_fi: '',
    micro_drill: ['Toista sama lause kerran hitaasti.'],
    level_adjustment: 'stay',
    dimension: 'clarity',
  },
  next_prompt_fi: 'Kerro vielä yksi lause lisää.',
  level_adjustment: 'stay',
  flags: { low_confidence_stt: false },
});

const safeString = (value) => (typeof value === 'string' ? value : '');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeLevel = (level) => {
  const value = safeString(level).toUpperCase();
  return CEFR_LEVELS.includes(value) ? value : 'A1';
};

const normalizeMode = (mode) => {
  const value = safeString(mode).toLowerCase();
  return MODES.includes(value) ? value : 'guided';
};

const normalizeMicroDrill = (value) => {
  const arr = Array.isArray(value) ? value : [];
  const strings = arr.map((item) => safeString(item).trim()).filter(Boolean);
  const unique = Array.from(new Set(strings));
  if (unique.length === 0) {
    return [...DEFAULT_OUTPUT.feedback.micro_drill];
  }
  return unique.slice(0, 4);
};

const isLowConfidenceTranscript = (text) => {
  const normalized = safeString(text).trim();
  if (!normalized) return true;
  // Very short transcripts tend to be unreliable (or accidental taps).
  if (normalized.length < 6) return true;
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return true;
  return false;
};

const buildSystemPrompt = ({ level, mode }) => {
  const lvl = normalizeLevel(level);
  const m = normalizeMode(mode);
  const modeLine =
    m === 'guided'
      ? 'Mode: Guided turn-taking (short, supported turns).'
      : m === 'roleplay'
      ? 'Mode: Roleplay task (goal-oriented spoken interaction).'
      : m === 'fluency'
      ? 'Mode: Fluency builder (timed monologue + follow-up).'
      : 'Mode: Shadowing/echo (compare user to target text; be honest about limitations).';

  return [
    'You are a Finnish speaking coach.',
    `CEFR level: ${lvl}.`,
    modeLine,
    'Always respond with STRICT JSON only (no prose).',
    'Keep feedback short and immediately usable.',
    'Do not invent what the user said if confidence is low.',
    'Output schema:',
    '{',
    '  "ai_reply_fi": "string",',
    '  "feedback": {',
    '    "one_big_win": "string",',
    '    "one_fix_now": "string",',
    '    "better_version_fi": "string",',
    '    "micro_drill": ["string"]',
    '  },',
    '  "next_prompt_fi": "string",',
    '  "level_adjustment": "stay|up|down",',
    '  "flags": { "low_confidence_stt": true|false }',
    '}',
  ].join('\n');
};

const validateSpeakingTurnOutput = (candidate, { targetText } = {}) => {
  const obj = candidate && typeof candidate === 'object' ? candidate : {};

  const ai_reply_fi = safeString(obj.ai_reply_fi).trim() || DEFAULT_OUTPUT.ai_reply_fi;
  const next_prompt_fi = safeString(obj.next_prompt_fi).trim() || DEFAULT_OUTPUT.next_prompt_fi;

  const level_adjustmentRaw = safeString(obj.level_adjustment).toLowerCase();
  const level_adjustment =
    level_adjustmentRaw === 'up' || level_adjustmentRaw === 'down' || level_adjustmentRaw === 'stay'
      ? level_adjustmentRaw
      : DEFAULT_OUTPUT.level_adjustment;

  const flagsObj = obj.flags && typeof obj.flags === 'object' ? obj.flags : {};
  const low_confidence_stt =
    typeof flagsObj.low_confidence_stt === 'boolean'
      ? flagsObj.low_confidence_stt
      : DEFAULT_OUTPUT.flags.low_confidence_stt;

  const feedbackObj = obj.feedback && typeof obj.feedback === 'object' ? obj.feedback : {};
  const one_big_win = safeString(feedbackObj.one_big_win).trim() || DEFAULT_OUTPUT.feedback.one_big_win;
  const one_fix_now = safeString(feedbackObj.one_fix_now).trim() || DEFAULT_OUTPUT.feedback.one_fix_now;
  const better_version_fi =
    safeString(feedbackObj.better_version_fi).trim() ||
    safeString(targetText).trim() ||
    DEFAULT_OUTPUT.feedback.better_version_fi;
  const micro_drill = normalizeMicroDrill(feedbackObj.micro_drill);
  const dimensionRaw = safeString(feedbackObj.dimension).toLowerCase();
  const dimension =
    dimensionRaw === 'clarity' ||
    dimensionRaw === 'grammar' ||
    dimensionRaw === 'pronunciation' ||
    dimensionRaw === 'appropriateness'
      ? dimensionRaw
      : DEFAULT_OUTPUT.feedback.dimension;
  const feedbackLevelAdjRaw = safeString(feedbackObj.level_adjustment).toLowerCase();
  const feedbackLevelAdj =
    feedbackLevelAdjRaw === 'up' || feedbackLevelAdjRaw === 'down' || feedbackLevelAdjRaw === 'stay'
      ? feedbackLevelAdjRaw
      : level_adjustment;

  return {
    ai_reply_fi: ai_reply_fi.slice(0, 600),
    feedback: {
      one_big_win: one_big_win.slice(0, 280),
      one_fix_now: one_fix_now.slice(0, 280),
      better_version_fi: better_version_fi.slice(0, 600),
      micro_drill,
      level_adjustment: feedbackLevelAdj,
      dimension,
    },
    next_prompt_fi: next_prompt_fi.slice(0, 400),
    level_adjustment,
    flags: { low_confidence_stt },
  };
};

/**
 * Coerce a raw model output (object or JSON string) into a valid SpeakingTurn object.
 * - If parsing fails (invalid JSON), returns the validated default output.
 * - If fields are missing/invalid, they are filled from defaults.
 */
export function coerceSpeakingTurnOutput(raw, { targetText } = {}) {
  try {
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      return validateSpeakingTurnOutput(parsed, { targetText });
    }
    return validateSpeakingTurnOutput(raw, { targetText });
  } catch {
    return validateSpeakingTurnOutput(null, { targetText });
  }
}

const generateLocalTurn = ({ userTranscript, level, mode, userState }) => {
  const lvl = normalizeLevel(level);
  const m = normalizeMode(mode);
  const transcript = safeString(userTranscript).trim();
  const targetText = safeString(userState?.target_text || userState?.targetText).trim();

  const lowConfidence = isLowConfidenceTranscript(transcript);

  const shortAck =
    lvl === 'A1' || lvl === 'A2'
      ? 'Hyvä! Kiitos.'
      : lvl === 'B1' || lvl === 'B2'
      ? 'Hyvä! Ymmärrän.'
      : 'Hyvä — jatketaan.';

  const followUp =
    m === 'guided'
      ? 'Kysymys: Mitä teet tänään?'
      : m === 'roleplay'
      ? 'Kysymys: Voitko sanoa sen vielä kerran selkeämmin?'
      : m === 'fluency'
      ? 'Seuraava: Kerro yksi esimerkki.'
      : 'Toista vielä kerran rauhassa.';

  const ai_reply_fi = lowConfidence ? 'En saanut selvää. Voitko toistaa hitaammin?' : `${shortAck} ${followUp}`;
  const next_prompt_fi = m === 'shadowing' ? (targetText ? `Toista: "${targetText}"` : DEFAULT_OUTPUT.next_prompt_fi) : followUp;

  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
  const level_adjustment =
    lowConfidence ? 'down' : m === 'fluency' && wordCount >= 25 ? 'up' : 'stay';

  const better_version_fi = m === 'shadowing' ? targetText : '';
  const dimension =
    m === 'shadowing'
      ? 'pronunciation'
      : m === 'roleplay'
      ? 'appropriateness'
      : m === 'fluency'
      ? 'clarity'
      : 'clarity';
  const micro_drill =
    m === 'shadowing'
      ? [
          targetText ? `Toista: "${targetText}"` : 'Toista sama lause uudelleen.',
          'Pidä taukojen sijaan tasainen rytmi.',
        ]
      : ['Vastaa yhdellä täydellä lauseella.', 'Toista sama asia hitaammin kerran.'];

  const output = {
    ai_reply_fi,
    feedback: {
      one_big_win: lowConfidence ? 'Hyvä että yritit.' : 'Hyvä yritys — pysyit aiheessa.',
      one_fix_now: lowConfidence
        ? 'Puhu hitaammin ja lähempänä mikrofonia.'
        : m === 'shadowing'
        ? 'Vertaa sanoja: poista ylimääräiset sanat ja lisää puuttuvat.'
        : 'Käytä yhtä selkeää lausetta ja vältä täytesanoja.',
      better_version_fi,
      micro_drill,
      level_adjustment,
      dimension,
    },
    next_prompt_fi,
    level_adjustment,
    flags: { low_confidence_stt: lowConfidence },
  };

  return validateSpeakingTurnOutput(output, { targetText });
};

/**
 * generateSpeakingTurn(input) -> validated SpeakingTurn object.
 *
 * This does not call OpenAI. It:
 * - builds a system prompt template (for future model integration),
 * - produces a local heuristic turn (usable as a fallback),
 * - validates and normalizes output to the strict contract.
 */
export function generateSpeakingTurn(input = {}) {
  const userTranscript = safeString(input.user_transcript || input.userTranscript);
  const level = normalizeLevel(input.level);
  const mode = normalizeMode(input.mode);
  const userState = input.user_state && typeof input.user_state === 'object' ? input.user_state : {};

  const system_prompt = buildSystemPrompt({ level, mode });

  // For now we return only the strict SpeakingTurn payload (no extra keys),
  // but we keep `system_prompt` available via closure for future integration.
  void system_prompt;

  return generateLocalTurn({ userTranscript, level, mode, userState });
}
