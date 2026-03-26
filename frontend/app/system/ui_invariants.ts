import type { AppScreen, PracticeSection } from "../state/types";

export const UI_INVARIANTS = {
  SINGLE_ACTIVE_SCREEN: true,
  BACKGROUND_AUTHORITY_FILE: "frontend/app/theme/backgrounds.ts",
  CARD_AUTHORITY_FILE: "frontend/app/screens/CardsScreen.tsx",
  ALLOWED_SPACING_STEPS: [8, 16, 24, 32, 40] as const,
  TYPOGRAPHY: {
    primaryFont: "Inter",
    titleFont: "Space Grotesk",
  },
  EXAM_SCROLL_CONTAINER_CLASS: "exam-content",
  DECORATIVE_BACKGROUND_RESTRICTED_SCREENS: ["practice", "yki_intro", "yki_runtime", "yki_result"] as const,
  CONTENT_WIDTH_CAPS: {
    shellMax: 1360,
    contentMax: 1120,
    practiceMax: 980,
    cardWidth: 460,
  },
  MOBILE_SHELL_RULES: {
    drawerMaxWidth: 320,
    contentPaddingTop: 68,
    contentPaddingInline: 16,
  },
  BACKEND_CONTENT_TYPES: ["vocabulary_card", "sentence_card", "grammar_card"] as const,
  PRACTICE_SECTION_TO_CONTENT_TYPE: {
    vocabulary: "vocabulary_card",
    grammar: "grammar_card",
    phrases: "sentence_card",
  } as const,
  CARD_STATES: ["new", "practiced", "mastered"] as const,
  REQUIRED_CARD_STRUCTURE_MARKERS: [
    "practice-topbar",
    "practice-card-stage",
    "practice-card-wrapper",
    "practice-card-shell",
    "practice-card-inner",
    "practice-card-face",
    "practice-card-core",
    "practice-card-footer",
    "practice-card-divider",
    "practice-skip-button",
    "practice-progress-stack",
  ] as const,
} as const;

export type UiManagedScreen = AppScreen | "auth";
export type BackendContentType = (typeof UI_INVARIANTS.BACKEND_CONTENT_TYPES)[number];
export type RestrictedDecorativeScreen = (typeof UI_INVARIANTS.DECORATIVE_BACKGROUND_RESTRICTED_SCREENS)[number];

export function isDecorativeBackgroundAllowed(screen: UiManagedScreen): boolean {
  return !UI_INVARIANTS.DECORATIVE_BACKGROUND_RESTRICTED_SCREENS.includes(screen as RestrictedDecorativeScreen);
}

export function resolvePracticeContentType(section: PracticeSection): BackendContentType {
  return UI_INVARIANTS.PRACTICE_SECTION_TO_CONTENT_TYPE[section];
}

export function assertKnownBackendContentType(value: string): asserts value is BackendContentType {
  if (!UI_INVARIANTS.BACKEND_CONTENT_TYPES.includes(value as BackendContentType)) {
    throw new Error(`Unknown backend card content type: ${value}`);
  }
}
