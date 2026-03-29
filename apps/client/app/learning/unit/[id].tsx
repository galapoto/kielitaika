import { useLocalSearchParams } from "expo-router";

import BaseScreen from "@ui/screens/BaseScreen";

import UnitView from "../../../features/learning/UnitView";

export default function LearningUnitRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const unitId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  return (
    <BaseScreen title="Unit">
      <UnitView unitId={unitId} />
    </BaseScreen>
  );
}
