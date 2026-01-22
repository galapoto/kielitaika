// Payment Service - API calls for Stripe payments

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

async function getAuthToken() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('@ruka_token');
  } catch (e) {
    return null;
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export async function createCheckoutSession(tier, trialDays = 0) {
  return fetchWithAuth('/payments/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      tier,
      trial_days: trialDays,
      success_url: 'ruka://subscription/success',
      cancel_url: 'ruka://subscription/cancel',
    }),
  });
}

export async function createCustomerPortal(returnUrl = 'ruka://subscription') {
  return fetchWithAuth('/payments/create-portal', {
    method: 'POST',
    body: JSON.stringify({
      return_url: returnUrl,
    }),
  });
}

export async function getSubscriptionStatus() {
  // This should come from subscription router, but for now use auth endpoint
  try {
    const token = await getAuthToken();
    if (!token) return null;
    
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        tier: data.subscription_tier || 'free',
        user_id: data.user_id,
      };
    }
    return null;
  } catch (e) {
    console.error('Failed to get subscription status:', e);
    return null;
  }
}


































