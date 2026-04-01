import Button from "../primitives/Button";
import Card from "../primitives/Card";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

type Props = {
  code: string;
  message: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
  traceReference?: string | null;
};

export default function ApplicationErrorScreen({
  code,
  message,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  secondaryLabel,
  traceReference,
}: Props) {
  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          <Button label={primaryLabel} onPress={onPrimaryAction} />
          {onSecondaryAction && secondaryLabel ? (
            <Button label={secondaryLabel} onPress={onSecondaryAction} tone="surface" />
          ) : null}
        </Stack>
      }
      center
      content={
        traceReference ? (
          <Card tone="surfaceMuted">
            <Text tone="muted">{traceReference}</Text>
          </Card>
        ) : null
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Runtime Blocked</Text>
            <Text tone="error">{code}</Text>
            <Text>{message}</Text>
          </Stack>
        </Card>
      }
    />
  );
}
