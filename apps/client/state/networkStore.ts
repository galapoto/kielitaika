import { create } from "zustand";

type NetworkState = {
  isOffline: boolean;
  startMonitoring: () => () => void;
};

function getCurrentOfflineState() {
  const onlineState = (globalThis as Record<string, unknown>).onLine;

  if (typeof onlineState === "boolean") {
    return !onlineState;
  }

  return false;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOffline: getCurrentOfflineState(),
  startMonitoring() {
    const update = () => {
      set({
        isOffline: getCurrentOfflineState(),
      });
    };

    update();

    const target = globalThis as {
      addEventListener?: (event: string, listener: () => void) => void;
      removeEventListener?: (event: string, listener: () => void) => void;
    };

    if (!target.addEventListener || !target.removeEventListener) {
      return () => undefined;
    }

    target.addEventListener("online", update);
    target.addEventListener("offline", update);

    return () => {
      target.removeEventListener?.("online", update);
      target.removeEventListener?.("offline", update);
    };
  },
}));
