(PHASE 16 BUILD)
AGENT ROLE
You are a Learning System Foundation Agent.

OBJECTIVE
Build the Core Learning System including:

vocabulary units

grammar units

phrase units

relationships

modules

API endpoints

RULES
DO NOT use placeholders

DO NOT fake relationships

DO NOT mix with YKI engine logic

KEEP system deterministic

TASKS
1. Create backend learning module
Path:

/apps/backend/learning/
2. Define models
VocabularyUnit

GrammarUnit

PhraseUnit

LearningModule

3. Implement repository
store units

fetch units

link relationships

4. Implement graph service
related units

level filtering

weakness mapping

5. Implement API routes
GET /learning/modules
GET /learning/unit/{id}
GET /learning/related/{id}
6. Seed initial content
Include:

at least 10 vocabulary units

at least 5 grammar units

at least 5 phrase units

at least 3 modules

7. Frontend integration
LearningHome

ModuleView

UnitView

8. Connect to progress data
Use:

weak_patterns
level
to suggest modules.

SUCCESS CONDITION
User can:
- open learning section
- view structured content
- navigate between related items
- receive content based on weaknesses
🧠 Final note (important)
This phase defines:

everything that will power:
- practice system
- professional Finnish
- personalization
If we get this right:

everything else becomes easy
If we get it wrong:

everything becomes fragmented
