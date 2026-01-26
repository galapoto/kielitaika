import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';

/**
 * SpeakingAttempts persistence
 * Used by multiple speaking screens for historical attempts.
 *
 * NOTE: This module also hosts the in-memory SpeakingSession store used by
 * conversation-based speaking flows, so screens do not own transcript state.
 */

const ATTEMPTS_STORAGE_KEY = '@ruka_speaking_attempts_v1';

export async function loadSpeakingAttempts() {
  try {
    const raw = await AsyncStorage.getItem(ATTEMPTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function persistSpeakingAttempt(attempt) {
  if (!attempt || typeof attempt !== 'object') return await loadSpeakingAttempts();
  const prev = await loadSpeakingAttempts();
  const next = [attempt, ...prev].slice(0, 200);
  try {
    await AsyncStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence failures
  }
  return next;
}

export function filterAttempts(attempts, filters = {}) {
  const list = Array.isArray(attempts) ? attempts : [];
  const level = filters?.levelFilter && filters.levelFilter !== 'All' ? filters.levelFilter : null;
  const mode = filters?.modeFilter && filters.modeFilter !== 'All' ? filters.modeFilter : null;
  const needsPractice =
    typeof filters?.needsPractice === 'boolean' ? filters.needsPractice : null;

  const now = Date.now();
  const dateFilter = filters?.dateFilter || 'All';
  const cutoffMs =
    dateFilter === 'Last 24h' ? now - 24 * 60 * 60 * 1000 : dateFilter === 'Last 7d' ? now - 7 * 24 * 60 * 60 * 1000 : null;

  return list.filter((item) => {
    if (level && item?.level_tag !== level && item?.level !== level) return false;
    if (mode && item?.mode_tag !== mode && item?.mode !== mode) return false;
    if (needsPractice != null && Boolean(item?.needs_practice) !== needsPractice) return false;
    if (cutoffMs != null) {
      const ts = item?.timestamp || item?.created_at || item?.createdAt;
      if (typeof ts === 'number' && ts < cutoffMs) return false;
    }
    return true;
  });
}

/**
 * SpeakingSession in-memory store (engine-owned transcripts + modes)
 *
 * Session states:
 * - idle: not started
 * - live: in-progress
 * - completed: ended, transcripts frozen
 */

const DEFAULT_MAX_TURNS = 5;

const _sessions = new Map(); // sessionId -> session
const _listeners = new Map(); // sessionId -> Set<fn>
const _activeSessions = new Set();
const _completedSessions = new Set();

function _clone(value) {
  // Session objects are plain data; cloning avoids accidental mutation by screens.
  return JSON.parse(JSON.stringify(value));
}

function _assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function _emit(sessionId) {
  const set = _listeners.get(sessionId);
  if (!set) return;
  for (const fn of Array.from(set)) {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  }
}

function _ensureTurn(session, turnIndex) {
  const idx = Math.max(0, Math.min(session.maxTurns - 1, Math.floor(turnIndex)));
  while (session.turns.length <= idx) {
    const nextIdx = session.turns.length;
    const isFinal = nextIdx === session.maxTurns - 1;
    session.turns.push({
      turnIndex: nextIdx + 1, // 1-based externally
      aiSpeech: { audioRef: null, transcript: '', isConclusive: isFinal },
      userSpeech: { audioRef: null, transcript: '' },
    });
  }
  return session.turns[idx];
}

function _hasTranscript(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function _maybeComplete(session, turnIndex) {
  if (!session || session.status === 'completed') return;
  if (turnIndex !== session.maxTurns - 1) return;
  const turn = session.turns[turnIndex];
  if (!turn) return;
  if (_hasTranscript(turn.aiSpeech?.transcript) && _hasTranscript(turn.userSpeech?.transcript)) {
    turn.aiSpeech.isConclusive = true;
    session.status = 'completed';
  }
}

export function getSpeakingSession(sessionId) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key);
  return session ? _clone(session) : null;
}

export function initSpeakingSession(sessionId, options = {}) {
  const key = String(sessionId || '').trim();
  if (!key) return null;

  const existing = _sessions.get(key);
  if (existing) return _clone(existing);

  const requestedMax =
    typeof options?.maxTurns === 'number' ? Math.floor(options.maxTurns) : DEFAULT_MAX_TURNS;
  const allowMoreTurns = options?.isYki === true;
  _assert(
    allowMoreTurns || requestedMax <= DEFAULT_MAX_TURNS,
    'SpeakingSessionEngine: maxTurns > 5 is illegal for non-YKI sessions.'
  );
  const maxTurns = allowMoreTurns
    ? Math.max(1, requestedMax)
    : Math.max(1, Math.min(DEFAULT_MAX_TURNS, requestedMax));

  const initialAiTranscript = typeof options?.initialAiTranscript === 'string' ? options.initialAiTranscript : '';

  const session = {
    id: key,
    status: 'idle',
    maxTurns,
    currentTurnIndex: 0,
    turns: [],
  };

  _ensureTurn(session, 0);
  if (initialAiTranscript.trim()) {
    session.turns[0].aiSpeech.transcript = initialAiTranscript.trim();
  }

  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function startSpeakingSession(sessionId) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key) || initSpeakingSession(key);
  if (!session) return null;
  if (session.status === 'completed') return _clone(session);
  session.status = 'live';
  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function completeSpeakingSession(sessionId) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key);
  if (!session) return null;
  for (const turn of session.turns) {
    _assert(_hasTranscript(turn?.aiSpeech?.transcript), 'SpeakingSessionEngine: missing AI transcript.');
    _assert(_hasTranscript(turn?.userSpeech?.transcript), 'SpeakingSessionEngine: missing user transcript.');
  }
  session.status = 'completed';
  _completedSessions.add(key);
  _activeSessions.delete(key);
  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function setSpeakingTurnAiTranscript(sessionId, turnIndex, transcript, options = {}) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key);
  if (!session || session.status === 'completed') return getSpeakingSession(key);
  const turn = _ensureTurn(session, turnIndex);
  const normalized = String(transcript || '').trim();
  _assert(normalized.length > 0, 'SpeakingSessionEngine: AI transcript must be non-empty.');
  turn.aiSpeech.transcript = normalized;
  if (typeof options?.isConclusive === 'boolean') {
    turn.aiSpeech.isConclusive = options.isConclusive;
  }
  if (turnIndex === session.maxTurns - 1) {
    turn.aiSpeech.isConclusive = true;
  }
  _maybeComplete(session, turnIndex);
  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function setSpeakingTurnUserTranscript(sessionId, turnIndex, transcript) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key);
  if (!session || session.status === 'completed') return getSpeakingSession(key);
  const turn = _ensureTurn(session, turnIndex);
  const normalized = String(transcript || '').trim();
  _assert(normalized.length > 0, 'SpeakingSessionEngine: user transcript must be non-empty.');
  turn.userSpeech.transcript = normalized;
  _maybeComplete(session, turnIndex);
  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function setSpeakingCurrentTurnIndex(sessionId, nextIndex) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key);
  if (!session || session.status === 'completed') return getSpeakingSession(key);
  const idx = Math.max(0, Math.min(session.maxTurns - 1, Math.floor(nextIndex || 0)));
  session.currentTurnIndex = idx;
  _ensureTurn(session, idx);
  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function advanceSpeakingTurn(sessionId) {
  const key = String(sessionId || '').trim();
  if (!key) return null;
  const session = _sessions.get(key);
  if (!session || session.status === 'completed') return getSpeakingSession(key);

  const current = session.turns[session.currentTurnIndex];
  _assert(
    _hasTranscript(current?.aiSpeech?.transcript),
    'SpeakingSessionEngine: cannot advance without AI transcript.'
  );
  _assert(
    _hasTranscript(current?.userSpeech?.transcript),
    'SpeakingSessionEngine: cannot advance without user transcript.'
  );

  if (session.currentTurnIndex >= session.maxTurns - 1) {
    _maybeComplete(session, session.currentTurnIndex);
    _sessions.set(key, session);
    _emit(key);
    return _clone(session);
  }

  const next = Math.min(session.maxTurns - 1, session.currentTurnIndex + 1);
  session.currentTurnIndex = next;
  _ensureTurn(session, next);

  _sessions.set(key, session);
  _emit(key);
  return _clone(session);
}

export function subscribeSpeakingSession(sessionId, listener) {
  const key = String(sessionId || '').trim();
  if (!key || typeof listener !== 'function') return () => {};
  const set = _listeners.get(key) || new Set();
  set.add(listener);
  _listeners.set(key, set);
  return () => {
    const current = _listeners.get(key);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) _listeners.delete(key);
  };
}

export function useSpeakingSession(sessionId, options = {}) {
  const key = useMemo(() => String(sessionId || '').trim(), [sessionId]);
  const [snapshot, setSnapshot] = useState(() => (key ? initSpeakingSession(key, options) : null));

  useEffect(() => {
    if (!key) return;
    initSpeakingSession(key, options);
    // Ensure we start in live unless caller explicitly keeps idle.
    if (options?.autoStart !== false) startSpeakingSession(key);
    _activeSessions.add(key);
    _completedSessions.delete(key);
    setSnapshot(getSpeakingSession(key));
    const unsubscribe = subscribeSpeakingSession(key, () => {
      const next = getSpeakingSession(key);
      if (next?.status === 'completed') {
        _completedSessions.add(key);
        _activeSessions.delete(key);
      } else {
        _activeSessions.add(key);
        _completedSessions.delete(key);
      }
      setSnapshot(next);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return snapshot;
}

export function assertSpeakingSessionActive() {
  _assert(_activeSessions.size > 0, 'SpeakingSessionEngine: no active session for speaking flow.');
}

export function isSpeakingReviewActive() {
  return _completedSessions.size > 0;
}
