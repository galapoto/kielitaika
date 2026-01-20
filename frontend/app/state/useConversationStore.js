import { create } from 'zustand';

export const useConversationStore = create((set) => ({
  messages: [],
  topic: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setTopic: (topic) => set({ topic }),
}));
