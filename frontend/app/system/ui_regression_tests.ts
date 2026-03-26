import type { UiManagedScreen } from "./ui_invariants";
import { UI_INVARIANTS } from "./ui_invariants";

export const SCREEN_BACKGROUND_SCENARIOS: Array<{ screen: UiManagedScreen; decorative: boolean }> = [
  { screen: "auth", decorative: true },
  { screen: "home", decorative: true },
  { screen: "practice", decorative: false },
  { screen: "conversation", decorative: true },
  { screen: "yki_intro", decorative: false },
  { screen: "yki_runtime", decorative: false },
  { screen: "yki_result", decorative: false },
  { screen: "professional", decorative: true },
  { screen: "settings", decorative: true },
  { screen: "debug", decorative: true },
];

export const REQUIRED_GLOBAL_WIDTH_RULES = [
  `width: min(100%, ${UI_INVARIANTS.CONTENT_WIDTH_CAPS.shellMax}px);`,
  `width: min(100%, ${UI_INVARIANTS.CONTENT_WIDTH_CAPS.contentMax}px);`,
  `width: min(100%, ${UI_INVARIANTS.CONTENT_WIDTH_CAPS.practiceMax}px);`,
  `width: min(100%, ${UI_INVARIANTS.CONTENT_WIDTH_CAPS.cardWidth}px);`,
] as const;

export const REQUIRED_MOBILE_RULES = [
  `padding: ${UI_INVARIANTS.MOBILE_SHELL_RULES.contentPaddingTop}px ${UI_INVARIANTS.MOBILE_SHELL_RULES.contentPaddingInline}px ${UI_INVARIANTS.MOBILE_SHELL_RULES.contentPaddingInline}px;`,
  `width: min(84vw, ${UI_INVARIANTS.MOBILE_SHELL_RULES.drawerMaxWidth}px);`,
] as const;

export const REQUIRED_APP_SCREEN_MARKERS = [
  "let screen = <DashboardScreen",
  'screen = <CardsScreen section={practiceSection} />',
  'screen = <RoleplayScreen restoredSession={app.restoredRoleplaySession} />',
  '<VoiceStudioScreen',
  'screen = <SettingsScreen user={app.auth.session.auth_user} subscription={app.subscription} />',
  "screen = <DebugScreen />",
  "{screen}",
] as const;

export const REQUIRED_CARD_RUNTIME_MARKERS = [...UI_INVARIANTS.REQUIRED_CARD_STRUCTURE_MARKERS] as const;
