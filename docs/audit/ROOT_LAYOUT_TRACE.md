# ROOT_LAYOUT_TRACE

## LEVEL 1 — Root (`html`, `body`, `#root`)

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):5-22

- `html, body, #root`
  - `height: 100%` at line 8
  - `overflow: hidden` at line 9
  - `margin: 0` at line 10
- `body`
  - `min-height: 100vh` at line 16
- `#root`
  - `min-height: 100vh` at line 21

Effect:
- The viewport is hard-locked at the document level.
- No root-level scroll can occur anywhere in the app.

## LEVEL 2 — App container

Source: [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx):98-187 and [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):24-60

- App root surface: `.app-frame`
  - `position: relative` at line 25
  - `height: 100vh` at line 26
  - `min-height: 100vh` at line 27
  - `overflow: hidden` at line 28
  - `isolation: isolate` at line 29
- Visual layers
  - `.app-logo-overlay` is `position: absolute` and `inset: 0` at lines 32-38
  - `.app-frame::before` is `position: absolute` and `inset: 0` at lines 48-55

Effect:
- The app surface is a fixed-height viewport box.
- Anything taller than the viewport must be handled by a descendant scroll container.

## LEVEL 3 — AppShell

Source: [`frontend/app/components/AppShell.tsx`](/home/vitus/kielitaika/frontend/app/components/AppShell.tsx):130-229 and [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):77-111, 1548-1691

- `.app-shell-frame`
  - `height: 100vh` at line 78
  - `min-height: 100vh` at line 79
  - `display: grid` at line 80
  - `padding: 32px` at line 82
  - `overflow: hidden` at line 83
- `.app-shell`
  - `display: grid` at line 87
  - `grid-template-columns: 292px minmax(0, 1fr)` at line 88
  - `width: min(100%, 1360px)` at line 89
  - `height: 100%` at line 92
  - `min-height: min(900px, calc(100vh - 32px))` at line 93
  - `overflow: hidden` at line 95
- Mobile override
  - `.app-shell { overflow: visible; }` at line 1563 for `max-width: 980px`
  - `.app-shell { min-height: calc(100vh - 20px); }` at line 1690 for `max-width: 560px`

Effect:
- Desktop shell is clipped to its own frame.
- Mobile shell is inconsistent: it is still height-constrained but `overflow` flips to `visible`, so clipping/bleed behavior differs by breakpoint.

## LEVEL 4 — Page wrapper

Source: [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx):182-184 and [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):261-296

- `.main-content`
  - `display: grid` at line 263
  - `align-content: start` at line 264
  - `min-height: 0` at line 265
  - `padding: 28px` at line 266
  - `overflow: hidden` at line 267
- `.route-stage`
  - `display: flex` at line 278
  - `flex-direction: column` at line 279
  - `height: 100%` at line 281
  - `min-height: 100%` at line 282
  - `overflow: hidden` at line 283
- `.screen-shell`
  - `width: min(100%, 1120px)` at line 288
  - `height: 100%` at line 289
  - `min-height: 100%` at line 290
  - `display: flex` at line 292
  - `flex-direction: column` at line 293
  - `gap: 24px` at line 294
  - `overflow: hidden` at line 295

Effect:
- The non-exam route stack has three consecutive clipping layers:
  1. `.main-content`
  2. `.route-stage`
  3. `.screen-shell`
- None of those layers allows non-exam overflow to scroll.

## LEVEL 5 — Content containers

### Home

Source: [`frontend/app/screens/DashboardScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx):13-64 and [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):352-386

- `.dashboard-screen`
  - `min-height: 100%` at line 353
  - `place-content: center` at line 354
- `.dashboard-surface`
  - `width: min(100%, 980px)` at line 358
  - `display: grid` at line 359
  - `gap: 24px` at line 360
  - `margin: auto` at line 361
- `.dashboard-hero-block`
  - two-column grid at lines 364-368

Effect:
- The home screen tries to vertically center within a fully height-locked screen shell.
- Once content plus header plus action zone exceeds the fixed available height, there is no allowed overflow path.

### Settings / Debug / Conversation / Voice

- All use `ScreenScaffold`, so they inherit the same locked `screen-shell` and hidden overflow behavior.
- None of these screen classes declares a local scroll container.

### Exam family

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):1369-1372

- `.yki-flow-screen`
  - `overflow-y: auto`
  - `min-height: 100%`

Effect:
- YKI screens are the only family with an explicit descendant scroll allowance after the global scroll removal.

## Trace Conclusion

- The root chain is height-defined.
- The non-exam content chain is not just height-defined; it is clipped at every major level.
- Exam pages remain usable because `.yki-flow-screen` reintroduces vertical scrolling locally.
