# DESIGN_TOKEN_SPEC

## Spacing System

- Grid: `8px`
- Allowed core spacing steps:
  `8px`, `16px`, `24px`, `32px`, `48px`
- Use:
  `8px` for micro gaps
  `16px` for default padding and control spacing
  `24px` for section spacing
  `32px` for large card/shell separation
  `48px` for page-level breathing room when needed

## Padding Rules

- Standard card padding: `16px` or `20px`
- Action area spacing: `16px`
- Major panel separation: `24px`
- Mobile page padding: `16px`
- Desktop shell padding: `24px` or `32px`

## Margin Rules

- Avoid arbitrary margins; prefer layout gap systems.
- Heading-to-subtitle gap: `8px`
- Card-to-card gap: `24px`
- Section-to-action gap: `24px`

## Container Widths

| Token | Value | Current source |
| --- | --- | --- |
| Shell max | `1360px` | `ui_invariants.ts` |
| Content max | `1120px` | `ui_invariants.ts` |
| Practice max | `980px` | `ui_invariants.ts` |
| Card width | `460px` | `ui_invariants.ts` |
| Mobile drawer max | `320px` | `ui_invariants.ts` |

## Radius Rules

- Small radius: `12px`
- Medium radius: `16px`
- Large radius: `20px`
- Avoid larger bespoke radii unless the whole system is upgraded consistently.

## Typography

### Font Families

- Primary UI font: `Inter`
- Optional display companion: `Space Grotesk`
- Avoid serif headings in the final system

### Type Scale

| Token | Size | Line height | Letter spacing |
| --- | --- | --- | --- |
| Hero | `32px` to `36px` | `1.2` | `-0.5px` |
| Section heading | `24px` to `28px` | `1.25` | `-0.3px` |
| Body | `15px` to `17px` | `1.5` | `0.2px` |
| Button | `15px` | `1.2` to `1.3` | `0.5px` |
| Eyebrow | `12px` to `13px` | `1.3` | uppercase/tracked |

## Current Repo Divergence

- `global.css` still hardcodes many values outside the locked spacing set.
- Headings currently use Georgia in multiple places.
- Border radii are broader and less normalized than the target system.

## Recommendation

- Next rebuild phase should move these tokens into one code-level source of truth and then emit both CSS variables and TS constants from that source.
