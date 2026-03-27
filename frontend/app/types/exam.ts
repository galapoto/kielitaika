export type ExamQuestion = {
  id: string;
  answer_id: string;
  index: number;
  question: string;
  options: string[];
};

export type ExamPrompt = {
  title?: string | null;
  text?: string | null;
  audio_url?: string | null;
  instruction?: string | null;
  instructions?: string | null;
  context?: string | null;
};

export type ExamRecording = {
  min_duration_sec: number;
  max_duration_sec: number;
};

export type ExamConversationTurn = {
  turn_id: string;
  speaker: string;
  text?: string | null;
  audio_url?: string | null;
  response_required: boolean;
};

export type ExamSectionItem = {
  item_id: string;
  index: number;
  prompt: ExamPrompt;
  questions?: ExamQuestion[];
  speaking_mode?: "recording" | "conversation";
  recording?: ExamRecording;
  conversation?: ExamConversationTurn[];
};

export type ExamSection = {
  section_type: "reading" | "listening" | "writing" | "speaking";
  index: number;
  items: ExamSectionItem[];
};

export type ObjectiveAnswerValue = string | boolean | number;

export type ExamRuntimeResponses = {
  objective_answers: Record<string, ObjectiveAnswerValue>;
  writing_answers: Record<string, string>;
  audio_answers: Record<string, string>;
};

export type ExamRuntimeProgress = {
  answered: number;
  total: number;
};

export type ExamRuntimeContract = {
  runtime_schema_version: "3.0";
  session_id: string;
  level?: string | null;
  sections: ExamSection[];
  responses: ExamRuntimeResponses;
  progress: ExamRuntimeProgress;
};
