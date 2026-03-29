import { useEffect, useState } from "react";

import { getLearningModules, type LearningModulesData } from "../services/learningService";

type LearningModulesState = {
  data: LearningModulesData | null;
  loading: boolean;
  error: { message: string } | null;
};

export default function useLearningModules() {
  const [state, setState] = useState<LearningModulesState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      const res = await getLearningModules();

      if (res.ok && res.data) {
        setState({ data: res.data, loading: false, error: null });
        return;
      }

      setState({
        data: null,
        loading: false,
        error: res.error ?? { message: "LEARNING_MODULES_FAILED" },
      });
    }

    load();
  }, []);

  return state;
}
