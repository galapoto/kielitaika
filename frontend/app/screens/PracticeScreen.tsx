import { CardsScreen } from "./CardsScreen";
import type { PracticeSection } from "../state/types";

export function PracticeScreen(props: { section: PracticeSection }) {
  return <CardsScreen section={props.section} />;
}
