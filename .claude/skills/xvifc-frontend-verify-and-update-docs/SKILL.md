---
name: xvifc-frontend-verify-and-update-docs
description: Use ONLY at the very end of a coding task in this repo (cityfinance-ng-ui-v2) whose changed files/folders are under src/app/features/xvi-fc-module — after all code changes are made, tests have been run and are verified passing, and immediately before writing the final summary of work to the user. Verifies the repo-root CLAUDE.md and README.md still accurately describe the src/app/features/xvi-fc-module area, updates the relevant sections if drifted, and creates either file at the repo root if missing. Do NOT use mid-task, between edits, speculatively, on every turn, or when the task's changes did not touch src/app/features/xvi-fc-module — this skill fires at most once per task, at the closing checkpoint only.
---

# Maintain Project Docs (Frontend)

## When this runs — the gate

Check all four before doing anything else. If any is false, stop and do not use this skill.

0. The files changed this task are under `src/app/features/xvi-fc-module/`. If no changed file is under that path, stop — do not use this skill, even if the other conditions below are true.
1. All code changes for the current task are finished (no more edits planned this turn).
2. Tests relevant to the change were run and are passing (`npm run test`, or `npx ng test --include='<file>'` for a targeted file). A task with no test coverage to run still requires an explicit statement of why (e.g. docs-only or styling-only change).
3. This is the last step before delivering the final summary to the user.

Never run this once-per-file-edit or "just in case." One pass, at the end, per task.

## Step 1 — Verify CLAUDE.md

Root: `CLAUDE.md`. If missing, create it using the structure below. If present, only touch the parts describing `src/app/features/xvi-fc-module` — everything else (CFR, OCR, AFS Dashboard, auth flows, other feature areas, etc.) is out of scope for this skill even if it looks stale; leave it untouched.

In scope within CLAUDE.md:

- The **XVI FC** bullet under *Key Feature Areas* — keep its description of the mohua/state/ulb split accurate.
- The **Module Layout** tree, only if a top-level folder was added/removed directly under `src/app/features/xvi-fc-module/` itself (not for changes inside an existing sub-module).
- Any mention elsewhere in the doc of xvi-fc-module-specific shared infrastructure (e.g. the dynamic form, if a change this task made is xvi-fc-module-specific).

Update triggers (only these — not general prose polish):

- A sub-module, route, or top-level folder was added/removed under `src/app/features/xvi-fc-module/`.
- The "XVI FC" description in *Key Feature Areas* no longer matches the mohua/state/ulb split (e.g. a sub-area was renamed or restructured).
- A shared piece specific to xvi-fc-module (`dynamic-form-visibility.service.ts`, `xvi-fc-side-menu.*`, `xvi-fc-module.routes.ts`) changed in a way that changes what CLAUDE.md documents about it.

If nothing in the above changed this task, leave CLAUDE.md untouched — say so, don't touch the file for the sake of touching it.

## Step 2 — Verify README.md

Root: `README.md`. If missing, create it. If present, keep it in sync with reality, not with CLAUDE.md — README is for humans setting up the project (install, run, test, build, high-level description); CLAUDE.md is for Claude Code (commands + architecture reference). Don't duplicate CLAUDE.md's architecture deep-dive into README; a short "what this project is" plus setup/run/test/build steps is enough.

Update only if this task's xvi-fc-module changes affected root-level install/setup steps, how to run the dev server, how to run tests, how to build, or the project's one-line description — e.g. a new npm script scoped to xvi-fc-module. The current README.md is generic Angular-CLI boilerplate with no feature-specific content, so most xvi-fc-module-only tasks will correctly leave it untouched — say so, don't touch it for the sake of touching it.

## Step 3 — Report, then summarize

State plainly what was checked and what (if anything) changed in each file — one or two lines, not a diff dump — then proceed to the task's final summary as normal.
