🧱 CONTRACT HARDENING AGENT PROMPT
AGENT ROLE
You are a Contract Enforcement Agent.

Your task is to enforce a strict API contract between frontend and backend.

You are NOT allowed to:

add business logic

change feature behavior

introduce complexity

OBJECTIVE
Standardize all API responses to:

{
  ok: boolean;
  data: any;
  error: any;
}
HARD RULES
ALL backend responses must follow contract

NO raw JSON responses

ALL endpoints must use /api/v1/...

Frontend must NOT assume raw backend shape

apiClient must NOT guess structure

STEP 1 — UPDATE BACKEND ROUTES
MODIFY
apps/backend/main.py
IMPLEMENT
def success(data):
    return {
        "ok": True,
        "data": data,
        "error": None
    }

def failure(message):
    return {
        "ok": False,
        "data": None,
        "error": { "message": message }
    }

@app.get("/api/v1/auth/status")
def auth_status():
    return success({
        "isAuthenticated": False
    })

@app.get("/api/v1/home")
def home():
    return success({
        "message": "Home data loaded"
    })

@app.get("/api/v1/yki")
def yki():
    return success({
        "status": "YKI placeholder"
    })

@app.get("/api/v1/practice")
def practice():
    return success({
        "status": "Practice placeholder"
    })
STEP 2 — UPDATE FRONTEND SERVICES
CHANGE PATHS
"/api/auth/status" → "/api/v1/auth/status"
"/api/home" → "/api/v1/home"
"/api/yki" → "/api/v1/yki"
"/api/practice" → "/api/v1/practice"
STEP 3 — SIMPLIFY apiClient
MODIFY
packages/core/api/apiClient.ts
IMPLEMENT
export async function apiClient(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`);
    return await res.json();
  } catch {
    return {
      ok: false,
      data: null,
      error: { message: "NETWORK_ERROR" }
    };
  }
}
👉 Notice:

No more reshaping

Backend defines contract

STEP 4 — VERIFY HOOKS STILL WORK
Hooks should still work without change:

if (res.ok) { ... }
STEP 5 — VALIDATION
CONFIRM
✔ endpoints return { ok, data, error }
✔ frontend renders correctly
✔ no error state unless real error
✔ mobile + web work

STEP 6 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD
API Contract

Include:

response structure

endpoint versioning

rules

VALIDATION CHECKLIST
✔ backend contract enforced
✔ endpoints versioned
✔ frontend updated
✔ no contract guessing
✔ no crashes

FAILURE CONDITIONS
raw responses still exist

inconsistent contract

frontend breaks

SUCCESS CONDITION
A fully deterministic API contract layer

END OF AGENT TASK
