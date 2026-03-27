import { Button } from "../../components/Button";
import Card from "../../components/ui/Card";
import TextBlock from "../../components/ui/TextBlock";

type Props = {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyRuntimeState({ message = "No runtime available", actionLabel, onAction }: Props) {
  return (
    <Card>
      <div className="empty-state">
        <TextBlock>{message}</TextBlock>
        {actionLabel && onAction ? (
          <div className="actions-row">
            <Button tone="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
