import { useLocalSearchParams } from "expo-router";

import BaseScreen from "@ui/screens/BaseScreen";

import PracticeFeature from "../features/practice/PracticeFeature";

export default function Practice() {
  const params = useLocalSearchParams<{ moduleId?: string | string[] }>();
  const moduleId = Array.isArray(params.moduleId)
    ? params.moduleId[0]
    : params.moduleId ?? null;

  return (
    <BaseScreen title="Practice">
      <PracticeFeature moduleId={moduleId} />
    </BaseScreen>
  );
}
