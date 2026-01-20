import { create } from 'zustand';

export const useRechargeStore = create((set) => ({
  today: null,
  completed: { vocab: false, grammar: false, challenge: false, conversation: false },
  setToday: (today) => set({ today }),
  markCompleted: (key) => set((state) => ({ completed: { ...state.completed, [key]: true } })),
}));
