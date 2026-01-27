/**
 * Temporary Onboarding Session Store
 * 
 * Manages onboarding state in memory ONLY (no persistence until signup).
 * Data is discarded if user exits before account creation.
 * 
 * State structure:
 * {
 *   intent_type: "YKI" | "PROFESSIONAL" | "DAILY" | null
 *   profession: "nurse" | "it" | "construction" | null
 *   selected_plan: "trial" | "yki" | "professional" | null
 * }
 */

import { create } from 'zustand';

const useOnboardingSession = create((set, get) => ({
  // Temporary state (memory only, no persistence)
  intent_type: null, // "YKI" | "PROFESSIONAL" | "DAILY"
  profession: null, // "nurse" | "it" | "construction" | etc.
  selected_plan: null, // "trial" | "yki" | "professional"

  // Actions
  setIntentType: (intentType) => set({ intent_type: intentType }),
  
  setProfession: (profession) => set({ profession }),
  
  setSelectedPlan: (plan) => set({ selected_plan: plan }),

  // Get all session data for persistence after signup
  getSessionData: () => ({
    intent_type: get().intent_type,
    profession: get().profession,
    selected_plan: get().selected_plan,
  }),

  // Clear session (called if user exits before signup)
  clearSession: () => set({
    intent_type: null,
    profession: null,
    selected_plan: null,
  }),
}));

export default useOnboardingSession;
