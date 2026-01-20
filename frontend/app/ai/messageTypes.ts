// Message types for AI conversation
export type AIMessage = {
  role: "user" | "assistant" | "system";
  type?: "reply" | "correction" | "exercise";
  content: string;
  timestamp?: number;
};
