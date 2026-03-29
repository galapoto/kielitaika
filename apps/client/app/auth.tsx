import BaseScreen from "@ui/screens/BaseScreen";
import AuthFeature from "../features/auth/AuthFeature";

export default function Auth() {
  return (
    <BaseScreen title="Auth">
      <AuthFeature />
    </BaseScreen>
  );
}
