import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { storageService } from "@core/services/storageService";

const RUNTIME_KEY = "runtime_foundation_status";

export default function Index() {
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text>KieliTaika RN App</Text>
      <Text>@core storageService: {storageValue}</Text>
      <Link href="/auth" asChild>
        <Pressable>
          <Text>Go to Auth</Text>
        </Pressable>
      </Link>
    </View>
  );
}
