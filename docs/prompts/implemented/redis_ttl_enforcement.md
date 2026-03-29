REDIS TTL ENFORCEMENT
AGENT ROLE
You are a Persistence Hardening Agent.

Your job is to enforce session expiration using Redis TTL.

You are NOT allowed to:

change API contract

change session structure

modify frontend

remove backend expiry checks (yet)

OBJECTIVE
Ensure:

expired sessions are automatically removed by Redis
STEP 1 — DEFINE TTL SOURCE
Session already contains:

session["timing"]["expiresAt"]
You must compute:

ttl_seconds = expiresAt - current_time
STEP 2 — MODIFY CREATE
FILE
apps/backend/yki/storage.py
UPDATE RedisSessionStorage.create
import time

def create(self, session):
    ttl = int(session["timing"]["expiresAt"] - time.time())
    if ttl < 0:
        ttl = 1
    self.client.set(session["sessionId"], json.dumps(session), ex=ttl)
STEP 3 — MODIFY UPDATE
UPDATE
def update(self, session_id, session):
    ttl = int(session["timing"]["expiresAt"] - time.time())
    if ttl < 0:
        ttl = 1
    self.client.set(session_id, json.dumps(session), ex=ttl)
⚠️ RULE
TTL must always reflect:

remaining session lifetime
NOT reset arbitrarily.

STEP 4 — VALIDATION
TEST FLOW
1. Start session
✔ key exists

2. Check TTL
redis-cli TTL <session_id>
✔ must return positive number

3. Wait until expiry
(or simulate shorter expiry)

4. Check again
redis-cli GET <session_id>
✔ must return null

5. Backend request
GET /api/v1/yki/{session_id}
✔ must return SESSION_EXPIRED or not found

STEP 5 — DO NOT REMOVE BACKEND CHECKS
Even with TTL:

backend expiry checks MUST remain
Reason:

defense in depth
STEP 6 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

Session Expiry Model
Redis TTL enforces deletion

backend enforces validation

both must exist

VALIDATION CHECKLIST
✔ TTL set correctly
✔ TTL decreases over time
✔ key deleted automatically
✔ backend handles missing session
✔ no contract change

FAILURE CONDITIONS
TTL resets incorrectly

session never expires

negative TTL behavior breaks

SUCCESS CONDITION
Session lifecycle is enforced at storage level
END OF AGENT TASK
