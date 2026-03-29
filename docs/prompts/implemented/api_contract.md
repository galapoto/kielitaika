🧱 API CONTRACT AGENT PROMPT
AGENT ROLE
You are an API Integration Agent.

Your task is to connect the app to a controlled API layer.

You are NOT allowed to:

bypass services layer

place API calls inside UI or hooks directly

break feature isolation

CONTEXT
Client app:

/apps/client
Core package (already exists):

/packages/core
OBJECTIVE
Create a central API client system:

✔ API client
✔ response contract
✔ error handling
✔ loading state integration

HARD RULES
ALL API calls must go through services

Services must use API client

Hooks must NOT call API directly

UI must NOT call API

Response shape must be consistent

STEP 1 — CREATE API CLIENT
CREATE FILE
packages/core/api/apiClient.ts
IMPLEMENT
export async function apiClient(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);

    const data = await res.json();

    return {
      ok: res.ok,
      data: res.ok ? data : null,
      error: res.ok ? null : data
    };
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: { message: "NETWORK_ERROR" }
    };
  }
}
STEP 2 — UPDATE SERVICE TO USE API CLIENT
MODIFY
auth/services/authService.ts
IMPLEMENT
import { apiClient } from "@core/api/apiClient";

export async function getAuthStatus() {
  return await apiClient("/api/auth/status");
}
STEP 3 — UPDATE HOOK
MODIFY
auth/hooks/useAuth.ts
IMPLEMENT
import { useState, useEffect } from "react";
import { getAuthStatus } from "../services/authService";

export default function useAuth() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function load() {
      const res = await getAuthStatus();

      if (res.ok) {
        setState({ data: res.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: res.error });
      }
    }

    load();
  }, []);

  return state;
}
STEP 4 — UPDATE FEATURE
MODIFY
AuthFeature.tsx
IMPLEMENT
import useAuth from "./hooks/useAuth";
import Text from "@ui/components/primitives/Text";
import Center from "@ui/components/layout/Center";

export default function AuthFeature() {
  const { data, loading, error } = useAuth();

  if (loading) {
    return (
      <Center>
        <Text>Loading...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center>
        <Text>Error</Text>
      </Center>
    );
  }

  return (
    <Center>
      <Text size="lg">
        {data?.isAuthenticated ? "Logged In" : "Not Logged In"}
      </Text>
    </Center>
  );
}
STEP 5 — APPLY TO OTHER FEATURES
Repeat pattern for:

home

yki

practice

(use mock endpoints like /api/home, etc.)

STEP 6 — VALIDATION
Run:

npx expo start
CONFIRM
✔ No crashes
✔ Loading state appears
✔ Error handled
✔ Data rendered
✔ No API calls outside services

STEP 7 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
API Layer

Include:

apiClient

service usage

hook pattern

response contract

VALIDATION CHECKLIST
✔ apiClient exists
✔ services use apiClient
✔ hooks use services
✔ loading + error handled
✔ no direct API calls in UI

OUTPUT FORMAT
Files created

Updated services/hooks

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
API used outside services

inconsistent response structure

missing loading/error handling

crashes

SUCCESS CONDITION
A controlled API integration layer ready for real backend connection.

END OF AGENT TASK

