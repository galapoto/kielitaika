import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Onboarding Store
 * 
 * Manages onboarding state across all steps:
 * - Welcome
 * - Level (A1, A2, B1, B2)
 * - Goal (General, Töihin, YKI)
 * - Profession (for Töihin path)
 * - Consent (GDPR + analytics)
 * - Complete
 */
const STORAGE_KEY = '@ruka_onboarding';

const useOnboardingStore = create((set, get) => ({
  // State
  currentStep: 0,
  level: null, // 'A1' | 'A2' | 'B1' | 'B2'
  goal: null, // 'general' | 'workplace' | 'yki'
  profession: null, // profession ID for workplace path
  consent: {
    gdpr: false,
    analytics: false,
  },
  completed: false,

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setLevel: (level) => {
    set({ level });
    get().saveToStorage();
  },
  
  setGoal: (goal) => {
    set({ goal });
    get().saveToStorage();
  },
  
  setProfession: (profession) => {
    set({ profession });
    get().saveToStorage();
  },
  
  setCommitment: (commitment) => {
    set({ commitment });
    get().saveToStorage();
  },
  
  setSubscriptionChoice: (choice) => {
    set({ subscriptionChoice: choice });
    get().saveToStorage();
  },
  
  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
    get().saveToStorage();
  },
  
  setConsent: (consent) => {
    set({ consent });
    get().saveToStorage();
  },
  
  markCompleted: async () => {
    set({ completed: true, currentStep: 5 });
    await get().saveToStorage();
  },

  // Persistence
  saveToStorage: async () => {
    try {
      const state = {
        level: get().level,
        goal: get().goal,
        profession: get().profession,
        consent: get().consent,
        completed: get().completed,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        set({
          level: state.level,
          goal: state.goal,
          profession: state.profession,
          commitment: state.commitment,
          subscriptionChoice: state.subscriptionChoice,
          paymentMethod: state.paymentMethod,
          consent: state.consent,
          completed: state.completed,
        });
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    }
  },

  reset: () => {
    set({
      currentStep: 0,
      level: null,
      goal: null,
      profession: null,
      commitment: null,
      subscriptionChoice: null,
      paymentMethod: null,
      consent: { gdpr: false, analytics: false },
      completed: false,
    });
    AsyncStorage.removeItem(STORAGE_KEY);
  },
}));

export default useOnboardingStore;
