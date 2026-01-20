// API base URL - defaults to 8000, but can use 8001 if 8000 is busy
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';
const API_BASE_ALT = 'http://localhost:8001';
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

// Helper to try both ports (8000 first, then 8001)
async function fetchWithFallback(url, options = {}) {
  // Add auth token if available
  const token = await getAuthToken();
  if (token && !options.headers?.['Authorization']) {
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, options);
    if (response.ok || response.status !== 0) return response;
    // If response failed but not network error, try 8001
  } catch (e) {
    // Network error, try 8001
  }
  // Try port 8001
  try {
    return await fetch(`${API_BASE_ALT}${url}`, options);
  } catch (e) {
    throw new Error(`API request failed on both ports: ${url}`);
  }
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
  const res = await fetchWithFallback('/session/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...payload }),
  });
  return handleResponse(res);
}

export async function analyzePronunciation(expectedText, transcript, audioBytes = null) {
  const res = await fetchWithFallback('/voice/pronunciation/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expected_text: expectedText, transcript, audio_bytes: audioBytes }),
  });
  return handleResponse(res);
}

export async function computeSupportLevel(history, hesitation, accuracy) {
  const res = await fetchWithFallback('/progressive-disclosure/compute-level', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, hesitation, accuracy }),
  });
  return handleResponse(res);
}

export async function maskText(text, level) {
  const res = await fetchWithFallback('/progressive-disclosure/mask-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, level }),
  });
  return handleResponse(res);
}

export async function listPaths() {
  const res = await fetchWithFallback('/vocab/paths');
  return handleResponse(res);
}

export async function listWorkplaceFields() {
  const res = await fetchWithFallback('/workplace/fields');
  return handleResponse(res);
}

export async function fetchWorkplaceLesson(field, level = 'B1') {
  const userId = await getUserId();
  const res = await fetchWithFallback('/workplace/lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, field, level }),
  });
  return handleResponse(res);
}

export async function fetchVocab(path = 'general', field = null, limit = 12) {
  // For URL with query params, we need to try both ports
  let url, res;
  try {
    url = new URL(`${API_BASE}/vocab/units`);
    url.searchParams.set('path', path);
    if (field) url.searchParams.set('field', field);
    url.searchParams.set('limit', String(limit));
    res = await fetch(url.toString());
    if (res.ok) return handleResponse(res);
  } catch (e) {}
  try {
    url = new URL(`${API_BASE_ALT}/vocab/units`);
    url.searchParams.set('path', path);
    if (field) url.searchParams.set('field', field);
    url.searchParams.set('limit', String(limit));
    res = await fetch(url.toString());
    return handleResponse(res);
  } catch (e) {
    throw new Error(`Failed to fetch vocab: ${e.message}`);
  }
}

export async function fetchRoleplay(field, scenarioTitle = null, level = 'B1') {
  const userId = await getUserId();
  const res = await fetchWithFallback('/workplace/dialogue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, field, scenario_title: scenarioTitle, level }),
  });
  return handleResponse(res);
}

export async function evaluateRoleplay(field, transcript) {
  const userId = await getUserId();
  const res = await fetchWithFallback('/workplace/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, field, transcript }),
  });
  return handleResponse(res);
}

export async function fetchSrsQueue(errors = [], field = null, limit = 10) {
  const res = await fetchWithFallback('/vocab/srs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ errors, field, limit }),
  });
  return handleResponse(res);
}

export async function generateYkiExam(examType = 'full', level = 'intermediate') {
  const userId = await getUserId();
  const res = await fetchWithFallback('/yki/exam/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, exam_type: examType, level }),
  });
  return handleResponse(res);
}

export async function submitYkiExam(examId, speakingResponses = [], writingResponses = []) {
  const userId = await getUserId();
  const res = await fetchWithFallback('/yki/exam/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, exam_id: examId, speaking_responses: speakingResponses, writing_responses: writingResponses }),
  });
  return handleResponse(res);
}

export async function fetchRecharge(userId = DEFAULT_USER_ID) {
  // For URL with query params, try both ports
  let url, res;
  try {
    url = new URL(`${API_BASE}/recharge/today`);
    if (userId) url.searchParams.set('user_id', userId);
    res = await fetch(url.toString());
    if (res.ok) return handleResponse(res);
  } catch (e) {}
  try {
    url = new URL(`${API_BASE_ALT}/recharge/today`);
    if (userId) url.searchParams.set('user_id', userId);
    res = await fetch(url.toString());
    return handleResponse(res);
  } catch (e) {
    throw new Error(`Failed to fetch recharge: ${e.message}`);
  }
}

export async function fetchMicroTask(userId = null) {
  if (!userId) userId = await getUserId();
  let url, res;
  try {
    url = new URL(`${API_BASE}/output/micro`);
    if (userId) url.searchParams.set('user_id', userId);
    res = await fetch(url.toString());
    if (res.ok) return handleResponse(res);
  } catch (e) {}
  try {
    url = new URL(`${API_BASE_ALT}/output/micro`);
    if (userId) url.searchParams.set('user_id', userId);
    res = await fetch(url.toString());
    return handleResponse(res);
  } catch (e) {
    throw new Error(`Failed to fetch micro task: ${e.message}`);
  }
}

export async function submitMicroTask(taskId, transcript) {
  const res = await fetchWithFallback('/output/micro/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, transcript }),
  });
  return handleResponse(res);
}

export async function fetchPronunciationNudge(expectedText = '', transcript = '') {
  const res = await fetchWithFallback('/voice/pronunciation/nudge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expected_text: expectedText, transcript }),
  });
  return handleResponse(res);
}

export async function fetchShadowLine(level = 'A1') {
  let url, res;
  try {
    url = new URL(`${API_BASE}/shadowing/line`);
    url.searchParams.set('level', level);
    res = await fetch(url.toString());
    if (res.ok) return handleResponse(res);
  } catch (e) {}
  try {
    url = new URL(`${API_BASE_ALT}/shadowing/line`);
    url.searchParams.set('level', level);
    res = await fetch(url.toString());
    return handleResponse(res);
  } catch (e) {
    throw new Error(`Failed to fetch shadow line: ${e.message}`);
  }
}

export async function scoreShadowing(expected, transcript) {
  const res = await fetchWithFallback('/shadowing/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expected, transcript }),
  });
  return handleResponse(res);
}

export async function fetchSubscriptionStatus(userId = null) {
  if (!userId) userId = await getUserId();
  let url, res;
  try {
    url = new URL(`${API_BASE}/subscription/status`);
    if (userId) url.searchParams.set('user_id', userId);
    res = await fetch(url.toString());
    if (res.ok) return handleResponse(res);
  } catch (e) {}
  try {
    url = new URL(`${API_BASE_ALT}/subscription/status`);
    if (userId) url.searchParams.set('user_id', userId);
    res = await fetch(url.toString());
    return handleResponse(res);
  } catch (e) {
    throw new Error(`Failed to fetch subscription status: ${e.message}`);
  }
}

export async function upgradeSubscription(tier = 'professional_premium', trialDays = 0, userId = null) {
  if (!userId) userId = await getUserId();
  const res = await fetchWithFallback('/subscription/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, tier, trial_days: trialDays }),
  });
  return handleResponse(res);
}

export async function createCheckoutSession(tier, trialDays = 0) {
  const res = await fetchWithFallback('/payments/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tier,
      trial_days: trialDays,
      success_url: 'ruka://subscription/success',
      cancel_url: 'ruka://subscription/cancel',
    }),
  });
  return handleResponse(res);
}

export async function createPortalSession() {
  const res = await fetchWithFallback('/payments/create-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      return_url: 'ruka://subscription',
    }),
  });
  return handleResponse(res);
}
