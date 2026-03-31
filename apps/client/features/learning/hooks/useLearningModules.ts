import { useEffect, useState } from "react";

import {
  getDueReviewUnits,
  getLearningModules,
  type DueReviewUnit,
  type LearningModulesData,
} from "../services/learningService";

type LearningModulesState = {
  data: LearningModulesData | null;
  dueReviewUnits: DueReviewUnit[];
  loading: boolean;
  error: { message: string } | null;
};

export default function useLearningModules() {
  const [state, setState] = useState<LearningModulesState>({
    data: null,
    dueReviewUnits: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      const [modulesRes, dueReviewRes] = await Promise.all([
        getLearningModules(),
        getDueReviewUnits(),
      ]);

      if (modulesRes.ok && modulesRes.data) {
        setState({
          data: modulesRes.data,
          dueReviewUnits: dueReviewRes.ok && dueReviewRes.data ? dueReviewRes.data.units : [],
          loading: false,
          error: null,
        });
        return;
      }

      setState({
        data: null,
        dueReviewUnits: [],
        loading: false,
        error: modulesRes.error ?? { message: "LEARNING_MODULES_FAILED" },
      });
    }

    load();
  }, []);

  return state;
}
