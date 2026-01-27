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

/**
 * Generate session ID based on screen name and route params
 */
function generateSessionId(screenName, route, user) {
  const params = route?.params || {};
  
  switch (screenName) {
    case 'Conversation': {
      const { level = 'A1', path = 'general', field = null, type = 'speaking' } = params;
      const userId = user?.id || 'anon';
      return `conversation:${userId}:${path}:${field || 'none'}:${type}:${Date.now()}`;
    }
    
    case 'Roleplay': {
      const { field = 'sairaanhoitaja', scenarioTitle = null, level = 'B1' } = params;
      return `roleplay:${field}:${scenarioTitle || 'default'}:${level}:${Date.now()}`;
    }
    
    case 'Fluency': {
      return `fluency:${Date.now()}`;
    }
    
    case 'GuidedTurn': {
      const { source = 'unknown', entrypoint = 'unknown' } = params;
      return `guided:${source}:${entrypoint}:${Date.now()}`;
    }
    
    case 'Shadowing': {
      return `shadowing:${Date.now()}`;
    }
    
    case 'MicroOutput': {
      const { taskId = 'pending' } = params;
      return `micro-output:${taskId}:${Date.now()}`;
    }
    
    default: {
      return `${screenName.toLowerCase()}:${Date.now()}`;
    }
  }
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
export default function SpeakingScreenWrapper({ screenName, ScreenComponent }) {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const sessionId = useMemo(
    () => generateSessionId(screenName, route, user),
    [screenName, route, user]
  );
  
  const options = useMemo(
    () => getSessionOptions(screenName),
    [screenName]
  );
  
  return (
    <SpeakingSessionProvider sessionId={sessionId} options={options}>
      <ScreenComponent route={route} navigation={navigation} />
    </SpeakingSessionProvider>
  );
}
