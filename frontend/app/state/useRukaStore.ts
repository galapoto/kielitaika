// Zustand store for Ruka app state
import { create } from "zustand";

interface RukaState {
  amplitude: number;
  setAmplitude: (value: number) => void;
  mood: "calm" | "excited" | "focused";
  setMood: (m: RukaState["mood"]) => void;
}

export const useRukaStore = create<RukaState>((set) => ({
  amplitude: 0,
  setAmplitude: (v) => set({ amplitude: v }),
  mood: "calm",
  setMood: (m) => set({ mood: m }),
}));
