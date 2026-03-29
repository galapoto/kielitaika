# AGENT ROLE

You are a strict infrastructure agent.

Your task is to implement the **core communication and contract layer**.

You are NOT allowed to:

* implement UI
* implement features
* call real business logic
* guess API structures

You MUST follow instructions exactly.

---

# CONTEXT

Project root:
/home/vitus/kielitaika-app

Core package:
/home/vitus/kielitaika-app/packages/core

Backend:
/home/vitus/kielitaika-app/backend

YKI engine:
/home/vitus/kielitaikka-yki-engine (DO NOT TOUCH)

---

# OBJECTIVE

Create a **stable, enforced API communication layer**:

✔ central API client
✔ strict response contract
✔ environment config
✔ zero direct fetch usage elsewhere

---

# HARD RULES

1. ALL API calls must go through apiClient
2. NO direct fetch() anywhere else
3. NO hardcoded URLs
4. NO guessing API shapes
5. MUST enforce response structure

---

# STEP 1 — ENV CONFIG

---

## CREATE FILE

packages/core/config/env.ts

---

## IMPLEMENT

export const env = {
API_URL: process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000"
};

---

# STEP 2 — API CLIENT

---

## CREATE FILE

packages/core/services/apiClient.ts

---

## IMPLEMENT

export async function apiClient(path: string, options: RequestInit = {}) {
const url = `${env.API_URL}${path}`;

let response;

try {
response = await fetch(url, {
headers: {
"Content-Type": "application/json",
...(options.headers || {})
},
...options
});
} catch (error) {
throw {
type: "TRANSPORT_ERROR",
message: "Network request failed",
retryable: true
};
}

let data;

try {
data = await response.json();
} catch {
throw {
type: "PARSE_ERROR",
message: "Invalid JSON response",
retryable: false
};
}

if (!data || typeof data.ok !== "boolean") {
throw {
type: "CONTRACT_VIOLATION",
message: "Invalid API response shape",
retryable: false
};
}

if (!data.ok) {
throw {
type: data.error?.code || "API_ERROR",
message: data.error?.message || "Unknown error",
retryable: data.error?.retryable ?? false
};
}

return data.data;
}

---

# STEP 3 — CONTRACT TYPES

---

## CREATE FILE

packages/core/models/apiTypes.ts

---

## IMPLEMENT

export interface ApiResponse<T> {
ok: boolean;
data: T | null;
error: {
code: string;
message: string;
retryable?: boolean;
} | null;
meta?: any;
}

---

# STEP 4 — YKI SERVICE (SHELL ONLY)

---

## CREATE FILE

packages/core/services/ykiService.ts

---

## IMPLEMENT

import { apiClient } from "./apiClient";

export const ykiService = {
async startExam() {
return apiClient("/api/v1/yki/start", {
method: "POST"
});
},

async getSession(sessionId: string) {
return apiClient(`/api/v1/yki/session/${sessionId}`);
}
};

---

# ⚠️ IMPORTANT

DO NOT ADD:

* state management
* caching
* UI logic
* retries
* extra abstraction

---

# STEP 5 — GLOBAL SEARCH GUARD

---

## SEARCH PROJECT FOR:

fetch(

---

## REQUIREMENT

There must be NO fetch() usage outside:

packages/core/services/apiClient.ts

---

# STEP 6 — VALIDATION SCRIPT (MANDATORY)

---

## CREATE FILE

packages/core/validate_no_direct_fetch.js

---

## IMPLEMENT

const fs = require("fs");
const path = require("path");

function scan(dir) {
const files = fs.readdirSync(dir);

for (const file of files) {
const full = path.join(dir, file);
const stat = fs.statSync(full);

```
if (stat.isDirectory()) {
  scan(full);
} else {
  const content = fs.readFileSync(full, "utf8");

  if (content.includes("fetch(") && !full.includes("apiClient")) {
    console.error("❌ Direct fetch found in:", full);
    process.exit(1);
  }
}
```

}
}

scan(process.cwd());
console.log("✔ No direct fetch usage");

---

# STEP 7 — RUN VALIDATION

---

From project root:

node packages/core/validate_no_direct_fetch.js

---

# STEP 8 — DOCUMENT

---

UPDATE:

docs/project_plans/monorepo_structure.md

ADD SECTION:

"Core Infrastructure Layer"

Include:

* env.ts
* apiClient.ts
* contract enforcement
* validation script

---

# VALIDATION CHECKLIST (MANDATORY)

✔ apiClient works
✔ env config used
✔ no hardcoded URLs
✔ contract enforcement active
✔ no direct fetch usage
✔ validation script passes

---

# OUTPUT FORMAT

1. Files created
2. Folder tree (core only)
3. Validation result
4. Errors encountered
5. Success/failure

NO extra explanation.

---

# FAILURE CONDITIONS

* any fetch() outside apiClient
* missing contract validation
* hardcoded API URL
* incorrect file placement

---

# SUCCESS CONDITION

A fully enforced API layer that all future features must use.

---

END OF AGENT TASK
