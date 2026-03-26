import { useAppState } from "../state/AppStateProvider";

export function useAppScreen() {
  const app = useAppState();
  return {
    screen: app.screen,
    setScreen: app.setScreen,
  };
}
