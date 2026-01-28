import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { login, register, refreshToken, getCurrentUser } from '../services/authService';

// Use AsyncStorage for native, localStorage for web
let AsyncStorage;
if (Platform.OS === 'web') {
  AsyncStorage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
    },
  };
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = '@ruka_auth';
const TOKEN_STORAGE_KEY = '@ruka_token';
const REFRESH_TOKEN_STORAGE_KEY = '@ruka_refresh_token';

const deriveAccessState = (tier) => {
  const normalizedTier = tier || 'free';
  const hasYkiAccess = normalizedTier === 'general_premium' || normalizedTier === 'professional_premium';
  const hasWorkAccess = normalizedTier === 'professional_premium';
  return {
    tier: normalizedTier,
    yki: hasYkiAccess,
    work: hasWorkAccess,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load auth state from storage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (token && refreshTokenValue) {
      const interval = setInterval(() => {
        handleRefreshToken();
      }, 25 * 60 * 1000); // Refresh every 25 minutes (token expires in 30)

      return () => clearInterval(interval);
    }
  }, [token, refreshTokenValue]);

  const loadAuthState = async () => {
    try {
      const [storedAuth, storedToken, storedRefresh] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
      ]);

      if (storedAuth && storedToken) {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
        setToken(storedToken);
        setRefreshTokenValue(storedRefresh);
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          await getCurrentUser(storedToken);
        } catch (err) {
          // Token expired, try refresh
          if (storedRefresh) {
            await handleRefreshToken();
          } else {
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      console.log('AuthContext: Starting login for', email);
      const response = await login(email, password);
      console.log('AuthContext: Login response received', { user_id: response?.user_id, email: response?.email });
      await saveAuthState(response);
      console.log('AuthContext: Auth state saved, isAuthenticated should be true');
      return response;
    } catch (error) {
      console.error('AuthContext: Login failed', error);
      throw error;
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      const response = await register(email, password, name);
      await saveAuthState(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleRefreshToken = async () => {
    if (!refreshTokenValue) return;

    try {
      const response = await refreshToken(refreshTokenValue);
      await saveAuthState(response);
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const saveAuthState = async (authData) => {
    const rawUser = authData?.user || authData;
    const userData = {
      id: rawUser?.id ?? rawUser?.user_id ?? authData?.user_id ?? null,
      email: rawUser?.email ?? authData?.email ?? null,
      subscriptionTier:
        rawUser?.subscription_tier ??
        rawUser?.subscriptionTier ??
        authData?.subscription_tier ??
        authData?.subscriptionTier ??
        null,
    };

    console.log('AuthContext: Saving auth state', { userId: userData.id, email: userData.email });
    
    await Promise.all([
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userData })),
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, authData.access_token ?? authData.token ?? ''),
      AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authData.refresh_token ?? authData.refreshToken ?? ''),
    ]);

    setUser(userData);
    setToken(authData.access_token ?? authData.token ?? null);
    setRefreshTokenValue(authData.refresh_token ?? authData.refreshToken ?? null);
    setIsAuthenticated(true);
    
    console.log('AuthContext: Auth state updated, isAuthenticated = true');
  };

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    setRefreshTokenValue(null);
    setIsAuthenticated(false);
  };

  const logout = async () => {
    // Clear in-memory state immediately so UI reacts even if storage ops fail.
    clearAuthState();
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    accessState: deriveAccessState(user?.subscriptionTier),
    login: handleLogin,
    register: handleRegister,
    logout,
    refreshToken: handleRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
