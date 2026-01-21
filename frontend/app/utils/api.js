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
