/**
 * SpeakingSessionContext - Centralized session lifecycle management
 * 
 * Ensures that speaking sessions are created exactly once and managed
 * at the provider level, not per-screen.
 */

import React, { createContext, useContext, useMemo, useEffect, useState, useRef } from 'react';
import {
  initSpeakingSession,
  startSpeakingSession,
  getSpeakingSession,
  subscribeSpeakingSession,
  completeSpeakingSession,
} from '../utils/speakingAttempts';

const SpeakingSessionContext = createContext(null);

/**
 * SpeakingSessionProvider
 * 
 * Creates and manages a speaking session lifecycle.
 * Must wrap speaking-related routes.
 * 
 * @param {string} sessionId - Unique session identifier
 * @param {object} options - Session options (maxTurns, autoStart, etc.)
 * @param {ReactNode} children - Child components
 */
export function SpeakingSessionProvider({ sessionId, options = {}, children }) {
  const key = useMemo(() => String(sessionId || '').trim(), [sessionId]);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('idle');
  const initializedRef = useRef(false);

  // Initialize session exactly once
  useEffect(() => {
    if (!key) {
      setSession(null);
      setStatus('idle');
      initializedRef.current = false;
      return;
    }

    // Create session if not already initialized
    if (!initializedRef.current) {
      const newSession = initSpeakingSession(key, options);
      if (newSession) {
        initializedRef.current = true;
        setSession(newSession);
        setStatus(newSession.status || 'idle');

        // Auto-start if requested
        if (options?.autoStart !== false) {
          startSpeakingSession(key);
          const started = getSpeakingSession(key);
          setSession(started);
          setStatus(started?.status || 'live');
        }
      }
    }

    // Subscribe to session updates
    const unsubscribe = subscribeSpeakingSession(key, () => {
      const current = getSpeakingSession(key);
      if (current) {
        setSession(current);
        setStatus(current.status || 'idle');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [key, options?.maxTurns, options?.autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (key && initializedRef.current) {
        // Session cleanup is handled by the engine's internal state
        // We don't delete sessions here as they may be needed for review
        initializedRef.current = false;
      }
    };
  }, [key]);

  const value = useMemo(
    () => ({
      sessionId: key,
      session,
      status,
      currentTurnIndex: session?.currentTurnIndex || 0,
      currentTurn: session?.turns?.[session?.currentTurnIndex || 0] || null,
      maxTurns: session?.maxTurns || 0,
      turns: session?.turns || [],
    }),
    [key, session, status]
  );

  if (!key) {
    // No session ID provided - render children without context
    return <>{children}</>;
  }

  return <SpeakingSessionContext.Provider value={value}>{children}</SpeakingSessionContext.Provider>;
}

/**
 * useSpeakingSessionContext
 * 
 * Hook to consume the speaking session from context.
 * Screens should use this instead of useSpeakingSession directly.
 */
export function useSpeakingSessionContext() {
  const context = useContext(SpeakingSessionContext);
  if (!context) {
    throw new Error('useSpeakingSessionContext must be used within a SpeakingSessionProvider');
  }
  return context;
}

/**
 * useSpeakingSessionContextOrNull
 * 
 * Safe version that returns null if no provider is present.
 * Use this for components that may or may not be within a provider.
 */
export function useSpeakingSessionContextOrNull() {
  return useContext(SpeakingSessionContext);
}
