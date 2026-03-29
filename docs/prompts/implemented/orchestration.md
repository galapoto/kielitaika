🧱 STATE & ORCHESTRATION AGENT PROMPT
AGENT ROLE
You are a State & Orchestration Agent.

Your task is to introduce a controlled logic layer inside features.

You are NOT allowed to:

call real APIs

introduce external state libraries

break UI boundaries

modify UI primitives

CONTEXT
Client app:

/apps/client
Features:

/apps/client/features/*
OBJECTIVE
Create a clean logic structure per feature:

✔ hooks (state)
✔ services (mocked)
✔ separation from UI
✔ predictable data flow

HARD RULES
UI must NOT contain logic

Features must separate:

UI

state

services

No API calls (mock only)

No global state

No cross-feature dependencies

STEP 1 — EXPAND FEATURE STRUCTURE
FOR EACH FEATURE ADD:
Example (auth):

apps/client/features/auth/
├── AuthFeature.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authService.ts
Repeat for:

home

yki

practice

STEP 2 — CREATE SERVICE (MOCK)
CREATE
auth/services/authService.ts
IMPLEMENT
export function getAuthStatus() {
  return {
    user: null,
    isAuthenticated: false
  };
}
STEP 3 — CREATE HOOK
CREATE
auth/hooks/useAuth.ts
IMPLEMENT
import { useState, useEffect } from "react";
import { getAuthStatus } from "../services/authService";

export default function useAuth() {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const data = getAuthStatus();
    setState(data);
  }, []);

  return state;
}
STEP 4 — CONNECT FEATURE TO HOOK
MODIFY
AuthFeature.tsx
IMPLEMENT
import useAuth from "./hooks/useAuth";
import Text from "@ui/components/primitives/Text";
import Center from "@ui/components/layout/Center";

export default function AuthFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <Center>
      <Text size="lg">
        {isAuthenticated ? "Logged In" : "Not Logged In"}
      </Text>
    </Center>
  );
}
Repeat similar structure for:

HomeFeature (mock data)

YkiFeature (placeholder state)

PracticeFeature (placeholder state)

STEP 5 — VALIDATION
Run:

npx expo start
CONFIRM
✔ Screens render
✔ Features render
✔ No crashes
✔ State updates correctly
✔ No API calls used

STEP 6 — ENFORCEMENT RULES
Hooks = state only

Services = data source only

Features = UI composition

STEP 7 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
State & Orchestration Layer

Include:

hooks structure

services structure

separation rules

VALIDATION CHECKLIST
✔ hooks exist
✔ services exist
✔ features use hooks
✔ no logic in UI primitives
✔ no API calls

OUTPUT FORMAT
Files created

Feature structure (expanded)

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
logic inside UI components

direct data inside features without hooks

API calls introduced

cross-feature imports

SUCCESS CONDITION
A clean, scalable logic layer ready for backend integration.

END OF AGENT TASK

