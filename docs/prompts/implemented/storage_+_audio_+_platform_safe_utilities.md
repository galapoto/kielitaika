# AGENT ROLE

You are a platform-stability agent.

Your task is to implement **mobile-safe system utilities**.

You are NOT allowed to:

* implement UI
* modify API logic
* introduce business logic
* skip cleanup handling

---

# CONTEXT

Project root:
/home/vitus/kielitaika-app

Core package:
/home/vitus/kielitaika-app/packages/core

---

# OBJECTIVE

Create platform-safe utilities:

✔ storage abstraction (AsyncStorage)
✔ audio manager (safe playback)
✔ timer-safe patterns
✔ no browser APIs

---

# HARD RULES

1. NO localStorage usage anywhere
2. NO direct Audio.Sound usage outside audioManager
3. ALL async resources must clean up
4. MUST work on Android

---

# STEP 1 — INSTALL STORAGE

---

Run inside apps/client:

npx expo install @react-native-async-storage/async-storage

---

# STEP 2 — STORAGE SERVICE

---

## CREATE FILE

packages/core/services/storageService.ts

---

## IMPLEMENT

import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageService = {
async set(key: string, value: any) {
await AsyncStorage.setItem(key, JSON.stringify(value));
},

async get(key: string) {
const value = await AsyncStorage.getItem(key);
return value ? JSON.parse(value) : null;
},

async remove(key: string) {
await AsyncStorage.removeItem(key);
}
};

---

# STEP 3 — VERIFY NO localStorage

---

## SEARCH PROJECT FOR:

localStorage

---

## REQUIREMENT

ZERO occurrences.

If found → remove or replace.

---

# STEP 4 — INSTALL AUDIO

---

Run:

npx expo install expo-av

---

# STEP 5 — AUDIO MANAGER

---

## CREATE FILE

packages/core/audio/audioManager.ts

---

## IMPLEMENT

import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

export const audioManager = {
async play(uri: string) {
try {
if (currentSound) {
await currentSound.unloadAsync();
}

```
  const { sound } = await Audio.Sound.createAsync({ uri });

  currentSound = sound;

  await sound.playAsync();
} catch (error) {
  console.error("Audio play error", error);
}
```

},

async stop() {
if (currentSound) {
await currentSound.stopAsync();
await currentSound.unloadAsync();
currentSound = null;
}
}
};

---

# STEP 6 — ENFORCE AUDIO RULE

---

## SEARCH FOR:

Audio.Sound.createAsync

---

## REQUIREMENT

Must ONLY exist inside:

audioManager.ts

If found elsewhere → remove.

---

# STEP 7 — TIMER SAFETY UTILITY

---

## CREATE FILE

packages/core/utils/timerSafe.ts

---

## IMPLEMENT

export function createSafeInterval(fn: () => void, ms: number) {
const id = setInterval(fn, ms);

return () => clearInterval(id);
}

---

# STEP 8 — PLATFORM GUARD CHECK

---

## SEARCH FOR:

window
document

---

## REQUIREMENT

ZERO occurrences.

---

# STEP 9 — DOCUMENT

---

UPDATE:

docs/project_plans/monorepo_structure.md

ADD:

"Platform Utilities Layer"

Include:

* storageService
* audioManager
* timerSafe
* constraints enforced

---

# VALIDATION CHECKLIST

✔ AsyncStorage installed
✔ storageService works
✔ no localStorage usage
✔ audioManager implemented
✔ no direct Audio usage elsewhere
✔ no browser APIs
✔ timer utility exists

---

# OUTPUT FORMAT

1. Files created
2. Folder tree (new additions only)
3. Validation results
4. Errors encountered
5. Success/failure

NO explanation.

---

# FAILURE CONDITIONS

* localStorage exists anywhere
* Audio used outside manager
* missing cleanup logic
* incorrect file paths

---

# SUCCESS CONDITION

A platform-safe foundation that prevents mobile-specific failures.

---

END OF AGENT TASK
