FRONTEND RESUME INTEGRATION
AGENT ROLE
You are a Frontend State Continuity Agent.

Your job is to bind the UI to backend session state.

OBJECTIVE
Ensure that:

user refreshes → app restores session → continues seamlessly
CONSTRAINTS
You are NOT allowed to:

change backend

change API contract

introduce local state as source of truth

Backend is always the authority.

STEP 1 — STORE SESSION ID
FILE
frontend/app/services/ykiService.ts
ADD
Store sessionId after start:

localStorage.setItem("yki_session_id", sessionId);
STEP 2 — CREATE RESUME SERVICE
ADD
export async function resumeSession() {
  const sessionId = localStorage.getItem("yki_session_id");
  if (!sessionId) return null;

  return apiClient.get(`/api/v1/yki/resume/${sessionId}`);
}
STEP 3 — BOOTSTRAP LOGIC
FILE
YkiExamScreen.tsx
ON MOUNT
useEffect(() => {
  async function bootstrap() {
    const res = await resumeSession();

    if (!res || !res.ok) {
      if (res?.error?.message === "SESSION_EXPIRED") {
        clearSession();
        navigateToStart();
        return;
      }

      if (res?.error?.message === "SESSION_NOT_FOUND") {
        clearSession();
        navigateToStart();
        return;
      }

      return;
    }

    hydrateUI(res.data);
  }

  bootstrap();
}, []);
STEP 4 — HYDRATE UI STATE
CRITICAL RULE
UI state must come from backend response
APPLY
setCurrentSection(data.currentSection);
setCurrentTaskId(data.currentTaskId);
setTiming(data.timing);
setSectionProgress(data.sectionProgress);
STEP 5 — REMOVE LOCAL AUTHORITY
If any logic exists like:

currentSection stored locally → REMOVE
Frontend must NOT decide state.

STEP 6 — HANDLE EXPIRED SESSION
If expired:

- clear localStorage
- show message
- redirect to start
STEP 7 — VALIDATION
TEST 1 — refresh mid exam
✔ resumes same task

TEST 2 — restart browser
✔ resumes

TEST 3 — expired session
✔ redirected cleanly

TEST 4 — no session
✔ starts new flow

STEP 8 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

Frontend Session Model
backend = source of truth

frontend = renderer

sessionId persisted locally

VALIDATION CHECKLIST
✔ resume works after refresh
✔ no duplicated state logic
✔ expired handled cleanly
✔ backend authority preserved

FAILURE CONDITIONS
frontend reconstructs state

mismatch between UI and backend

stale sessionId reuse

SUCCESS CONDITION
UI is fully driven by backend session state
END OF AGENT TASK

