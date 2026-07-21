---
name: xvifc-frontend-scope-a-feature
description: Use whenever the user says something like "I want to add a feature" or otherwise proposes new frontend functionality that lives under src/app/features/xvi-fc-module (the module root, or its mohua-module/state-module/ulb-module sub-areas) in this Angular app, before any code is written. Runs a short scoping conversation — clarifying questions, edge cases, adjacent-feature ideas — and gets explicit approval on a restated plan before implementation begins. Do not use for bug fixes, small tweaks, when the user has already given a fully-specified spec and asked you to just build it, or when the proposed feature is outside src/app/features/xvi-fc-module.
---

# Scope a Feature

## Step 0 — scope gate

Confirm the proposed feature belongs under `src/app/features/xvi-fc-module/` (the module root, or its `mohua-module`, `state-module`, `ulb-module` sub-areas). If it doesn't, skip this skill entirely and proceed normally — no scoping conversation.

Do not write or edit code until Step 4 is complete.

1. **Ask sharp clarifying questions** — enough to remove real ambiguity, not a checklist for its own sake. Cover at minimum: which xvi-fc-module sub-area it belongs to (`mohua-module`, `state-module`, `ulb-module`, or module-root/shared-across-submodules), what state/data it needs (new service + `BehaviorSubject`, or existing one), UI states (loading, empty, error, permission-denied), responsive/mobile behavior, and role/route-guard requirements. Ask as one batch, not one at a time.
2. **Suggest adjacent ideas** — 2–4 concrete extensions or related features the user might also want, grounded in what already exists in this codebase (e.g. "since this is a new state-module form, want the standard `form-progress` status stepper and `page-error-state` wired in too?"). Offer, don't push.
3. **Wait for answers.** Don't proceed on assumptions for anything asked in Step 1.
4. **Restate the plan in one paragraph** — what will be built, which components/services/routes are touched, and what was explicitly deferred or declined. Ask for approval.
5. **Only after explicit approval**, start implementation.

Keep the whole exchange tight — this is a scoping gate, not an interview marathon.
