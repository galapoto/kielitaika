import { useEffect, useState } from "react";

import {
  getLearningUnit,
  getRelatedUnits,
  type LearningUnit,
} from "../services/learningService";

type LearningUnitState = {
  data: LearningUnit | null;
  relatedUnits: LearningUnit[];
  loading: boolean;
  error: { message: string } | null;
};

export default function useLearningUnit(unitId: string | null) {
  const [state, setState] = useState<LearningUnitState>({
    data: null,
    relatedUnits: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const resolvedUnitId = unitId;

    if (!resolvedUnitId) {
      setState({
        data: null,
        relatedUnits: [],
        loading: false,
        error: { message: "UNIT_NOT_FOUND" },
      });
      return;
    }

    const activeUnitId = resolvedUnitId;

    async function load() {
      const [unitRes, relatedRes] = await Promise.all([
        getLearningUnit(activeUnitId),
        getRelatedUnits(activeUnitId),
      ]);

      if (unitRes.ok && unitRes.data && relatedRes.ok && relatedRes.data) {
        setState({
          data: unitRes.data,
          relatedUnits: relatedRes.data.relatedUnits,
          loading: false,
          error: null,
        });
        return;
      }

      setState({
        data: null,
        relatedUnits: [],
        loading: false,
        error:
          unitRes.error ??
          relatedRes.error ?? { message: "LEARNING_UNIT_LOAD_FAILED" },
      });
    }

    load();
  }, [unitId]);

  return state;
}
