// Authentication service

import { HTTP_API_BASE } from '../config/backend';

async function fetchWithAuth(url, options = {}) {
  try {
    const response = await fetch(`${HTTP_API_BASE}${url}`, options);
    return response;
  } catch (error) {
    throw new Error('Backend unreachable');
  }
}

export async function login(email, password) {
  // Auth strategy: backend owns user creation via /auth/register; no pre-seeded users assumed.
  const response = await fetchWithAuth('/auth/login', {
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
  const response = await fetchWithAuth('/auth/register', {
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
  const response = await fetchWithAuth('/auth/refresh', {
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
  const response = await fetchWithAuth('/auth/me', {
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
