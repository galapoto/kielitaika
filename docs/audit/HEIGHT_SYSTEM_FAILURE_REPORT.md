# HEIGHT_SYSTEM_FAILURE_REPORT

## Breaking Pattern 1 — Nested fixed viewport boxes

Source chain:

- [`frontend/app/theme/global.css:8-10`](/home/vitus/kielitaika/frontend/app/theme/global.css:8)
  `html, body, #root { height: 100%; overflow: hidden; }`
- [`frontend/app/theme/global.css:26-28`](/home/vitus/kielitaika/frontend/app/theme/global.css:26)
  `.app-frame { height: 100vh; overflow: hidden; }`
- [`frontend/app/theme/global.css:78-83`](/home/vitus/kielitaika/frontend/app/theme/global.css:78)
  `.app-shell-frame { height: 100vh; overflow: hidden; }`
- [`frontend/app/theme/global.css:92-95`](/home/vitus/kielitaika/frontend/app/theme/global.css:92)
  `.app-shell { height: 100%; overflow: hidden; }`

Failure:
- The system creates multiple nested viewport-bound boxes instead of one viewport box plus one explicit content scroller.

## Breaking Pattern 2 — Child percentages depend on rigid parents

Source:

- `.route-stage { height: 100%; min-height: 100%; }` at lines 281-282
- `.screen-shell { height: 100%; min-height: 100%; }` at lines 289-290
- `.practice-screen { height: 100%; }` at line 391
- `.practice-runtime-root { height: 100%; }` at line 438

Failure:
- Percentage heights are used repeatedly, but each level inherits a constrained fixed-height parent.
- This leaves no vertical slack for content growth outside explicitly scroll-enabled areas.

## Breaking Pattern 3 — Padding consumes viewport without content compensation

Source:

- `.app-shell-frame { padding: 32px; }` at line 82
- `.main-content { padding: 28px; }` at line 266
- mobile:
  - `.main-content { padding: 64px 20px 20px; }` at line 1571
  - `.main-content { padding: 68px 16px 16px; }` at line 1699

Failure:
- Large top/outer paddings reduce the usable height inside already fixed-height containers.
- Once scroll is disabled, padding directly contributes to visible cutoff.

## Breaking Pattern 4 — Min-height without a corresponding scroll outlet

Source:

- `.dashboard-screen { min-height: 100%; }` at line 353
- `.yki-flow-screen { min-height: 100%; }` at line 1371
- `.auth-shell { min-height: 100vh; }` at line 993
- `.loading-screen { min-height: 100vh; }` at line 973

Failure:
- These screens assume they can occupy the full viewport height.
- On non-exam pages, there is no vertical escape route when stacked content plus header plus actions exceed the available height.

## Breaking Pattern 5 — Mobile viewport inconsistency

Source:

- `.app-shell { min-height: calc(100vh - 28px); overflow: visible; }` at lines 1562-1563
- `.app-shell { min-height: calc(100vh - 20px); }` at line 1690

Failure:
- Mobile switches one major container to `overflow: visible` while the parent chain remains locked.
- This produces breakpoint-specific behavior: not true scroll, but bleed/clip inconsistency.

## Safe-area handling

- No explicit safe-area insets are used.
- Mobile top padding is hardcoded (`64px`, `68px`) rather than derived from safe-area values.

## Exact Height Failure Summary

- The app now has a broken height chain because the height chain is complete, but it is over-constrained.
- The system does not fail because height is undefined.
- It fails because height is defined too aggressively at every level while overflow is suppressed.
