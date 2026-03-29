🧱 BACKEND CONNECTION AGENT PROMPT
AGENT ROLE
You are a Backend Integration Agent.

Your task is to connect the app to a real backend URL system.

You are NOT allowed to:

hardcode URLs inside services

bypass apiClient

modify feature logic

CONTEXT
Frontend:

/apps/client
Backend:

http://127.0.0.1:8000
(Example — must be configurable)

OBJECTIVE
Create a centralized API base configuration:

✔ environment-based base URL
✔ mobile-safe networking
✔ apiClient upgrade
✔ consistent endpoint usage

HARD RULES
NO hardcoded URLs in services

ALL URLs must come from config

Must work on:

web

Android device

Must support future production URL

STEP 1 — CREATE API CONFIG
CREATE FILE
packages/core/api/apiConfig.ts
IMPLEMENT
import { Platform } from "react-native";

const LOCALHOST = "127.0.0.1";

export function getApiBaseUrl() {
  if (Platform.OS === "android") {
    return `http://${LOCALHOST}:8000`;
  }

  return `http://${LOCALHOST}:8000`;
}
STEP 2 — UPDATE apiClient
MODIFY
packages/core/api/apiClient.ts
IMPLEMENT
import { getApiBaseUrl } from "./apiConfig";

export async function apiClient(path: string, options?: RequestInit) {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetch(`${baseUrl}${path}`, options);

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
STEP 3 — VERIFY SERVICES
Ensure all services use:

apiClient("/api/...")
NOT full URLs.

STEP 4 — BACKEND TEST
Run backend:

uvicorn backend.main:app --reload
Run app:

npx expo start
STEP 5 — VALIDATION
CONFIRM
✔ Mobile device can reach backend
✔ Web can reach backend
✔ No CORS errors
✔ API responses replace "Error" state
✔ Data renders correctly

STEP 6 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
Backend Connection

Include:

apiConfig

base URL rules

platform handling

VALIDATION CHECKLIST
✔ apiConfig exists
✔ apiClient uses base URL
✔ services use relative paths
✔ backend reachable from device
✔ no hardcoded URLs

OUTPUT FORMAT
Files created

Updated apiClient

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
hardcoded URLs in services

mobile cannot reach backend

CORS errors

inconsistent API usage

SUCCESS CONDITION
Frontend successfully connected to backend with a clean, scalable API layer.

END OF AGENT TASK

