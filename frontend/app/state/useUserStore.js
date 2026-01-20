import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: { id: null, email: null, subscriptionTier: 'free' },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: { id: null, email: null, subscriptionTier: 'free' } }),
}));
