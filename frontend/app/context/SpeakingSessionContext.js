// frontend/app/context/SpeakingSessionContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

const SpeakingSessionContext = createContext(null);

export function SpeakingSessionProvider({ children }) {
  const [turns, setTurns] = useState([]);
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [status, setStatus] = useState("live");

  const upsertTurn = useCallback((turn) => {
    setTurns((prev) => {
      if (status === "completed") return prev;
      const idx = prev.findIndex(
        (t) => t.turnIndex === turn.turnIndex && t.speaker === turn.speaker
      );
      if (idx === -1) return [...prev, turn];
      const next = [...prev];
      next[idx] = turn;
      return next;
    });
  }, [status]);

  const setAiTranscript = useCallback((turnIndex, text) => {
    upsertTurn({
      turnIndex,
      speaker: "ai",
      text,
      isFinal: true,
    });
  }, [upsertTurn]);

  const setUserTranscript = useCallback((turnIndex, text, { isFinal }) => {
    upsertTurn({
      turnIndex,
      speaker: "user",
      text,
      isFinal,
      isLive: !isFinal,
    });
  }, [upsertTurn]);

  const completeSession = useCallback(() => {
    setStatus("completed");
  }, []);

  return (
    <SpeakingSessionContext.Provider
      value={{
        turns,
        activeTurnIndex,
        setActiveTurnIndex,
        setAiTranscript,
        setUserTranscript,
        completeSession,
        status,
      }}
    >
      {children}
    </SpeakingSessionContext.Provider>
  );
}

export function useSpeakingSession() {
  const ctx = useContext(SpeakingSessionContext);
  if (!ctx) {
    throw new Error("useSpeakingSession must be used within provider");
  }
  return ctx;
}

