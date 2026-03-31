import Button from "../primitives/Button";
import Card from "../primitives/Card";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

type Action = {
  label: string;
  onPress: () => void;
  tone?: "primary" | "surface";
};

type Props = {
  title: string;
  subtitle: string;
  summary: string;
  details: string[];
  primaryAction?: Action;
  secondaryAction: Action;
};

export default function FeatureEntryScreen({
  title,
  subtitle,
  summary,
  details,
  primaryAction,
  secondaryAction,
}: Props) {
  return (
    <ScreenContainer center>
      <Stack gap="sm">
        <Card>
          <Stack gap="xs">
            <Text variant="title">{title}</Text>
            <Text tone="muted">{subtitle}</Text>
            <Text>{summary}</Text>
          </Stack>
        </Card>

        <Card>
          <Stack gap="xs">
            <Text variant="title">Governed Scope</Text>
            {details.map((detail) => (
              <Text key={detail}>{detail}</Text>
            ))}
          </Stack>
        </Card>

        <Card>
          <Stack gap="xs">
            {primaryAction ? (
              <Button
                label={primaryAction.label}
                onPress={primaryAction.onPress}
                tone={primaryAction.tone}
              />
            ) : null}
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              tone={secondaryAction.tone}
            />
          </Stack>
        </Card>
      </Stack>
    </ScreenContainer>
  );
}
