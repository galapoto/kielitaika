# Android Automation Surface Validation

Date: 2026-04-04
Repository: `/home/vitus/kielitaika-app`
Prompt: `docs/prompts/android_automation_surface_validation_+_patch.md`
Device: `SM02E4060333233`
Backend: `http://127.0.0.1:8002`
Expo URL used for live validation: `exp://192.168.100.41:8082/--/`
Session: `040e8af2-31c9-4792-a0b6-159e334f5517`

## Objective

Make the Android automation surface for the governed YKI UI discoverable, uniquely identifiable, and tappable through the Android accessibility tree.

## Pre-patch failure

Previous live Android execution had already proven the blocker:

- `docs/audit/final_automated_android_execution_report.md` recorded a real device failure at the first governed reading transition.
- The runner failed with `UI node not found: Next`.
- A live `uiautomator dump` from the reading passage screen showed passage content but no visible forward action control in the accessibility tree.

## Patch summary

Changed UI surface:

- `packages/ui/primitives/ScreenContainer.tsx`
  - added `actionsPosition` so actions can render ahead of long scroll content
  - kept the action zone above the content with explicit stacking
- `packages/ui/screens/YkiExamScreen.tsx`
  - moved YKI exam actions to the top interaction layer with `actionsPosition="top"`
  - added stable Android automation labels and `testID`s for:
    - `yki-next-button`
    - `yki-submit-button`
    - `yki-play-audio`
    - `yki-pause-audio`
    - `yki-record-start`
    - `yki-record-stop`
- `packages/ui/screens/HomeScreen.tsx`
  - added stable Android automation label and `testID` for `yki-start-button`

Validation support and runtime unblock:

- `tools/yki_next_button_probe.py`
  - added a minimal Android probe that launches Expo Go, waits for `yki-next-button`, taps it, and confirms the governed session advances
  - hardened XML parsing so `uiautomator dump /dev/tty` trailing text does not break parsing
- `apps/client/index.js`
  - added an Expo entry shim to `expo-router/entry`
  - this fixed the live Metro failure where Expo Go stayed on a spinner because Metro was trying to resolve missing `./index`
- `apps/client/features/yki-exam/hooks/useYkiExam.ts`
  - reduced session polling frequency to `15000 ms`
- `apps/client/state/YkiExamRoute.tsx`
  - reduced countdown refresh pressure to `10000 ms`

The polling/countdown throttling was needed because aggressive UI churn was making `uiautomator dump` frequently fail to obtain a stable tree.

## Live UI dump proof

After the patch and Expo entrypoint fix, a live device dump from the governed reading passage screen included this node:

```xml
<node
  resource-id="yki-next-button"
  class="android.widget.Button"
  content-desc="yki-next-button"
  clickable="true"
  enabled="true"
  bounds="[48,333][1152,477]">
  <node text="Next" class="android.widget.TextView" />
</node>
```

Observed screen context in the same dump:

- view kind: reading passage
- countdown visible
- navigation state visible as `Forward only`
- reading passage content visible below the action area

This confirms the button is now:

- present in the Android hierarchy
- uniquely identifiable by stable label
- exposed as `android.widget.Button`
- clickable on-device

## Automation probe result

Command run:

```bash
python3 tools/yki_next_button_probe.py \
  --backend-base-url http://127.0.0.1:8002 \
  --app-url exp://192.168.100.41:8082/--/ \
  --device-id SM02E4060333233
```

Probe result:

```json
{
  "status": "PASS",
  "before_view_key": "reading_passage",
  "after_view_key": "reading:542f70a1-e116-5076-9ac1-bcf3846e2c2a_0",
  "session_id": "040e8af2-31c9-4792-a0b6-159e334f5517"
}
```

Interpretation:

- the probe found `yki-next-button`
- the button was tappable
- the governed session advanced from `reading_passage` to the next reading view after the tap

## Target element status

Live Android dump and tap proof completed for:

- `yki-next-button`

Code-level automation labels and IDs were added for:

- `yki-start-button`
- `yki-submit-button`
- `yki-play-audio`
- `yki-pause-audio`
- `yki-record-start`
- `yki-record-stop`

This prompt’s hard completion criterion was specifically satisfied by the live proof for `yki-next-button`.

## Final verdict

PASS

Completion criterion met:

- `yki-next-button` is detectable in the Android UI hierarchy
- `yki-next-button` is tappable via automation
- the tap advances the real governed YKI session on-device
