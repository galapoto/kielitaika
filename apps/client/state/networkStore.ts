import { create } from "zustand";

type NetworkState = {
  isOffline: boolean;
  startMonitoring: () => () => void;
};

function getCurrentOfflineState() {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
    return !navigator.onLine;
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

    if (typeof window === "undefined" || !window.addEventListener) {
      return () => undefined;
    }

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  },
}));
