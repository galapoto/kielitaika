import { RUNTIME_CONTRACT_VERSION } from "../contracts/CONTRACT_VERSION";
import type { ExamRuntimeContract } from "../types/exam";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRuntimeContract(value: unknown): ExamRuntimeContract {
  if (RUNTIME_CONTRACT_VERSION !== "v3") {
    throw new Error("System must run on v3 contract only");
  }
  if (!isRecord(value)) {
    throw new Error("Runtime payload is not an object");
  }
  if (value.runtime_schema_version !== "3.0") {
    throw new Error("Runtime payload has an invalid runtime_schema_version");
  }
  if (!hasNonEmptyString(value.session_id)) {
    throw new Error("Runtime payload missing session_id");
  }
  if (!Array.isArray(value.sections)) {
    throw new Error("Runtime payload missing sections");
  }
  if (!isRecord(value.responses)) {
    throw new Error("Runtime payload missing responses");
  }
  if (!isRecord(value.progress)) {
    throw new Error("Runtime payload missing progress");
  }

  const runtime = value as ExamRuntimeContract;
  runtime.sections.forEach((section, sectionIndex) => {
    if (!section || typeof section !== "object") {
      throw new Error(`Section ${sectionIndex + 1} is invalid`);
    }
    if (!hasNonEmptyString(section.section_type)) {
      throw new Error(`Section ${sectionIndex + 1} missing section_type`);
    }
    if (typeof section.index !== "number") {
      throw new Error(`Section ${section.section_type} missing index`);
    }
    if (!Array.isArray(section.items)) {
      throw new Error(`Section ${section.section_type} missing items`);
    }
    section.items.forEach((item, itemIndex) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Section ${section.section_type} item ${itemIndex + 1} is invalid`);
      }
      if (!isRecord(item.prompt)) {
        throw new Error(`Section ${section.section_type} item ${itemIndex + 1} missing prompt`);
      }
      if (!hasNonEmptyString(item.item_id)) {
        throw new Error(`Section ${section.section_type} item ${itemIndex + 1} missing item_id`);
      }
      if (typeof item.index !== "number") {
        throw new Error(`Section ${section.section_type} item ${itemIndex + 1} missing index`);
      }
      if (section.section_type === "speaking") {
        if (!hasNonEmptyString(item.prompt.instruction || item.prompt.instructions)) {
          throw new Error(`Speaking item ${itemIndex + 1} missing instruction`);
        }
        if (!isRecord(item.recording)) {
          throw new Error(`Speaking item ${itemIndex + 1} missing recording limits`);
        }
        if (typeof item.recording.min_duration_sec !== "number" || typeof item.recording.max_duration_sec !== "number") {
          throw new Error(`Speaking item ${itemIndex + 1} has invalid recording limits`);
        }
        if (
          typeof item.speaking_mode !== "undefined" &&
          item.speaking_mode !== "recording" &&
          item.speaking_mode !== "conversation"
        ) {
          throw new Error(`Speaking item ${itemIndex + 1} has an invalid speaking_mode`);
        }
        if (typeof item.conversation !== "undefined") {
          if (!Array.isArray(item.conversation)) {
            throw new Error(`Speaking item ${itemIndex + 1} has invalid conversation turns`);
          }
          item.conversation.forEach((turn, turnIndex) => {
            if (!turn || typeof turn !== "object") {
              throw new Error(`Speaking item ${itemIndex + 1} turn ${turnIndex + 1} is invalid`);
            }
            if (!hasNonEmptyString(turn.turn_id)) {
              throw new Error(`Speaking item ${itemIndex + 1} turn ${turnIndex + 1} missing turn_id`);
            }
            if (!hasNonEmptyString(turn.speaker)) {
              throw new Error(`Speaking item ${itemIndex + 1} turn ${turnIndex + 1} missing speaker`);
            }
            if (typeof turn.response_required !== "boolean") {
              throw new Error(`Speaking item ${itemIndex + 1} turn ${turnIndex + 1} missing response_required`);
            }
          });
        }
      }
      if (section.section_type === "listening" && !hasNonEmptyString(item.prompt.audio_url)) {
        throw new Error(`Listening item ${itemIndex + 1} missing audio_url`);
      }
      if (!Array.isArray(item.questions)) {
        return;
      }
      item.questions.forEach((question, questionIndex) => {
        if (!question || typeof question !== "object") {
          throw new Error(`Question ${questionIndex + 1} in ${section.section_type} is invalid`);
        }
        if (!hasNonEmptyString(question.id)) {
          throw new Error(`Question ${questionIndex + 1} in ${section.section_type} missing id`);
        }
        if (!hasNonEmptyString(question.answer_id)) {
          throw new Error(`Question ${questionIndex + 1} in ${section.section_type} missing answer_id`);
        }
        if (typeof question.index !== "number") {
          throw new Error(`Question ${questionIndex + 1} in ${section.section_type} missing index`);
        }
        if (!hasNonEmptyString(question.question)) {
          throw new Error(`Question ${questionIndex + 1} in ${section.section_type} missing text`);
        }
      });
    });
  });

  if (!isRecord(runtime.responses.objective_answers)) {
    throw new Error("Runtime payload missing objective_answers");
  }
  if (!isRecord(runtime.responses.writing_answers)) {
    throw new Error("Runtime payload missing writing_answers");
  }
  if (!isRecord(runtime.responses.audio_answers)) {
    throw new Error("Runtime payload missing audio_answers");
  }
  if (typeof runtime.progress.answered !== "number" || typeof runtime.progress.total !== "number") {
    throw new Error("Runtime payload progress is invalid");
  }

  return runtime;
}
