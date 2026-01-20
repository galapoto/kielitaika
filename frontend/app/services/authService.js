// Authentication service

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';
const API_BASE_ALT = 'http://localhost:8001';

async function fetchWithFallback(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, options);
    if (response.ok || response.status !== 0) return response;
  } catch (e) {
    // Network error, try 8001
  }
  try {
    return await fetch(`${API_BASE_ALT}${url}`, options);
  } catch (e) {
    throw new Error(`API request failed: ${e.message}`);
  }
}

export async function login(email, password) {
  const response = await fetchWithFallback('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

export async function register(email, password, name = null) {
  const response = await fetchWithFallback('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}

export async function refreshToken(refreshTokenValue) {
  const response = await fetchWithFallback('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Token refresh failed' }));
    throw new Error(error.detail || 'Token refresh failed');
  }

  return response.json();
}

export async function getCurrentUser(token) {
  const response = await fetchWithFallback('/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get user' }));
    throw new Error(error.detail || 'Failed to get user');
  }

  return response.json();
}
