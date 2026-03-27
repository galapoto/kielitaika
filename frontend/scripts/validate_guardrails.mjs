import fs from "node:fs";
import path from "node:path";

const checks = [
  {
    file: "app/services/contractGuard.ts",
    patterns: ["assertApiEnvelope", "isPersistedAuthSession", "isYkiRuntimeCache"],
  },
  {
    file: "app/services/apiClient.ts",
    patterns: ["assertApiEnvelope", "CONTRACT_VIOLATION"],
  },
  {
    file: "app/services/storage.ts",
    patterns: ["isPersistedAuthSession", "isYkiRuntimeCache", "Rejected incomplete auth session cache payload."],
  },
  {
    file: "app/utils/validateRuntime.ts",
    patterns: ["RUNTIME_CONTRACT_VERSION", "Runtime payload missing sections", "Runtime payload missing responses"],
  },
  {
    file: "app/exam_runtime/hooks/useExamRuntimeState.ts",
    patterns: ["submitYkiAnswer", "submitYkiWriting", "submitYkiExam", "currentIndex"],
  },
  {
    file: "app/exam_runtime/screens/ExamRuntimeScreen.tsx",
    patterns: ["useExamRuntimeState", "QuestionList", 'className="exam-content"', "RuntimeGuard"],
  },
  {
    file: "app/components/GlobalErrorBoundary.tsx",
    patterns: ["componentDidCatch", "unhandledrejection", "Application Guardrail Triggered"],
  },
  {
    file: "app/main.tsx",
    patterns: ["GlobalErrorBoundary"],
  },
];

let failed = false;

for (const check of checks) {
  const fullPath = path.resolve(check.file);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing required guardrail file: ${check.file}`);
    failed = true;
    continue;
  }
  const source = fs.readFileSync(fullPath, "utf8");
  for (const pattern of check.patterns) {
    if (!source.includes(pattern)) {
      console.error(`Missing required pattern in ${check.file}: ${pattern}`);
      failed = true;
    }
  }
  for (const forbidden of check.forbidden || []) {
    if (source.includes(forbidden)) {
      console.error(`Forbidden pattern still present in ${check.file}: ${forbidden}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Guardrail source validation passed.");
