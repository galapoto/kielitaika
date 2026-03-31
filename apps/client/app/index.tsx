import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { storageService } from "@core/services/storageService";
import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import Center from "@ui/components/layout/Center";
import Screen from "@ui/components/layout/Screen";
import Section from "@ui/components/layout/Section";

const RUNTIME_KEY = "runtime_foundation_status";

export default function Index() {
  const router = useRouter();
  const [storageValue, setStorageValue] = useState<string>("loading");

  useEffect(() => {
    let active = true;

    async function loadRuntimeState() {
      await storageService.set(RUNTIME_KEY, "ready");
      const value = await storageService.get(RUNTIME_KEY);

      if (active) {
        setStorageValue(String(value ?? "missing"));
      }
    }

    loadRuntimeState();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen>
      <Center>
        <Section>
          <Text variant="title">KieliTaika RN App</Text>
          <Text tone="secondary">@core storageService: {storageValue}</Text>
          <Button label="Go to Auth" onPress={() => router.push("/auth")} />
        </Section>
      </Center>
    </Screen>
  );
}
