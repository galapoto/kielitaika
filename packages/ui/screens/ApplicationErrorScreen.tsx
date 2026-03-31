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
};

export default function ApplicationErrorScreen({
  code,
  message,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  secondaryLabel,
}: Props) {
  return (
    <ScreenContainer center>
      <Stack gap="sm">
        <Card>
          <Stack gap="xs">
            <Text variant="title">Navigation Blocked</Text>
            <Text tone="error">{code}</Text>
            <Text>{message}</Text>
          </Stack>
        </Card>
        <Button label={primaryLabel} onPress={onPrimaryAction} />
        {onSecondaryAction && secondaryLabel ? (
          <Button label={secondaryLabel} onPress={onSecondaryAction} tone="surface" />
        ) : null}
      </Stack>
    </ScreenContainer>
  );
}
