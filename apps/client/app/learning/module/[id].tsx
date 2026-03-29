import { useLocalSearchParams } from "expo-router";

import BaseScreen from "@ui/screens/BaseScreen";

import ModuleView from "../../../features/learning/ModuleView";

export default function LearningModuleRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  return (
    <BaseScreen title="Module">
      <ModuleView moduleId={moduleId} />
    </BaseScreen>
  );
}
