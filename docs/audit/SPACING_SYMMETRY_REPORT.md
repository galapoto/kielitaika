# SPACING_SYMMETRY_REPORT

## Spacing Scale Reality

Measured from [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):

- `4px`: 8 occurrences
- `6px`: 9 occurrences
- `8px`: 13 occurrences
- `10px`: 10 occurrences
- `12px`: 20 occurrences
- `14px`: 26 occurrences
- `16px`: 42 occurrences
- `18px`: 23 occurrences
- `20px`: 18 occurrences
- `22px`: 6 occurrences
- `24px`: 22 occurrences
- `26px`: 1 occurrence
- `28px`: 7 occurrences
- `30px`: 1 occurrence
- `32px`: 7 occurrences
- `34px`: 2 occurrences

Conclusion:
- The spacing system is not a strict 8px grid.
- `10px`, `14px`, `18px`, `22px`, `26px`, `30px`, and `34px` create inconsistent rhythm.

## Radius Inconsistency

Observed radius values in active CSS:

- `12px`
- `14px`
- `16px`
- `18px`
- `20px`
- `22px`
- `24px`
- `26px`
- `28px`
- `32px`
- `34px`
- `999px`

Conclusion:
- Radius tokens are not normalized.
- This directly weakens symmetry and component family cohesion.

## Uneven Padding Examples

- `.app-shell-frame { padding: 32px; }` at line 82
- `.main-content { padding: 28px; }` at line 266
- `.panel { padding: 20px; }` at line 741
- `.feature-card { padding: 18px; }` at line 880
- `.meta-item { padding: 14px; }` at line 922
- `.status-banner { padding: 14px 16px; }` at line 933
- `.auth-card { padding: 24px; }` at line 1005
- `.reading-passages { padding: 18px; }` at line 1248

Conclusion:
- The UI uses multiple near-neighbor paddings rather than a clean system.
- This creates visual drift even when containers are technically aligned.

## Left/Right / Vertical Rhythm Mismatches

- Shell outer padding is `32px`, but main content inner padding is `28px`.
  Difference: `4px`
- Mobile top padding for content is `64px` or `68px`, while side padding is `20px` or `16px`.
  Difference: top padding exceeds side padding by `44px` to `52px`
- Navigation item padding is `14px 16px`, subitem padding is `10px 14px`.
  Difference: `4px` vertical and `2px` horizontal

## Alignment Issues

- `.dashboard-hero-block` uses asymmetric column ratios `1.25fr 0.85fr` at line 366.
- `.screen-action-zone > .panel` is constrained to `560px` and right-aligned at lines 329-331, while other content sections are full-width.
- `.dashboard-screen` attempts centered placement, while most other screens align content to the top.
- `.mobile-shell-title` is absolutely positioned, but page content starts below via hardcoded top padding rather than shared layout logic.

## Symmetry Summary

Top symmetry problems:

1. No enforced spacing scale
2. Mixed radius system
3. Mixed centering vs top-alignment across screen families
4. Different content widths and action widths inside the same page scaffold
5. Hardcoded mobile offsets instead of systemic header spacing
