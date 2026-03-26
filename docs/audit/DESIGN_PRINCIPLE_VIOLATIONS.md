# DESIGN_PRINCIPLE_VIOLATIONS

## Against `core_design_principle.md`

Source: [`docs/ui_design/core_design_principle.md`](/home/vitus/kielitaika/docs/ui_design/core_design_principle.md)

### Layout hierarchy violations

- The app does implement `BackgroundLayer`, `LogoOverlay`, `Sidebar`, and `ContentOutlet`, but the content outlet is not behaving as a healthy bounded layer.
- Home violates the “landing only” principle in spirit because it still carries a panel + meta-card structure instead of the minimal landing contract described at lines 203-212.

### Spacing system violations

- The document requires an 8px grid at lines 151-158.
- `global.css` currently uses many off-grid values: `10px`, `14px`, `18px`, `22px`, `26px`, `30px`, `34px`.

### Typography rhythm violations

- The document defines Inter as primary and Space Grotesk optional at lines 133-147.
- `global.css` still uses Georgia for headings at lines 137-143.

### Visual balance violations

- The document requires symmetry and consistent radii at lines 159-172.
- The active CSS mixes many radii and padding values, weakening balance.

## Against `updated_core_design_principle.md`

Source: [`docs/ui_design/updated_core_design_principle.md`](/home/vitus/kielitaika/docs/ui_design/updated_core_design_principle.md)

### Scroll and distortion violations

- The updated document says the root should lock viewport and content should be the only scrollable area at lines 21-49.
- The current system locks the viewport, but non-exam content is not scrollable anywhere.
- The updated document expects bounded content, not fully clipped content.

### Background / logo layer rules

- The updated document warns that background/logo should have zero layout impact at lines 17-19 and 32-39.
- In the current app, the visual layers are absolute and non-interactive, so this part is mostly respected.
- The primary violation is not the background itself; it is the content container chain.

### Tokenization violations

- The updated document calls for a predictable token system starting at line 119.
- `tokens.css` exists, but `global.css` still hardcodes the majority of spacing and radius values.

## High-Severity Principle Violations

1. Non-exam screens have no valid content overflow path.
2. The spacing system is not token-locked.
3. The typography system does not match the declared design contract.
4. Home is still structurally heavier than the target landing contract.
5. Mobile layout behavior changes by breakpoint through overflow exceptions rather than one consistent rule.
