// app/services/workplace.js

import { API_BASE } from "../config/backend";
import { getAuthToken } from "./authService";

/**
 * Fetches the initial roleplay dialogue for a profession.
 * Backend: POST /workplace/dialogue
 */
export async function fetchRoleplayDialogue({
  field,
  scenarioTitle,
  level,
}) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/workplace/dialogue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      field,
      scenario_title: scenarioTitle,
      level,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `fetchRoleplayDialogue failed (${res.status}): ${text}`
    );
  }

  const data = await res.json();

  // Hard validation — fail early if backend shape changes
  if (!data || typeof data.roleplay_prompt !== "string") {
    throw new Error(
      "Invalid roleplay dialogue response from backend"
    );
  }

  return data;
}

/**
 * Evaluates the completed roleplay session.
 * Backend: POST /workplace/evaluate
 */
export async function evaluateRoleplay({
  field,
  transcript,
}) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/workplace/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      field,
      transcript,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `evaluateRoleplay failed (${res.status}): ${text}`
    );
  }

  return await res.json();
}

