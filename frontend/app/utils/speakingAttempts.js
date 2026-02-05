// frontend/app/utils/speakingAttempts.js

const _sessions = new Map();

/**
 * Session structure (authoritative):
 * {
 *   id,
 *   type,
 *   status: 'idle' | 'live' | 'completed',
 *   maxTurns,
 *   turns: [
 *     {
 *       index,
 *       ai: {
 *         liveText: '',
 *         finalText: null
 *       },
 *       user: {
 *         liveText: '',
 *         finalText: null
 *       }
 *     }
 *   ],
 *   currentTurnIndex
 * }
 */

export function initSpeakingSession(sessionId, { type, maxTurns }) {
  if (_sessions.has(sessionId)) return;

  const turns = Array.from({ length: maxTurns }).map((_, i) => ({
    index: i,
    ai: { liveText: '', finalText: null },
    user: { liveText: '', finalText: null }
  }));

  _sessions.set(sessionId, {
    id: sessionId,
    type,
    status: 'idle',
    maxTurns,
    turns,
    currentTurnIndex: 0
  });
}

export function startSpeakingSession(sessionId) {
  const session = _require(sessionId);
  session.status = 'live';
}

export function getSpeakingSession(sessionId) {
  return _require(sessionId);
}

/* ---------- AI TRANSCRIPTS ---------- */

export function updateAiLiveTranscript(sessionId, turnIndex, text) {
  const turn = _getTurn(sessionId, turnIndex);
  turn.ai.liveText = text;
}

export function finalizeAiTranscript(sessionId, turnIndex, text) {
  const turn = _getTurn(sessionId, turnIndex);
  turn.ai.finalText = text;
  turn.ai.liveText = text;
}

/* ---------- USER TRANSCRIPTS ---------- */

export function updateUserLiveTranscript(sessionId, turnIndex, text) {
  const turn = _getTurn(sessionId, turnIndex);
  turn.user.liveText = text;
}

export function finalizeUserTranscript(sessionId, turnIndex, text) {
  const turn = _getTurn(sessionId, turnIndex);
  turn.user.finalText = text;
  turn.user.liveText = text;
}

/* ---------- TURN CONTROL ---------- */

export function advanceTurn(sessionId) {
  const session = _require(sessionId);
  if (session.currentTurnIndex < session.maxTurns - 1) {
    session.currentTurnIndex += 1;
  }
}

export function completeSpeakingSession(sessionId) {
  const session = _require(sessionId);

  session.turns.forEach((turn, i) => {
    if (!turn.ai.finalText) {
      throw new Error(`Missing AI transcript at turn ${i}`);
    }
    if (!turn.user.finalText) {
      throw new Error(`Missing user transcript at turn ${i}`);
    }
  });

  session.status = 'completed';
}

/* ---------- INTERNAL ---------- */

function _require(sessionId) {
  const s = _sessions.get(sessionId);
  if (!s) throw new Error(`Session not found: ${sessionId}`);
  return s;
}

function _getTurn(sessionId, index) {
  const session = _require(sessionId);
  const turn = session.turns[index];
  if (!turn) throw new Error(`Invalid turn index ${index}`);
  return turn;
}

