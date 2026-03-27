import { Button } from "../../components/Button";

type Props = {
  title: string;
  sectionLabel: string;
  progressText: string;
  onExit: () => void;
  disabled?: boolean;
};

export default function ExamHeader({ title, sectionLabel, progressText, onExit, disabled = false }: Props) {
  return (
    <div className="exam-header">
      <div className="exam-header-copy">
        <span className="eyebrow">{sectionLabel || "YKI Exam"}</span>
        <h1 className="hero-title">{title}</h1>
      </div>

      <div className="exam-header-meta">
        <span className="muted">{progressText}</span>
        <Button tone="secondary" onClick={onExit} disabled={disabled}>
          Exit exam
        </Button>
      </div>
    </div>
  );
}
