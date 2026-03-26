# DESIGN_VIOLATION_REPORT

## Layout Violations

- `/home/vitus/kielitaika/frontend/app/App.tsx`
  Reason: The app uses screen-state switching with `history.replaceState`, not a real route system. This only partially satisfies the route architecture in `core_design_principle.md`.
- `/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx`
  Reason: Screen state is still a local state machine instead of a dedicated route controller. URL and state can drift conceptually even if they are synchronized.
- `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx`
  Reason: Fatal errors render through an auth-style card shell outside the main layout, so the app structure is broken during failure states.
- `/home/vitus/kielitaika/frontend/app/components/LoadingScreen.tsx`
  Reason: The loading surface still exposes the internal label `Runtime gate`, which conflicts with the no-backend/no-system-text rule.

## Spacing Violations

- `/home/vitus/kielitaika/frontend/app/theme/global.css`
  Reason: The system uses the 8px family in many places, but still contains multiple non-tokenized values such as `10px`, `12px`, `14px`, `18px`, `20px`, `22px`, `28px`, `30px`, and `34px`. This violates the strict spacing-grid goal in the design documents.
- `/home/vitus/kielitaika/frontend/app/theme/global.css`
  Reason: Radius values are not normalized to a small locked set. The stylesheet mixes `12px`, `14px`, `16px`, `18px`, `20px`, `22px`, `24px`, `26px`, `28px`, `32px`, and `34px`.

## Typography Violations

- `/home/vitus/kielitaika/frontend/app/theme/global.css`
  Reason: Headings still use `Georgia, "Times New Roman", serif` instead of the Inter-focused system in the design documents.
- `/home/vitus/kielitaika/frontend/app/theme/global.css`
  Reason: The typography scale is not centrally tokenized. Sizes and letter spacing are authored ad hoc across hero titles, panels, auth copy, and card text.

## Icon Violations

- `/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx`
  Reason: Practice still uses text/emoji-style symbols (`⟲`, `🔊`, `✓`, `↻`) instead of the Lucide-based icon system used elsewhere.
- `/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx`
  Reason: The Google button icon is custom SVG while the rest of the interface uses Lucide. This is acceptable for brand compliance, but it breaks total icon-system uniformity.

## Symmetry Violations

- `/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx`
  Reason: Home is much closer to the intended landing page, but it still retains dashboard-era structural markers (`dashboard-surface`, `dashboard-hero-block`, `feature-card`) instead of a dedicated home-only layout primitive.
- `/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx`
  Reason: Settings still uses a navigation advisory card inside the screen body, even though sidebar-only navigation is the intended pattern.

## Content and Messaging Violations

- `/home/vitus/kielitaika/frontend/app/components/LoadingScreen.tsx`
  Reason: `Runtime gate` is visible to users.
- `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx`
  Reason: `Application Guardrail Triggered` and raw stack output remain user-visible.
- `/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx`
  Reason: This screen intentionally exposes logs and failures. That is correct for `/debug`, but it should remain isolated from general-user navigation expectations.

## Route/Flow Violations

- `/home/vitus/kielitaika/frontend/app/App.tsx`
  Reason: Only high-level routes are represented. The finer route tree from `core_design_principle.md` is not implemented:
  `/conversation/session`, `/conversation/result`, `/yki/reading`, `/yki/listening`, `/yki/writing`, `/settings/profile`, `/settings/subscription`, `/professional/speaking`, `/professional/pronunciation`, `/professional/tools`.
- `/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx`
  Reason: Conversation setup, runtime, and review are combined into one screen component, which weakens the “one screen = one purpose” rule even though only one branch is visible at a time.
- `/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx`
  Reason: Speaking, transcript review, pronunciation feedback, and TTS are presented in one screen component instead of explicit subroutes/stages.

## Validation Snapshot

- `npm run validate:ui-invariants`: passed
- `npm run build`: passed

## Summary

- The repo is materially closer to the design contract than before.
- The biggest remaining violations are architectural, not visual: route granularity, token centralization, typography consistency, and a few leftover internal/fallback surfaces.
