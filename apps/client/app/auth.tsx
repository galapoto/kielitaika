import { useEffect, useState } from "react";

import { clearPracticeSession } from "../features/yki-practice/services/ykiPracticeService";
import { clearExamSession } from "../features/yki-exam/services/ykiExamService";
import {
  clearPersistedLearningSession,
  clearPersistedNavigationState,
} from "../state/sessionPersistence";
import AppShell from "../state/AppShell";

export default function AuthRouteEntry() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function resetRuntimePersistence() {
      await Promise.all([
        clearPersistedLearningSession(),
        clearPersistedNavigationState(),
        clearExamSession(),
        clearPracticeSession(),
      ]);

      if (active) {
        setReady(true);
      }
    }

    void resetRuntimePersistence();

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <AppShell requestedScreen="auth" />;
}
