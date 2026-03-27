import Card from "../../components/ui/Card";
import type { ExamQuestion } from "../../types/exam";
import { Button } from "../../components/Button";

type Props = {
  question: ExamQuestion;
  selected?: string | boolean | number;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export default function QuestionCard({ question, selected, onSelect, disabled = false }: Props) {
  return (
    <Card>
      <div className="question-card">
        <strong>{question.question}</strong>
        {question.options.length ? (
          <div className="option-grid">
            {question.options.map((option) => (
              <Button
                key={`${question.id}-${option}`}
                tone={selected === option ? "primary" : "secondary"}
                className="option-button"
                onClick={() => onSelect(option)}
                disabled={disabled}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
