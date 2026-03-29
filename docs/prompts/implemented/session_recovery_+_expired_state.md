SESSION RECOVERY + EXPIRED STATE
AGENT ROLE
You are a Session Recovery Agent.

Your task is to introduce user-aware session lifecycle handling.

You must distinguish between:

1. never existed
2. existed but expired
OBJECTIVE
Ensure backend can return:

SESSION_EXPIRED
even when Redis key is gone.

CONSTRAINT
You are NOT allowed to:

change Redis TTL behavior

change existing endpoints’ success contract

modify frontend yet

STEP 1 — ADD EXPIRY TRACKING (LIGHTWEIGHT)
APPROACH
When session is created:

Store a minimal expiry record:

session_meta:{session_id}
IMPLEMENT
In RedisSessionStorage.create():

self.client.set(
    f"session_meta:{session['sessionId']}",
    session["timing"]["expiresAt"],
    ex=ttl + 60  # keep slightly longer than session
)
STEP 2 — MODIFY GET LOGIC
FILE
apps/backend/yki/session_store.py
LOGIC
When session not found:

session = storage.get(session_id)

if not session:
    meta = storage.get_meta(session_id)

    if meta:
        raise SESSION_EXPIRED
    else:
        raise SESSION_NOT_FOUND
STEP 3 — ADD META ACCESS
IN storage.py
def get_meta(self, session_id):
    return self.client.get(f"session_meta:{session_id}")
STEP 4 — VALIDATION
TEST 1 — normal session
✔ works

TEST 2 — expired session
After TTL:

GET /api/v1/yki/{session_id}
Expected:

{
  "ok": false,
  "data": null,
  "error": {
    "message": "SESSION_EXPIRED"
  }
}
TEST 3 — invalid session
GET /api/v1/yki/random-id
Expected:

SESSION_NOT_FOUND
STEP 5 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

Session State Model
ACTIVE → exists in Redis

EXPIRED → removed from Redis but meta exists

NOT_FOUND → no record ever existed

VALIDATION CHECKLIST
✔ expired session returns SESSION_EXPIRED
✔ unknown session returns SESSION_NOT_FOUND
✔ TTL behavior unchanged
✔ no contract break

FAILURE CONDITIONS
expired session indistinguishable from not found

meta not cleaned eventually

TTL mismatch

SUCCESS CONDITION
System distinguishes lifecycle states correctly
END OF AGENT TASK

