# FORENSIC DISCOVERY REPORT — KieliTaika Project

**Role:** Forensic Discovery Agent (read-only). No fixes, restores, or modifications.

---

## A. SEARCH LOCATIONS CHECKED

### 1. Git working tree
- `/home/vitus-idi/Documents/puhis` (current repo root)
- `git branch -a`, `git log -5`, `git status -u`, `git check-ignore`, `.gitignore`

### 2. Git history & reflog
- `git reflog -30`, `git log --all --oneline -20`
- `git stash list`, `git fsck --lost-found`

### 3. Cursor / Codex internal state
- `/home/vitus-idi/.cursor/` (ai-tracking, extensions, projects, worktrees)
- `/home/vitus-idi/.cursor/worktrees/puhis/` (cpf, jkx, ryr, ukb)
- `/home/vitus-idi/.cursor/projects/home-vitus-idi-Documents-puhis/`
- `/home/vitus-idi/.config/Cursor/` (Backups, User, logs)
- `/home/vitus-idi/.config/Code/` (CachedData, logs — VS Code)
- `~/Documents/*cursor*`, `*codex*`, `*dump*` (via find)

### 4. Filesystem-wide (home scope)
- `/home/vitus-idi/Documents/kielitaika-dump`
- `/home/vitus-idi/Documents/kielitaika-dump/cursor-worktrees/` (ajf, cpf, jkx, rmh, ryr, ukb, uwn)
- `/home/vitus-idi/Documents/state_of_biuld_before_transfer/backup/puhis`
- `/home/vitus-idi/Documents/projects/project_file/Taika_restructuring`
- `/home/vitus-idi/Documents/puhis`, `/home/vitus-idi/Documents/Todiscope-v2-Engine/.git/cursor`

### 5. Build & tooling artifacts
- `/home/vitus-idi/Documents/puhis/frontend/.expo/`
- `/home/vitus-idi/Documents/puhis/frontend/node_modules/.cache` (absent)
- `/home/vitus-idi/Documents/puhis/frontend/android/app/build`
- `/home/vitus-idi/Documents/puhis/frontend/android/.gradle`

### 6. External deployment
- `frontend/android/app/build.gradle` (versionCode 1, versionName "0.0.0")
- Google Play Console artifact metadata: **not accessible**

---

## B. POSITIVE FINDINGS

1. **Project trees outside Git with files not in repo**
   - **`/home/vitus-idi/Documents/kielitaika-dump`** (Cursor dump):
     - **`cursor-worktrees/rmh`**: Full backend + frontend. Contains **`frontend/app/services/ykiExamModeService.js`** — **not present in current Git repo.**
     - **ykiExamModeService.js**: "Manages locked UI, **timer**, and exam-like environment for YKI tests." Implements:
       - `this.timers = new Map()`, start/stop/resume timers per task
       - `task.time_limit` (seconds or minutes), "Time Up" handling
       - EXAM_MODE_STATES (IDLE, PREPARING, IN_PROGRESS, PAUSED, COMPLETED, SUBMITTED)
       - Persist state to AsyncStorage, timer update callbacks
     - rmh also has **extra backend YKI services** not in repo: `yki_training_service`, `yki_listening_service`, `yki_reading_service`, `yki_rubric_aligned_engine`, `yki_placement`, `yki_skill_labs`, `yki_error_handler`, etc.
     - rmh has `workplaceTestUtils.js` with `time_limit_seconds`; many frontend services (e.g. learningPathService, certificationService) that may or may not exist in repo.

2. **Evidence of Cursor/Codex operating on a tree not fully committed**
   - Reflog shows multiple **"Restore ... from Cursor dump"** commits (ykiErrorService, analyticsService, searchService, offlineSyncService, etc.). The **dump** is `kielitaika-dump` (and/or `~/.cursor/worktrees/puhis`).
   - **ykiExamModeService** was **never** restored; it exists in dump rmh but not in repo.
   - Cursor worktrees exist for puhis (`.cursor/worktrees/puhis/`, `kielitaika-dump/cursor-worktrees/`). Dump rmh contains logic (YKI timing service, extra YKI backend) that diverges from Git.

3. **Divergence: YKI timing**
   - The **YKI test timing modification** (centralized timer service) exists in **kielitaika-dump/cursor-worktrees/rmh** as **ykiExamModeService.js** and is **absent** from the current repo.

---

## C. NEGATIVE FINDINGS

1. **Timestamps: no newer version outside Git**
   - **kielitaika-dump/rmh**: yki_exam_service, yki router ~ **2024-12-19** (Unix 1766098635). Frontend ~ same date.
   - **Current puhis**: package.json, YKIWritingExamScreen ~ **2026-01-22** (1769108320).
   - **state_of_biuld_before_transfer/backup/puhis**: package.json **older** than current (1769083422 < 1769108320).
   - **Conclusion:** The dump and backup are **older** than the current repo. There is **no** evidence of a **newer** uncommitted or external version.

2. **No lost commits or overwritten branches**
   - Reflog is linear (no rebases, force resets, or detached HEAD in recent history).
   - `git fsck --lost-found` produced no relevant output.
   - Branches: `main`, `recovery/frontend-cursor-rmh` (current). No orphaned or unmerged branches noted.

3. **Backup vs current**
   - `diff` on **YKIWritingExamScreen.js** (current vs `state_of_biuld_before_transfer/backup/puhis`): **identical** (exit 0, no diff).

4. **Build artifacts**
   - `.expo/`, `android/app/build`, `android/.gradle` exist. **Not** inspected for app source (typically generated output). **No** evidence that they contain app logic not in Git.

5. **Cursor Backups**
   - `.config/Cursor/Backups/0166890aba79b367c023965cb7e5d6e9/file/*`: **Java** source (likely Android/tooling). **No** puhis frontend or YKI screens.

6. **Google Play**
   - **versionCode 1**, **versionName "0.0.0"** in `build.gradle`. No access to Play Console; **cannot** determine if Play build is newer than repo.

---

## D. CONFIDENCE LEVEL

**MEDIUM: Possible partial divergence.**

- **No newer source:** Dump and backup are **older** than the repo. We are **not** missing a **newer** uncommitted version.
- **Partial divergence:** The **dump** (rmh) contains **logic not in Git** (ykiExamModeService, extra YKI backend, etc.). The repo has been incrementally restored from the dump; **ykiExamModeService** and possibly other YKI/timing-related pieces were **not** restored.

---

## E. RECOMMENDATION

**Restore from discovered source (specify):**

- **Source:** `/home/vitus-idi/Documents/kielitaika-dump/cursor-worktrees/rmh`
- **Relevant asset:** `frontend/app/services/ykiExamModeService.js` (YKI exam-mode and **timer** management). Assess also `workplaceTestUtils.js` (`time_limit_seconds`), and any other rmh YKI/frontend services you care about.
- **Note:** rmh is **older** than the current repo. Restoring implies **merging** or **porting** logic into the current codebase, not overwriting it with an older snapshot. Validate imports, dependencies, and usage (e.g. YKI screens) after restore.

**Alternative:** **Halt and request manual intervention** — e.g. to decide exactly what to restore from rmh vs. keep from current repo, and to run tests.

---

**END OF REPORT.**

**No fixes, restores, or further action taken. Authority ends at truth discovery.**
