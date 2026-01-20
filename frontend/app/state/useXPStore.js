import { create } from 'zustand';

export const useXPStore = create((set) => ({
  streak: 0,
  xp: 0,
  addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
}));
