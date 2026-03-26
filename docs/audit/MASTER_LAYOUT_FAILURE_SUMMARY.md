# MASTER_LAYOUT_FAILURE_SUMMARY

## Why content is being cut off

Content is being cut off because the app now locks overflow at every non-exam layout level:

- root: `html, body, #root`
- app frame: `.app-frame`
- shell frame: `.app-shell-frame`
- content outlet: `.main-content`
- route wrapper: `.route-stage`
- page scaffold: `.screen-shell`

The non-exam screens have no local scroll container after that change.

## Why removing scroll broke the app

Removing scroll did not fail because scroll was removed at the root.

It failed because:

- scroll was removed globally
- but the page layout was not converted into a true non-scrolling fit-to-viewport system
- the pages still render header + content + actions as vertically stacked blocks
- some screens still use centering and auto margins
- therefore overflow became clipping instead of reflow

## The single biggest architectural mistake

The single biggest architectural mistake is this:

- using `overflow: hidden` on the shared page container chain without introducing either:
  - a replacement non-exam scroll container, or
  - a guaranteed fit-to-viewport page composition model

In code, the most consequential rule is:

- [`frontend/app/theme/global.css:267`](/home/vitus/kielitaika/frontend/app/theme/global.css:267)
  `.main-content { overflow: hidden; }`

combined with:

- [`frontend/app/theme/global.css:283`](/home/vitus/kielitaika/frontend/app/theme/global.css:283)
- [`frontend/app/theme/global.css:295`](/home/vitus/kielitaika/frontend/app/theme/global.css:295)

## Top 5 issues causing misalignment

1. Triple-clipped non-exam content path: `.main-content` + `.route-stage` + `.screen-shell`
2. Mixed alignment strategies: centered home, top-aligned other screens, right-aligned action panels
3. Non-tokenized spacing and radius values throughout `global.css`
4. Fixed-height viewport boxes combined with large padding at multiple levels
5. Breakpoint-specific overflow inconsistency: `.app-shell { overflow: visible; }` on mobile

## Whether the layout system is salvageable

Answer: yes, it is salvageable.

Reason:

- The layout hierarchy itself is coherent:
  `App -> AppShell -> route-stage -> ScreenScaffold -> screen content`
- The failure is concentrated in height and overflow policy, not in a total absence of structure.
- The biggest problem is container behavior, not missing components.

## Final Diagnosis

This is not mainly a styling problem.

It is a container-system failure caused by:

- over-constrained height chains
- hidden overflow at shared layout levels
- missing shrink/scroll allowances in the page scaffold
- inconsistent breakpoint overflow rules
