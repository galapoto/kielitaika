import type { ExamQuestion } from "../../types/exam";
import QuestionCard from "./QuestionCard";

type Props = {
  questions: ExamQuestion[];
  answers: Record<string, string | boolean | number>;
  onSelect: (questionId: string, value: string) => void;
  disabled?: boolean;
};

export default function QuestionList({ questions, answers, onSelect, disabled = false }: Props) {
  return (
    <div className="question-list">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          selected={answers[question.answer_id]}
          onSelect={(value) => onSelect(question.answer_id, value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
