# SCROLL_BEHAVIOR_REPORT

## Intended Rule

- Main app: no scroll
- Exam sections: scroll only inside exam content

## Where Scroll Is Currently Defined

### Root-level scroll removal

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):5-10

- `html, body, #root { overflow: hidden; }`

### App-level clipping

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):24-29, 77-83, 86-99

- `.app-frame { overflow: hidden; }`
- `.app-shell-frame { overflow: hidden; }`
- `.app-shell { overflow: hidden; }` on desktop

### Main content clipping

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):261-268, 277-295

- `.main-content { overflow: hidden; }`
- `.route-stage { overflow: hidden; }`
- `.screen-shell { overflow: hidden; }`

### Local scroll allowance

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):1369-1372

- `.yki-flow-screen { overflow-y: auto; }`

### Remaining ad hoc local scroll

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):1341-1351

- `.json-preview { overflow: auto; }`
- This is isolated to preformatted debug/error payloads, not page layout.

## Where Scroll Was Removed

The main removal occurred in the layout CSS, not screen components:

- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):267
  - `.main-content { overflow: hidden; }`
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):283
  - `.route-stage { overflow: hidden; }`
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):295
  - `.screen-shell { overflow: hidden; }`

These three rules removed the last general-purpose scroll path for all non-YKI screens.

## Where Overflow Is Set To Hidden

- Root:
  - `html, body, #root`
  - `.app-frame`
  - `.app-shell-frame`
- Content path:
  - `.main-content`
  - `.route-stage`
  - `.screen-shell`
- Various components:
  - `.panel`
  - `.practice-progress-bar`

## Where It Should Be Auto But Isn’t

- `.main-content`
  - This is the natural shared scroll container candidate for non-exam pages, but it is fully hidden.
- `.screen-shell`
  - It owns page composition for home/settings/debug/conversation/voice, but it cannot scroll.
- `.dashboard-screen`
  - It has no local scroll or shrink strategy and is fully dependent on the blocked parent chain.

## Containers Clipping Children

Primary clipping sequence:

1. [`frontend/app/theme/global.css:267`](/home/vitus/kielitaika/frontend/app/theme/global.css:267)
   `.main-content { overflow: hidden; }`
2. [`frontend/app/theme/global.css:283`](/home/vitus/kielitaika/frontend/app/theme/global.css:283)
   `.route-stage { overflow: hidden; }`
3. [`frontend/app/theme/global.css:295`](/home/vitus/kielitaika/frontend/app/theme/global.css:295)
   `.screen-shell { overflow: hidden; }`

That is the direct clipping stack for home/navigation pages.

## Missing `min-height: 0`

Present:

- `.main-content` has `min-height: 0` at line 265

Missing where it matters:

- `.route-stage`
- `.screen-shell`
- `.screen-content-zone`
- `.screen-action-zone`

Why it matters:
- Flex/grid children with height-constrained parents often require `min-height: 0` to allow internal shrinking or internal scroll.
- The current chain locks height but does not provide consistent shrinkability below `.main-content`.

## Incorrect `100vh` / viewport usage

- `.app-frame { height: 100vh; }`
- `.app-shell-frame { height: 100vh; }`
- `.app-shell { min-height: min(900px, calc(100vh - 32px)); }`

This creates a rigid viewport-bound stack with padding subtraction, which is fine only if a descendant scroll container exists. On non-exam pages it does not.

## Scroll Diagnosis

Why removing scroll broke layout:

- Scroll was removed globally.
- No replacement scroll or reflow mechanism was introduced for non-exam screens.
- The app now depends on every non-exam page fitting into one exact viewport box, but many pages still use multi-card vertical composition.
