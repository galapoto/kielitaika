PERSISTENCE ABSTRACTION LAYER
AGENT ROLE
You are a Persistence Layer Agent.

Your task is to introduce a storage abstraction layer for sessions.

You are NOT allowed to:

introduce a real database yet

modify frontend

change API responses

break session behavior

OBJECTIVE
Refactor session storage so that:

Session store becomes pluggable
STEP 1 — CREATE STORAGE INTERFACE
CREATE
apps/backend/yki/storage.py
IMPLEMENT
class SessionStorage:
    def create(self, session):
        raise NotImplementedError

    def get(self, session_id):
        raise NotImplementedError

    def update(self, session_id, session):
        raise NotImplementedError
STEP 2 — CREATE IN-MEMORY IMPLEMENTATION
ADD
_sessions = {}

class InMemorySessionStorage(SessionStorage):
    def create(self, session):
        _sessions[session["sessionId"]] = session

    def get(self, session_id):
        return _sessions.get(session_id)

    def update(self, session_id, session):
        _sessions[session_id] = session
STEP 3 — INJECT STORAGE INTO SESSION STORE
MODIFY
apps/backend/yki/session_store.py
ADD
from yki.storage import InMemorySessionStorage

storage = InMemorySessionStorage()
REPLACE DIRECT ACCESS
BEFORE
_sessions[session_id] = session
AFTER
storage.create(session)
BEFORE
_sessions.get(session_id)
AFTER
storage.get(session_id)
AFTER MUTATION
storage.update(session_id, session)
STEP 4 — VALIDATION
TEST ALL FLOWS
✔ session persists
✔ tasks persist
✔ answers persist
✔ evaluation persists
✔ timing persists

STEP 5 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Storage Layer

Explain:

abstraction introduced

current in-memory implementation

future DB/Redis replacement

VALIDATION CHECKLIST
✔ no direct _sessions usage
✔ storage abstraction used everywhere
✔ behavior unchanged

FAILURE CONDITIONS
mixed storage usage

direct dict access remains

behavior changes

SUCCESS CONDITION
Session storage is fully abstracted
END OF AGENT TASK

