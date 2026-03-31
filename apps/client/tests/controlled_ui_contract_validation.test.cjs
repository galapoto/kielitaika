const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("../node_modules/typescript");

function loadValidatorModule() {
  const filePath = path.resolve(
    __dirname,
    "../../../packages/core/api/governedResponseValidation.ts",
  );
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filePath,
  });

  const module = { exports: {} };
  const wrapped = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    output.outputText,
  );

  wrapped(module.exports, require, module, filePath, path.dirname(filePath));
  return module.exports;
}

function createLearningModulesPayload() {
  const unit = {
    id: "unit-1",
    kind: "grammar",
    level: "B1",
    difficultyLevel: "medium",
    title: "Partitive basics",
    summary: "Practice the partitive case.",
    example: "Juon kahvia.",
    details: {
      rule: "Partitive marks incomplete or partial objects.",
    },
    moduleIds: ["module-1"],
    relatedUnitIds: [],
  };

  const module = {
    id: "module-1",
    title: "Partitive",
    description: "Core partitive practice",
    level: "B1",
    focusTags: ["grammar"],
    unitIds: ["unit-1"],
    unitCount: 1,
    units: [unit],
  };

  return {
    modules: [module],
    suggestedModules: [module],
    currentLevel: "B1",
    weakPatterns: ["partitive"],
    lowMasteryUnitIds: ["unit-1"],
    dueReviewUnitIds: [],
    stagnatedUnitIds: [],
    weightsUsed: {
      low_mastery: 0.4,
    },
    decisionVersion: "decision-v1",
    policyVersion: "policy-v1",
    decisionPolicyVersion: "decision-policy-v1",
    governanceVersion: "governance-v1",
    changeReference: "change-1",
  };
}

function createYkiSessionPayload() {
  return {
    session_id: "session-1",
    user_id: "user-1",
    level: "B1",
    focus_areas: ["grammar"],
    examMode: true,
    next_allowed_action: "submit_only",
    completion_state: {
      completed_task_count: 0,
      status: "active",
      total_task_count: 1,
    },
    session_hash: "session-hash-1",
    task_sequence_hash: "task-sequence-hash-1",
    policyVersion: "policy-v1",
    decisionVersion: "decision-v1",
    governanceVersion: "governance-v1",
    changeReference: "change-1",
    precomputedPlan: {
      task_ids: ["task-1"],
      decision_version: "decision-v1",
      policy_version: "policy-v1",
      decision_policy_version: "decision-policy-v1",
      governance_version: "governance-v1",
      change_reference: "change-1",
      exam_mode: true,
      deterministic_seed: "seed-1",
    },
    tasks: [
      {
        id: "task-1",
        section: "reading",
        type: "multiple_choice",
        title: "Task 1",
        prompt: "Choose the correct answer.",
        timeLimitSeconds: 60,
        relatedLearningUnitId: "unit-1",
        relatedModuleId: "module-1",
      },
    ],
    current_task_index: 0,
    results: [],
    currentTask: {
      id: "task-1",
      section: "reading",
      type: "multiple_choice",
      title: "Task 1",
      prompt: "Choose the correct answer.",
      timeLimitSeconds: 60,
      relatedLearningUnitId: "unit-1",
      relatedModuleId: "module-1",
    },
    completedTaskCount: 0,
    isComplete: false,
    sessionSummary: {
      strengths: [],
      weaknesses: ["partitive"],
      improvement_trend: "steady",
      recommended_focus: ["partitive"],
      averageScore: 0,
    },
    sessionTrace: {
      decision_version: "decision-v1",
      policy_version: "policy-v1",
      decision_policy_version: "decision-policy-v1",
      governance_version: "governance-v1",
      change_reference: "change-1",
      exam_mode: true,
      adaptiveContext: {},
      tasks: [
        {
          taskId: "task-1",
          section: "reading",
          relatedLearningUnitId: "unit-1",
          task_selection_reason: "Policy-selected from governed plan.",
          difficulty_level: "medium",
          user_performance: null,
          feedback_generated: null,
          learning_influence: null,
        },
      ],
    },
    auditTimeline: [],
    auditReplay: {
      orderedEventIds: [],
      eventCounts: {},
      ykiTaskFlow: [],
      trusted: true,
      integrity: {
        ok: true,
        integrityStatus: "valid",
        chainLength: 0,
        failureIndex: null,
        failureEventId: null,
        failureReason: null,
        legacyEventCount: 0,
        streamKey: "session-1",
      },
    },
    auditVerification: {
      ok: true,
      issues: [],
      trusted: true,
      integrity: {
        ok: true,
        integrityStatus: "valid",
        chainLength: 0,
        failureIndex: null,
        failureEventId: null,
        failureReason: null,
        legacyEventCount: 0,
        streamKey: "session-1",
      },
    },
  };
}

function run() {
  const {
    ControlledUiValidationError,
    REQUIRED_BACKEND_VERSION,
    REQUIRED_CONTRACT_VERSION,
    validateApiEnvelope,
    validateLearningModulesPayload,
    validateYkiPracticeSessionPayload,
  } = loadValidatorModule();

  const validLearningPayload = createLearningModulesPayload();
  const validatedLearning = validateLearningModulesPayload(validLearningPayload, {
    allowLegacyUncontrolled: false,
  });
  assert.equal(validatedLearning.governanceStatus, "governed");

  const invalidLearningPayload = createLearningModulesPayload();
  delete invalidLearningPayload.governanceVersion;
  assert.throws(
    () =>
      validateLearningModulesPayload(invalidLearningPayload, {
        allowLegacyUncontrolled: false,
      }),
    (error) => {
      assert.ok(error instanceof ControlledUiValidationError);
      assert.equal(error.code, "CONTRACT_VIOLATION");
      return true;
    },
  );

  const invalidYkiPayload = createYkiSessionPayload();
  delete invalidYkiPayload.sessionTrace.governance_version;
  assert.throws(
    () =>
      validateYkiPracticeSessionPayload(invalidYkiPayload, {
        allowLegacyUncontrolled: false,
      }),
    (error) => {
      assert.ok(error instanceof ControlledUiValidationError);
      assert.equal(error.code, "CONTRACT_VIOLATION");
      return true;
    },
  );

  const validatedEnvelope = validateApiEnvelope(
    {
      ok: true,
      data: createYkiSessionPayload(),
      error: null,
      meta: {
        version: REQUIRED_BACKEND_VERSION,
        contract_version: REQUIRED_CONTRACT_VERSION,
        timestamp: "2026-04-01T00:00:00+00:00",
      },
    },
    "/api/v1/yki-practice/start",
    {
      validateData: (payload) =>
        validateYkiPracticeSessionPayload(payload, {
          allowLegacyUncontrolled: false,
        }),
    },
  );
  assert.equal(validatedEnvelope.meta.version, REQUIRED_BACKEND_VERSION);

  assert.throws(
    () =>
      validateApiEnvelope(
        {
          ok: true,
          data: createYkiSessionPayload(),
          error: null,
          meta: {
            version: "wrong-version",
            contract_version: REQUIRED_CONTRACT_VERSION,
            timestamp: "2026-04-01T00:00:00+00:00",
          },
        },
        "/api/v1/yki-practice/start",
        {
          validateData: (payload) =>
            validateYkiPracticeSessionPayload(payload, {
              allowLegacyUncontrolled: false,
            }),
        },
      ),
    (error) => {
      assert.ok(error instanceof ControlledUiValidationError);
      assert.equal(error.code, "CONTRACT_VIOLATION");
      return true;
    },
  );

  console.log("controlled_ui_contract_validation: ok");
}

run();
