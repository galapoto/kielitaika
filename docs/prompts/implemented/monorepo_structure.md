# Monorepo Structure

```text
/home/vitus/kielitaika-app
├── apps
│   └── client
│       ├── app
│       │   ├── _layout.tsx
│       │   └── index.tsx
│       ├── App.tsx
│       ├── app.json
│       ├── package.json
│       └── tsconfig.json
├── backend
├── docs
│   └── project_plans
│       └── monorepo_structure.md
└── packages
    ├── core
    │   ├── config
    │   ├── models
    │   └── services
    └── ui
        ├── components
        ├── screens
        └── theme
```

- No legacy code was copied from `/home/vitus/kielitaika` or `/home/vitus/Documents/puhis/`.
- Expo was initialized in `/home/vitus/kielitaika-app/apps/client` using the blank TypeScript template and then reduced to the requested minimal structure.
- The client app runs successfully on web from the Expo dev server with a blank screen and no import errors.

## Core Infrastructure Layer

- `packages/core/config/env.ts`
- `packages/core/services/apiClient.ts`
- `packages/core/models/apiTypes.ts`
- `packages/core/services/ykiService.ts`
- `packages/core/validate_no_direct_fetch.js`
- Contract enforcement is implemented in `apiClient.ts` by validating `ok` and parsing error payloads before returning `data`.
- The validation script enforces no direct `fetch()` usage across project code outside `apiClient.ts`.

## Platform Utilities Layer

- `packages/core/services/storageService.ts`
- `packages/core/audio/audioManager.ts`
- `packages/core/utils/timerSafe.ts`
- Constraints enforced: no `localStorage`, no browser APIs, and no direct `Audio.Sound.createAsync` usage outside `audioManager.ts`.
