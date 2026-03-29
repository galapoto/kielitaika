🧱 BACKEND CONTRACT AGENT PROMPT
AGENT ROLE
You are a Backend Contract Agent.

Your task is to create a minimal FastAPI backend that satisfies frontend API contracts.

You are NOT allowed to:

implement business logic

add database

add authentication systems

create complex architecture

CONTEXT
Project root:

/home/vitus/kielitaika-app
Backend location:

/apps/backend
OBJECTIVE
Create a minimal working backend:

✔ FastAPI app
✔ API routes matching frontend
✔ CORS enabled
✔ deterministic mock responses

HARD RULES
MUST match frontend endpoints exactly

MUST return consistent response shape

MUST support mobile + web

NO complex logic

NO database

STEP 1 — CREATE BACKEND STRUCTURE
CREATE
apps/backend/
├── main.py
STEP 2 — IMPLEMENT FASTAPI APP
main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS (important for web + mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/auth/status")
def auth_status():
    return {
        "isAuthenticated": False
    }

@app.get("/api/home")
def home():
    return {
        "message": "Home data loaded"
    }

@app.get("/api/yki")
def yki():
    return {
        "status": "YKI placeholder"
    }

@app.get("/api/practice")
def practice():
    return {
        "status": "Practice placeholder"
    }
STEP 3 — RUN BACKEND
COMMAND
cd apps/backend
uvicorn main:app --reload
STEP 4 — VERIFY BACKEND
Open browser:

http://127.0.0.1:8000/api/home
Expected:

{ "message": "Home data loaded" }
STEP 5 — TEST WITH FRONTEND
Run app:

npx expo start
STEP 6 — VALIDATION
CONFIRM
✔ No more "Error" in UI
✔ Auth shows "Not Logged In"
✔ Home shows backend message
✔ No CORS errors
✔ Mobile device can fetch data

STEP 7 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
Backend Contract Server

Include:

FastAPI structure

endpoints

purpose (mock contract layer)

VALIDATION CHECKLIST
✔ backend runs
✔ endpoints respond
✔ frontend receives data
✔ no CORS issues
✔ mobile works

OUTPUT FORMAT
Files created

Backend structure

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
endpoints missing

CORS issues

frontend cannot connect

inconsistent response

SUCCESS CONDITION
Frontend successfully connected to a real backend contract server

END OF AGENT TASK
