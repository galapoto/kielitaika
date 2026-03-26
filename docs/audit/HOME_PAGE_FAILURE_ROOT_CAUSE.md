# HOME_PAGE_FAILURE_ROOT_CAUSE

## Root Cause

The home page is cut off because the non-exam page stack is now clipped by three nested overflow-hidden containers after scroll was removed globally.

## Exact Failure Origin

Primary origin:

- [`frontend/app/theme/global.css:267`](/home/vitus/kielitaika/frontend/app/theme/global.css:267)
  - `.main-content { overflow: hidden; }`

Critical compounding rules:

- [`frontend/app/theme/global.css:283`](/home/vitus/kielitaika/frontend/app/theme/global.css:283)
  - `.route-stage { overflow: hidden; }`
- [`frontend/app/theme/global.css:295`](/home/vitus/kielitaika/frontend/app/theme/global.css:295)
  - `.screen-shell { overflow: hidden; }`
- [`frontend/app/theme/global.css:289`](/home/vitus/kielitaika/frontend/app/theme/global.css:289)
  - `.screen-shell { height: 100%; }`

## Component Chain

Rendered chain:

1. [`frontend/app/App.tsx:172-185`](/home/vitus/kielitaika/frontend/app/App.tsx:172)
   `AppShell` renders `<main className="main-content">`
2. [`frontend/app/App.tsx:182-184`](/home/vitus/kielitaika/frontend/app/App.tsx:182)
   `route-stage`
3. [`frontend/app/components/ScreenScaffold.tsx:5-8`](/home/vitus/kielitaika/frontend/app/components/ScreenScaffold.tsx:5)
   `screen-shell`
4. [`frontend/app/screens/DashboardScreen.tsx:13-64`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx:13)
   Home header + panel + action zone

## Why Home Fails First

Home is especially sensitive because:

- it still renders:
  - a header
  - a main panel
  - a multi-card meta area
  - a bottom action zone
- the scaffold pushes the action zone down with `margin-top: auto` at [`frontend/app/theme/global.css:319-323`](/home/vitus/kielitaika/frontend/app/theme/global.css:319)
- the home screen also tries to center its content:
  - `.dashboard-screen { place-content: center; }` at [`frontend/app/theme/global.css:352-355`](/home/vitus/kielitaika/frontend/app/theme/global.css:352)
  - `.dashboard-surface { margin: auto; }` at [`frontend/app/theme/global.css:357-361`](/home/vitus/kielitaika/frontend/app/theme/global.css:357)

That means:

- the screen is asked to fit into a fixed-height shell
- the content is not allowed to scroll
- the content is also not aligned purely to the top
- therefore the bottom portion is clipped instead of reflowing

## Why Removing Scroll Broke The Home Page

Before the change, `.main-content` was the likely shared overflow path.

After the change:

- root scroll is disabled
- shell scroll is disabled
- route scroll is disabled
- screen scroll is disabled

The home page has no replacement overflow container.

## Surgical Diagnosis

If a single line must be named as the origin, it is:

- [`frontend/app/theme/global.css:267`](/home/vitus/kielitaika/frontend/app/theme/global.css:267)

because that rule removed the last shared content scroll path for every non-exam page.

But the failure is only fully expressed because it combines with:

- [`frontend/app/theme/global.css:283`](/home/vitus/kielitaika/frontend/app/theme/global.css:283)
- [`frontend/app/theme/global.css:295`](/home/vitus/kielitaika/frontend/app/theme/global.css:295)
- [`frontend/app/theme/global.css:289`](/home/vitus/kielitaika/frontend/app/theme/global.css:289)
