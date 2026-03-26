# Phase 6.3 Layout Fix

## What Was Wrong In DOM Structure

The practice screen still rendered two major blocks in the same page flow:

- the intro panel stayed mounted
- the runtime rendered below it

That caused the runtime card to lose dominance because the DOM hierarchy still behaved like a stacked document instead of a focused screen.

## What Caused Stacking Behavior

The main cause was in [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx):

- `practice-intro-card` rendered unconditionally
- runtime content lived in a separate block below it

The result was:

- intro remained visible while runtime was active
- the card was pushed down instead of centered
- mobile felt like a long page, not an app screen

## How Card Dominance Was Restored

The runtime DOM is now split into mutually exclusive branches:

- intro only renders when `!runtime`
- runtime only renders when `runtime`

The active runtime branch now starts with:

- `practice-screen`
- `practice-runtime-root`
- `practice-card-stage`
- `practice-card-wrapper`

This restores one dominant runtime object instead of multiple stacked sections.

## How Background System Was Fixed

Inline background styles were removed from [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx).

The app frame now uses:

- `className={\`app-frame ${getBackgroundClass(backgroundScreen, colorScheme)}\`}`

Background classes are now generated and resolved centrally from [`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts), including:

- screen-to-background mapping
- decorative restriction handling
- screen-specific class names

This means screen backgrounds are now applied through a class system instead of inline `style={...}`.

## What CSS Rules Were Blocking Layout

The blocking layout issues were:

- `html`, `body`, and `#root` only used `min-height`, not fixed height
- `.route-stage` did not behave as a height-owning flex container
- practice runtime used a stacked grid wrapper instead of a centering root
- `.app-frame::before` still carried global background decoration behavior

The fix added or corrected:

- `html, body, #root { height: 100%; }`
- `.app-shell { max-width: 1360px; margin: 0 auto; height: 100%; }`
- `.route-stage { height: 100%; display: flex; flex-direction: column; }`
- `.practice-runtime-root` as the centering container
- `.practice-card-stage` as the centered column stage
- `.app-frame::before { background: none; }`

## Files Modified

- [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)
- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
- [`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts)
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)
- [`frontend/app/system/ui_violation_detector.ts`](/home/vitus/kielitaika/frontend/app/system/ui_violation_detector.ts)

## Verification

- `PATH=./scripts:$PATH ts-node app/system/ui_violation_detector.ts` passed
- `npm run build` passed in `/home/vitus/kielitaika/frontend`

## Notes

A temporary debug outline was added to `.practice-card-wrapper` as requested by the phase brief:

- `outline: 2px solid red;`

That remains in place so the centered card boundary is visibly testable during manual review.
