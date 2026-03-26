import { RoleplayScreen } from "./RoleplayScreen";

export function ConversationScreen(props: { restoredSession: any | null }) {
  return <RoleplayScreen restoredSession={props.restoredSession} />;
}
