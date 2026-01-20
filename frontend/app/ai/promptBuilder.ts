// Prompt builder for AI conversation
import { AIMessage } from "./messageTypes";

export function buildPrompt(messages: AIMessage[]): string {
  const base = `
You are Ruka, a Finnish language tutor.
You teach through conversation, natural feedback, and subtle grammar correction.
Always speak simple Finnish appropriate to the learner's level unless advanced mode is activated.
Be encouraging, patient, and supportive. Use natural Finnish conversation patterns.
`;

  const transcript = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  return base + "\n\nConversation:\n" + transcript + "\n\nRUKA:";
}
