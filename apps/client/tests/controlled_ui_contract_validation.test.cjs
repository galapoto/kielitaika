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
  return {
    levels: [
      {
        id: "level-a1-foundations",
        title: "Foundations",
        cefr: "A1",
        description: "Structured starter lessons",
        modules: [
          {
            id: "module-1",
            title: "Daily Routines",
            description: "Present tense basics",
            levelId: "level-a1-foundations",
            levelLabel: "A1",
            currentLessonId: "lesson-1",
            completedLessonCount: 0,
            totalLessonCount: 1,
            progressPercent: 0,
            lessons: [
              {
                id: "lesson-1",
                title: "Present tense",
                summary: "Describe routines",
                explanation: "Use the present tense for routine actions.",
                examples: ["Mina opiskelen suomea."],
                items: [
                  {
                    id: "item-1",
                    label: "Pattern",
                    value: "mina opiskelen",
                  },
                ],
                exercises: [
                  {
                    id: "exercise-1",
                    title: "Verb form",
                    prompt: "Complete the sentence.",
                    inputMode: "text",
                    options: [],
                    explanation: "The first person needs the matching verb ending.",
                    deterministicKey: "deterministic-1",
                  },
                ],
                progress: {
                  completed: false,
                  completedAt: null,
                  answeredExerciseIds: [],
                  allExercisesCorrect: false,
                  exerciseProgress: [
                    {
                      exerciseId: "exercise-1",
                      attempted: false,
                      lastCorrect: null,
                      lastSubmittedAnswer: null,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    moduleProgress: [
      {
        moduleId: "module-1",
        title: "Daily Routines",
        completedLessonCount: 0,
        totalLessonCount: 1,
        currentLessonId: "lesson-1",
        progressPercent: 0,
      },
    ],
    currentLevelId: "level-a1-foundations",
    currentModuleId: "module-1",
    currentLessonId: "lesson-1",
    completedLessonIds: [],
    completedLessonCount: 0,
    totalLessonCount: 1,
    latestEvaluation: null,
    latestTransition: null,
    decisionVersion: "decision-v1",
    policyVersion: "policy-v1",
    governanceVersion: "governance-v1",
    changeReference: "change-1",
    governanceStatus: "governed",
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
      responseSequence: [],
      finalSessionHash: "session-hash-1",
      finalTaskSequenceHash: "task-sequence-hash-1",
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
        trace_id: "trace-000001",
        event_id: "audit-000001",
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
            trace_id: "trace-000002",
            event_id: "audit-000002",
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
