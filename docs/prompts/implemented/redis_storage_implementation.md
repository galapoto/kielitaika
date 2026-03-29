REDIS STORAGE IMPLEMENTATION
AGENT ROLE
You are a Redis Persistence Agent.

Your task is to implement a Redis-based session storage that replaces in-memory storage.

You are NOT allowed to:

modify frontend

change session structure

alter API contract

remove in-memory implementation

OBJECTIVE
Add:

Redis-backed session persistence
STEP 1 — INSTALL REDIS CLIENT
REQUIREMENT
Add dependency:

pip install redis
STEP 2 — IMPLEMENT REDIS STORAGE
MODIFY
apps/backend/yki/storage.py
ADD
import json
import redis

class RedisSessionStorage(SessionStorage):
    def __init__(self):
        self.client = redis.Redis(host="localhost", port=6379, decode_responses=True)

    def create(self, session):
        self.client.set(session["sessionId"], json.dumps(session))

    def get(self, session_id):
        data = self.client.get(session_id)
        if not data:
            return None
        return json.loads(data)

    def update(self, session_id, session):
        self.client.set(session_id, json.dumps(session))
STEP 3 — SWITCH IMPLEMENTATION
MODIFY
apps/backend/yki/session_store.py
CHANGE
from yki.storage import RedisSessionStorage

storage = RedisSessionStorage()
STEP 4 — VALIDATION
REQUIRE REDIS RUNNING
redis-server
TEST
1. Start session
✔ stored in Redis

2. Restart backend
✔ session still exists

3. Continue session
✔ state persists

4. Full flow
✔ tasks
✔ answers
✔ audio
✔ timing
✔ evaluation

STEP 5 — FALLBACK SAFETY (IMPORTANT)
ADD TRY/CATCH
If Redis fails:

storage = InMemorySessionStorage()
STEP 6 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

Redis Session Storage

Include:

why Redis used

persistence behavior

recovery capability

VALIDATION CHECKLIST
✔ sessions persist across restarts
✔ Redis used exclusively
✔ no behavior changes
✔ fallback exists

FAILURE CONDITIONS
session lost after restart

partial storage usage

JSON corruption

SUCCESS CONDITION
Sessions are durable beyond process lifetime
END OF AGENT TASK
