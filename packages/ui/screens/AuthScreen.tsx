import Button from "../components/primitives/Button";
import Input from "../components/primitives/Input";
import Text from "../components/primitives/Text";
import Center from "../components/layout/Center";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";
import { StyleSheet } from "react-native";

export default function AuthScreen() {
  return (
    <Screen>
      <Center>
        <Section style={styles.section}>
          <Text variant="title">Auth</Text>
          <Text tone="secondary">
            UI foundation screen. Authentication logic will attach in a later phase.
          </Text>
          <Input editable={false} placeholder="Email" value="" />
          <Input editable={false} placeholder="Password" secureTextEntry value="" />
          <Button disabled label="Continue" />
        </Section>
      </Center>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
  },
});
