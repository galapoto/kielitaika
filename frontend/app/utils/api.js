import { HTTP_API_BASE } from '../config/backend';

const DEFAULT_USER_ID = process.env.EXPO_PUBLIC_USER_ID || 'demo-user';

// Get auth token from storage
async function getAuthToken() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('@ruka_token');
  } catch (e) {
    return null;
  }
}

// Fetch with auth token
async function fetchWithAuth(url, options = {}) {
  // Add auth token if available
  const token = await getAuthToken();
  if (token && !options.headers?.['Authorization']) {
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${HTTP_API_BASE}${url}`, options);
  return response;
}

// Get current user ID from auth context or fallback
async function getUserId() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const authData = await AsyncStorage.getItem('@ruka_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user?.id || DEFAULT_USER_ID;
    }
  } catch (e) {
    // Fallback to default
  }
  return DEFAULT_USER_ID;
}

async function handleResponse(res) {
  if (res.ok) return res.json();
  let detail = 'Request failed';
  try {
    const data = await res.json();
    detail = data.detail || data.reason || detail;
  } catch (_) {
    detail = res.statusText || detail;
  }
  if (res.status === 402) throw new Error(`Upgrade required: ${detail}`);
  throw new Error(detail);
}

async function getStorage() {
  return require('@react-native-async-storage/async-storage').default;
}

async function loadJson(key, fallback) {
  try {
    const storage = await getStorage();
    const raw = await storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

async function saveJson(key, value) {
  try {
    const storage = await getStorage();
    await storage.setItem(key, JSON.stringify(value));
  } catch (_) {
    // Ignore storage failures in dev mode
  }
}

const ykiStateKey = (userId) => `@ruka_yki_state:${userId || DEFAULT_USER_ID}`;
const ykiProgressKey = (userId) => `@ruka_yki_progress:${userId || DEFAULT_USER_ID}`;

function defaultYkiState(userId) {
  return {
    user_id: userId || DEFAULT_USER_ID,
    target_level_band: 'B1-B2',
    current_level: 'B1',
    goal_date: null,
    weekly_plan: null,
    recommended_next_action: 'continue_daily_session',
    speaking_state: { last_scores: {}, completed_tasks: 0 },
    listening_state: { last_scores: {}, completed_tasks: 0 },
    reading_state: { last_scores: {}, completed_tasks: 0 },
    writing_state: { last_scores: {}, completed_tasks: 0 },
    last_calibration_at: null,
  };
}

function defaultYkiProgress() {
  return {
    total_sessions: 0,
    total_attempts: 0,
    last_active: null,
  };
}

export async function sendMessage(payload) {
  const userId = await getUserId();
  const res = await fetchWithAuth('/session/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...payload }),
  });
  return handleResponse(res);
}

export async function analyzePronunciation(expectedText, transcript, audioBytes = null) {
  const res = await fetchWithAuth('/voice/pronunciation/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expected_text: expectedText, transcript, audio_bytes: audioBytes }),
  });
  return handleResponse(res);
}

export async function computeSupportLevel(history, hesitation, accuracy) {
  const res = await fetchWithAuth('/progressive-disclosure/compute-level', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, hesitation, accuracy }),
  });
  return handleResponse(res);
}

export async function maskText(text, level) {
  const res = await fetchWithAuth('/progressive-disclosure/mask-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, level }),
  });
  return handleResponse(res);
}

export async function listPaths() {
  const res = await fetchWithAuth('/vocab/paths');
  return handleResponse(res);
}

export async function listWorkplaceFields() {
  const res = await fetchWithAuth('/workplace/fields');
  return handleResponse(res);
}

export async function fetchWorkplaceLesson(field, level = 'B1') {
  const userId = await getUserId();
  const res = await fetchWithAuth('/workplace/lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, field, level }),
  });
  return handleResponse(res);
}

export async function fetchVocab(path = 'general', field = null, limit = 12) {
  const url = new URL(`${HTTP_API_BASE}/vocab/units`);
  url.searchParams.set('path', path);
  if (field) url.searchParams.set('field', field);
  url.searchParams.set('limit', String(limit));
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { headers });
  return handleResponse(res);
}

export async function fetchRoleplay(field, scenarioTitle = null, level = 'B1') {
  const userId = await getUserId();
  const res = await fetchWithAuth('/workplace/dialogue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, field, scenario_title: scenarioTitle, level }),
  });
  return handleResponse(res);
}

export async function evaluateRoleplay(field, transcript) {
  const userId = await getUserId();
  const res = await fetchWithAuth('/workplace/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, field, transcript }),
  });
  return handleResponse(res);
}

export async function startRoleplaySession({ field, scenarioTitle = null, level = null, userId = null }) {
  const resolvedUserId = userId || await getUserId();
  const res = await fetchWithAuth('/roleplay/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role_or_field: field,
      scenario_identifier: scenarioTitle,
      difficulty_optional: level,
      user_id: resolvedUserId,
    }),
  });
  return handleResponse(res);
}

export async function fetchSrsQueue(errors = [], field = null, limit = 10) {
  const res = await fetchWithAuth('/vocab/srs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ errors, field, limit }),
  });
  return handleResponse(res);
}

export async function generateYkiExam(examType = 'full', level = 'intermediate') {
  const userId = await getUserId();
  const res = await fetchWithAuth('/yki/exam/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, exam_type: examType, level }),
  });
  return handleResponse(res);
}

export async function submitYkiExam(examId, speakingResponses = [], writingResponses = []) {
  const userId = await getUserId();
  const res = await fetchWithAuth('/yki/exam/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, exam_id: examId, speaking_responses: speakingResponses, writing_responses: writingResponses }),
  });
  return handleResponse(res);
}

export async function fetchRecharge(userId = DEFAULT_USER_ID) {
  const url = new URL(`${HTTP_API_BASE}/recharge/today`);
  if (userId) url.searchParams.set('user_id', userId);
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { headers });
  return handleResponse(res);
}

export async function fetchMicroTask(userId = null) {
  if (!userId) userId = await getUserId();
  const url = new URL(`${HTTP_API_BASE}/output/micro`);
  if (userId) url.searchParams.set('user_id', userId);
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { headers });
  return handleResponse(res);
}

export async function submitMicroTask(taskId, transcript) {
  const res = await fetchWithAuth('/output/micro/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, transcript }),
  });
  return handleResponse(res);
}

export async function fetchPronunciationNudge(expectedText = '', transcript = '') {
  const res = await fetchWithAuth('/voice/pronunciation/nudge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expected_text: expectedText, transcript }),
  });
  return handleResponse(res);
}

export async function fetchShadowLine(level = 'A1') {
  const url = new URL(`${HTTP_API_BASE}/shadowing/line`);
  url.searchParams.set('level', level);
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { headers });
  return handleResponse(res);
}

export async function scoreShadowing(expected, transcript) {
  const res = await fetchWithAuth('/shadowing/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expected, transcript }),
  });
  return handleResponse(res);
}

export async function fetchSubscriptionStatus(userId = null) {
  if (!userId) userId = await getUserId();
  const url = new URL(`${HTTP_API_BASE}/subscription/status`);
  if (userId) url.searchParams.set('user_id', userId);
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { headers });
  return handleResponse(res);
}

export async function upgradeSubscription(tier = 'professional_premium', trialDays = 0, userId = null) {
  if (!userId) userId = await getUserId();
  const res = await fetchWithAuth('/subscription/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, tier, trial_days: trialDays }),
  });
  return handleResponse(res);
}

export async function createCheckoutSession(tier, trialDays = 0) {
  const res = await fetchWithAuth('/payments/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tier,
      trial_days: trialDays,
      success_url: 'kielitaika://subscription/success',
      cancel_url: 'kielitaika://subscription/cancel',
    }),
  });
  return handleResponse(res);
}

export async function createPortalSession() {
  const res = await fetchWithAuth('/payments/create-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      return_url: 'kielitaika://subscription',
    }),
  });
  return handleResponse(res);
}

export async function updateUserProfile(profileData, userId = null) {
  if (!userId) userId = await getUserId();
  const res = await fetchWithAuth('/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...profileData }),
  });
  return handleResponse(res);
}

// --- YKI helpers (local dev fallbacks + backend when available) ---

export async function getYkiLearnerState(userId = null) {
  const uid = userId || await getUserId();
  const key = ykiStateKey(uid);
  let state = await loadJson(key, null);
  if (!state) {
    state = defaultYkiState(uid);
    await saveJson(key, state);
  }
  return state;
}

export async function setYkiGoal(targetBand, targetDate, weeklyPlan) {
  const uid = await getUserId();
  const key = ykiStateKey(uid);
  const state = await getYkiLearnerState(uid);
  const updated = {
    ...state,
    target_level_band: targetBand,
    goal_date: targetDate,
    weekly_plan: weeklyPlan || null,
    recommended_next_action: 'continue_daily_session',
  };
  await saveJson(key, updated);
  return updated;
}

export async function getYkiProgress(userId = null) {
  const uid = userId || await getUserId();
  const key = ykiProgressKey(uid);
  let progress = await loadJson(key, null);
  if (!progress) {
    progress = defaultYkiProgress();
    await saveJson(key, progress);
  }
  return progress;
}

export async function checkYkiCalibration() {
  const state = await getYkiLearnerState();
  return {
    calibration: {
      calibration_needed: false,
      reason: null,
      last_calibration_at: state?.last_calibration_at || null,
      days_since_last: null,
      attempts_since_last: null,
    },
  };
}

export async function getYkiProgressSignals(sessionDate = null) {
  return {
    signals: [
      'Hyvä rytmi: jatka 3 harjoitusta / viikko.',
      'Puhuminen vahvistuu — pidä 60–90 s vastaukset.',
      'Sanavarasto kasvaa: lisää 5 uutta sanaa / päivä.',
    ],
    session_date: sessionDate,
  };
}

export async function evaluateYkiSpeaking(transcript = '') {
  const userId = await getUserId();
  const res = await fetchWithAuth('/yki/speaking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, transcript }),
  });
  return handleResponse(res);
}

export async function evaluateYkiWriting(text = '') {
  const userId = await getUserId();
  const res = await fetchWithAuth('/yki/writing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, text }),
  });
  return handleResponse(res);
}

export async function generateYkiPractice(kind = 'speaking', level = 'intermediate') {
  if (kind === 'speaking' || kind === 'writing') {
    const examType = kind === 'speaking' ? 'speaking_only' : 'writing_only';
    const res = await fetchWithAuth('/yki/exam/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: await getUserId(), exam_type: examType, level }),
    });
    const data = await handleResponse(res);
    if (data?.exam?.tasks?.length) {
      data.exam.tasks = data.exam.tasks.map((task) => ({
        ...task,
        type: kind,
      }));
    }
    return data;
  }

  // Local fallback for reading/listening practice (backend does not provide yet).
  const now = new Date().toISOString();
  if (kind === 'reading') {
    return {
      exam: {
        exam_id: `yki_read_${Date.now()}`,
        exam_type: 'reading_only',
        level,
        created_at: now,
        total_time_minutes: 10,
        tasks: [
          {
            id: 'reading_1',
            type: 'reading',
            text:
              'Lue seuraava teksti ja vastaa kysymyksiin.\n\nHelsinki on Suomen pääkaupunki. Se sijaitsee Etelä-Suomessa ja on maan suurin kaupunki.',
            questions: [
              { id: 1, question: 'Mikä on Suomen pääkaupunki?', options: ['Helsinki', 'Tampere', 'Turku'], correct: 0 },
              { id: 2, question: 'Missä Helsinki sijaitsee?', options: ['Länsi-Suomessa', 'Etelä-Suomessa', 'Pohjois-Suomessa'], correct: 1 },
            ],
          },
        ],
      },
    };
  }

  if (kind === 'listening') {
    return {
      exam: {
        exam_id: `yki_listen_${Date.now()}`,
        exam_type: 'listening_only',
        level,
        created_at: now,
        total_time_minutes: 8,
        tasks: [
          {
            id: 'listening_1',
            type: 'listening',
            script_fi:
              'Moi! Tänään sää on aurinkoinen. Menemme puistoon kello kolmelta ja tapaamme ystävät siellä.',
            transcript:
              'Moi! Tänään sää on aurinkoinen. Menemme puistoon kello kolmelta ja tapaamme ystävät siellä.',
            questions: [
              { id: 1, question: 'Millainen sää on tänään?', options: ['Sateinen', 'Aurinkoinen', 'Tuulinen'], correct: 1 },
              { id: 2, question: 'Mihin mennään?', options: ['Kauppaan', 'Puistoon', 'Kotiin'], correct: 1 },
              { id: 3, question: 'Mihin aikaan?', options: ['klo 12', 'klo 15', 'klo 18'], correct: 1 },
            ],
            meta: { source: 'local_stub' },
          },
        ],
      },
    };
  }

  return { exam: { tasks: [] } };
}

export async function generateYkiListeningTask(level = 'B1') {
  const exam = await generateYkiPractice('listening', level);
  return { task: exam?.exam?.tasks?.[0] || null };
}

export async function getYkiSpeakingModes() {
  return {
    modes: {
      S1: { name: 'Arki', description: 'Luonnollinen arjen keskustelu', max_turns: 6, style: 'rento' },
      S2: { name: 'Palvelu', description: 'Asiointi ja palvelutilanne', max_turns: 6, style: 'asiallinen' },
      S3: { name: 'Mielipide', description: 'Keskustele mielipiteestäsi', max_turns: 6, style: 'rakenteinen' },
      S4: { name: 'Haastava', description: 'Pidä keskustelu aktiivisena', max_turns: 6, style: 'vaativa' },
    },
  };
}

export async function startYkiSpeakingDialogue(mode = 'S1', level = 'B1') {
  const modeInfo = (await getYkiSpeakingModes()).modes?.[mode];
  return {
    session_id: `yki_dialogue_${Date.now()}`,
    level,
    mode,
    mode_info: modeInfo || { name: 'Vuoropuhelu', description: 'Harjoituskeskustelu', max_turns: 6, style: 'neutraali' },
    initial_prompt: 'Aloitetaan! Kerro lyhyesti päivästäsi.',
  };
}

export async function respondYkiSpeakingDialogue(mode, level, userText, turn = 1, history = []) {
  const reply = turn >= 5
    ? 'Kiitos! Tämä riittää. Hyvää työtä.'
    : 'Hyvä! Kerro lisää yhdestä yksityiskohdasta.';
  return {
    reply,
    hint: 'Muista käyttää selkeitä lauseita ja konkreettisia esimerkkejä.',
    evaluation: {
      band: 'B1.1',
      scores: { fluency: 3.1, grammar: 2.8, vocabulary: 3.0, coherence: 2.9 },
    },
    next_action: turn >= 5 ? 'complete' : 'continue',
    turn,
    mode,
    level,
    history,
  };
}

export async function getYkiTodaySession(mode = 'training') {
  const userId = await getUserId();
  const today = new Date().toISOString().split('T')[0];
  const tasks = [
    {
      task_id: `yki_${today}_speaking`,
      task_type: 'speaking',
      level: 'intermediate',
      mode,
      prompt_fi: 'Kerro lyhyesti päivästäsi. Mitä teit tänään?',
    },
    {
      task_id: `yki_${today}_writing`,
      task_type: 'writing',
      level: 'intermediate',
      mode,
      prompt_fi: 'Kirjoita lyhyt teksti ystävällesi viikonlopun suunnitelmista.',
    },
  ];

  // Update total sessions on first fetch of today.
  const progress = await getYkiProgress(userId);
  if (progress.last_active !== today) {
    const updated = {
      ...progress,
      total_sessions: (progress.total_sessions || 0) + 1,
      last_active: today,
    };
    await saveJson(ykiProgressKey(userId), updated);
  }

  return {
    session: {
      session_id: `yki_session_${today}`,
      session_date: today,
      total_count: tasks.length,
      plan: {
        tasks,
        estimated_minutes: 15,
      },
    },
    calibration: {
      calibration_needed: false,
      reason: null,
    },
  };
}

export async function submitYkiAttempt(payload = {}) {
  const userId = await getUserId();
  const progress = await getYkiProgress(userId);
  const updatedProgress = {
    ...progress,
    total_attempts: (progress.total_attempts || 0) + 1,
    last_active: new Date().toISOString().split('T')[0],
  };
  await saveJson(ykiProgressKey(userId), updatedProgress);

  const state = await getYkiLearnerState(userId);
  const skillKey = payload?.task_type ? `${payload.task_type}_state` : null;
  const scoreJson = payload?.score_json || {};

  if (skillKey && state?.[skillKey]) {
    state[skillKey] = {
      ...state[skillKey],
      completed_tasks: (state[skillKey].completed_tasks || 0) + 1,
      last_scores: scoreJson && Object.keys(scoreJson).length ? scoreJson : state[skillKey].last_scores,
    };
    await saveJson(ykiStateKey(userId), state);
  }

  return {
    status: 'ok',
    next: {
      auto_advance: true,
    },
  };
}
