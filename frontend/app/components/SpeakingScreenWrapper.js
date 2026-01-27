/**
 * SpeakingScreenWrapper - Wraps speaking screens with SpeakingSessionProvider
 * 
 * Generates session ID from route params and provides session context.
 * This ensures sessions are created at the provider level, not per-screen.
 */

import React, { useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SpeakingSessionProvider } from '../context/SpeakingSessionContext';

// Session ID cache per route key to prevent duplicate sessions on re-renders
const sessionIdCache = new Map();

/**
 * Generate session ID based on screen name and route params
 * Uses route.key to ensure stable ID per navigation instance
 */
function generateSessionId(screenName, route, user) {
  const params = route?.params || {};
  const routeKey = route?.key || `${screenName}-${Date.now()}`;
  
  // Check cache first to prevent duplicate sessions
  if (sessionIdCache.has(routeKey)) {
    return sessionIdCache.get(routeKey);
  }
  
  let sessionId;
  
  switch (screenName) {
    case 'Conversation': {
      const { level = 'A1', path = 'general', field = null, type = 'speaking' } = params;
      const userId = user?.id || 'anon';
      sessionId = `conversation:${userId}:${path}:${field || 'none'}:${type}:${Date.now()}`;
      break;
    }
    
    case 'Roleplay': {
      const { field = 'sairaanhoitaja', scenarioTitle = null, level = 'B1' } = params;
      sessionId = `roleplay:${field}:${scenarioTitle || 'default'}:${level}:${Date.now()}`;
      break;
    }
    
    case 'Fluency': {
      sessionId = `fluency:${Date.now()}`;
      break;
    }
    
    case 'GuidedTurn': {
      const { source = 'unknown', entrypoint = 'unknown' } = params;
      sessionId = `guided:${source}:${entrypoint}:${Date.now()}`;
      break;
    }
    
    case 'Shadowing': {
      sessionId = `shadowing:${Date.now()}`;
      break;
    }
    
    case 'MicroOutput': {
      const { taskId = 'pending' } = params;
      sessionId = `micro-output:${taskId}:${Date.now()}`;
      break;
    }
    
    default: {
      sessionId = `${screenName.toLowerCase()}:${Date.now()}`;
      break;
    }
  }
  
  // Cache the session ID for this route key
  sessionIdCache.set(routeKey, sessionId);
  
  // Clean up cache after 5 minutes to prevent memory leaks
  setTimeout(() => {
    sessionIdCache.delete(routeKey);
  }, 5 * 60 * 1000);
  
  return sessionId;
}

/**
 * Get session options based on screen name
 */
function getSessionOptions(screenName) {
  switch (screenName) {
    case 'YKIPracticeSpeaking':
      return { maxTurns: 10, autoStart: true, isYki: true };
    default:
      return { maxTurns: 5, autoStart: true };
  }
}

/**
 * SpeakingScreenWrapper
 * 
 * Wraps a speaking screen component with SpeakingSessionProvider.
 * Generates session ID from route params and provides session context.
 */
export default function SpeakingScreenWrapper({ screenName, ScreenComponent, route: routeProp, navigation: navigationProp, ...otherProps }) {
  // Use hooks as fallback, but prefer props if provided (React Navigation passes them)
  const routeHook = useRoute();
  const navigationHook = useNavigation();
  const route = routeProp || routeHook;
  const navigation = navigationProp || navigationHook;
  const { user } = useAuth();
  
  // Generate session ID once per route instance
  // Use route.key to ensure stable ID per navigation instance (prevents duplicate sessions)
  const sessionId = useMemo(
    () => generateSessionId(screenName, route, user),
    [screenName, route?.key, route?.params, user?.id]
  );
  
  const options = useMemo(
    () => getSessionOptions(screenName),
    [screenName]
  );
  
  return (
    <SpeakingSessionProvider sessionId={sessionId} options={options}>
      <ScreenComponent route={route} navigation={navigation} {...otherProps} />
    </SpeakingSessionProvider>
  );
}
