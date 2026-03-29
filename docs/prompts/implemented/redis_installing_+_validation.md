REDIS INSTALLATION + VALIDATION
AGENT ROLE
You are a Local Infrastructure Setup Agent.

Your job is to install and validate Redis locally so that backend persistence can be tested.

You are NOT allowed to modify:

backend logic

storage implementation

session structure

STEP 1 — INSTALL REDIS (LINUX)
Run:

sudo apt update
sudo apt install redis-server -y
STEP 2 — ENABLE REDIS
sudo systemctl enable redis-server
sudo systemctl start redis-server
STEP 3 — VERIFY REDIS IS RUNNING
redis-cli ping
Expected:

PONG
STEP 4 — VERIFY PORT
ss -ltn | grep 6379
Expected:

LISTEN ... 127.0.0.1:6379
STEP 5 — RESTART BACKEND
Restart your FastAPI server.

STEP 6 — VALIDATE REDIS STORAGE IS ACTIVE
Add temporary log (if not already):

print("Using storage:", type(storage).__name__)
Expected:

RedisSessionStorage
STEP 7 — FUNCTIONAL TEST
1. Start session
POST /api/v1/yki/start
✔ session created

2. Get session
GET /api/v1/yki/{session_id}
✔ session exists

3. Restart backend
4. Get same session again
✔ MUST still exist

🚨 THIS IS THE REAL TEST
If session survives restart:

Redis is working
If not:

Something is wrong — stop and debug
STEP 8 — REDIS DATA CHECK (OPTIONAL BUT GOOD)
Run:

redis-cli keys '*'
You should see:

session_id values
STEP 9 — DOCUMENTATION UPDATE
Update:

docs/project_plans/monorepo_structure.md
Add:

Redis Runtime Requirement
Redis must be running on localhost:6379

backend depends on Redis for persistence

fallback exists but is not production-safe

VALIDATION CHECKLIST
✔ Redis installed
✔ Redis running
✔ backend uses RedisSessionStorage
✔ session survives restart
✔ no contract changes

FAILURE CONDITIONS
Redis not reachable

fallback still active

session lost after restart

SUCCESS CONDITION
System persistence is now process-independent
END OF AGENT TASK

