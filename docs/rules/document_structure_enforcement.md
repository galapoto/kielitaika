# DOCUMENT STRUCTURE ENFORCEMENT RULE

Status: ACTIVE  
Mode: HARD ENFORCEMENT  
Applies to: ALL AGENTS, ALL RUNS, ALL DOCUMENTS  

---

## 1. CORE PRINCIPLE

Every document in the project must exist inside a logically correct folder based on its function, system ownership, and architectural role.

No document is allowed to exist in a generic, undefined, or ambiguous location.

---

## 2. MANDATORY STRUCTURE RULE

When creating or updating any document, the agent MUST:

1. Identify the document type
2. Identify the system it belongs to
3. Place it inside the correct directory based on that system

If a correct directory does not exist:
→ The agent MUST create it before saving the document

---

## 3. APPROVED DOCUMENT DOMAINS

All documents must fall into one of the following domains:

### 3.1 RULES
Path:
docs/rules/

Examples:
- enforcement rules
- system constraints
- implementation rules
- governance logic

---

### 3.2 UI / UX DESIGN
Path:
docs/ui_design/

Examples:
- layout systems
- design systems
- screen specifications
- animation systems

---

### 3.3 FEATURE / SYSTEM DESIGN
Path:
docs/<system_name>/

Examples:
- microphone_design/
- role_play_files/
- card_system_docs/

Rule:
Each system MUST have its own folder  
No mixing of systems inside one folder

---

### 3.4 IMPLEMENTATION / ARCHITECTURE CONTROL
Path:
docs/

Examples:
- implementation_authority_index.md
- old_to_new_feature_matrix.md

Rule:
These are root-level documents because they control the entire system

---

### 3.5 CONTRACTS (CRITICAL – FUTURE REQUIRED)
Path:
docs/contracts/

Examples:
- auth_contract.md
- api_contract.md
- session_contract.md
- payment_contract.md
- voice_contract.md

Rule:
No implementation is allowed without a contract document in this folder

---

## 4. FORBIDDEN STRUCTURE PATTERNS

The following are NOT allowed:

- dumping documents directly in docs/ without classification
- mixing multiple systems inside one folder
- placing rule files outside docs/rules/
- placing system-specific files in ui_design/
- placing implementation control docs inside subfolders
- duplicate documents across multiple folders
- temporary or “draft” folders that become permanent

---

## 5. NAMING RULES

All document names must:

- clearly reflect their function
- use lowercase_with_underscores
- avoid vague names like:
  - final.md
  - new_version.md
  - updated.md

Good examples:
- microphone_intelligence_system.md
- yki_runtime_flow_spec.md
- card_system_runtime_contract.md

---

## 6. AGENT EXECUTION REQUIREMENT

At the start of EVERY run, the agent MUST:

1. Read this file:
   docs/rules/document_structure_enforcement.md

2. Validate:
   - All documents it will use are in correct locations
   - No document violates structure rules

3. If a violation is found:
   → STOP execution  
   → Report the violation  
   → Propose correct relocation  

NO implementation is allowed until structure is valid

---

## 7. FAILURE MODE

If an agent:

- creates a document in the wrong location
- uses a document from an invalid location
- ignores this rule

Then:

→ The output is INVALID  
→ The step is considered FAILED  
→ The system must not proceed  

---

## 8. RELATION TO IMPLEMENTATION AUTHORITY INDEX

This rule works together with:

docs/implementation_authority_index.md :contentReference[oaicite:0]{index=0}

Authority index decides:
→ which document is correct

This rule decides:
→ where that document must live

Both must be satisfied for implementation to proceed

---

## 9. FINAL CONSTRAINT

There is no flexibility in document placement.

Correct structure is a prerequisite for:
- correctness
- maintainability
- agent reliability
- system scalability

If structure is wrong, the system is considered unstable.
