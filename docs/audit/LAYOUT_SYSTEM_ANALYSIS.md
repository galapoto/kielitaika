# LAYOUT_SYSTEM_ANALYSIS

## AppShell / Main Layout

### `.app-shell`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):86-99

- Uses grid correctly for sidebar + content.
- Problem: `height: 100%` and `overflow: hidden` make it a hard clipping box.
- On mobile, `overflow: visible` at line 1563 breaks consistency rather than solving layout.

### `.main-content`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):261-268

- Grid container
- `align-content: start`
- `min-height: 0`
- `overflow: hidden`

Assessment:
- `min-height: 0` is correct.
- `overflow: hidden` removes the only general-purpose escape for tall non-exam content.

## Route / Page Layer

### `.route-stage`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):277-285

- `display: flex`
- `flex-direction: column`
- `height: 100%`
- `min-height: 100%`
- `overflow: hidden`

Assessment:
- This is a non-growing fixed-height flex column.
- It does not expose scroll and does not explicitly allow its children to shrink via `min-height: 0`.

### `.screen-shell`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):287-296

- `display: flex`
- `flex-direction: column`
- `height: 100%`
- `min-height: 100%`
- `gap: 24px`
- `overflow: hidden`

Assessment:
- This is the key reusable page container.
- It forces every page into the same fixed-height column.
- It combines:
  - fixed height
  - column stacking
  - hidden overflow
- That combination is what breaks non-exam pages after scroll removal.

## Internal Scaffold Zones

### `.screen-content-zone`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):308-316

- `display: grid`
- `gap: 24px`
- `align-content: start`

Assessment:
- No `flex: 1`
- No `min-height: 0`
- No local scroll
- It cannot absorb or scroll overflow inside a fixed-height shell.

### `.screen-action-zone`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):319-332

- `margin-top: auto`
- `display: grid`

Assessment:
- `margin-top: auto` pushes the action zone to the bottom of the fixed-height screen.
- On shorter viewports, this increases the risk that body content is squeezed upward and clipped.

## Home Screen Layout

### `DashboardScreen`

Source: [`frontend/app/screens/DashboardScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx):13-64

- Header zone
- Panel content zone
- Action zone

Associated CSS:

- `.dashboard-screen { min-height: 100%; place-content: center; }` at lines 352-355
- `.dashboard-surface { margin: auto; }` at line 361

Assessment:
- The home page uses centering behavior inside a fixed-height parent.
- It is not flex-growing; it is being centered and auto-margined within a clipped shell.

## Flex / Grid Failure Summary

Top issues:

1. `screen-shell` is fixed-height and hidden-overflow instead of being a flexible page container.
2. `screen-content-zone` does not grow or scroll.
3. `screen-action-zone` uses `margin-top: auto`, which is valid in a healthy flex column but harmful inside a fully clipped viewport box.
4. Home uses centering (`place-content: center`, `margin: auto`) inside a layout that no longer tolerates overflow.
5. Mobile changes `.app-shell` overflow behavior but does not resolve the underlying chain.
