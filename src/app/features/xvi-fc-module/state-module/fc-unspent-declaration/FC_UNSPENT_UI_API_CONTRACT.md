# FC Unspent Declaration — UI-to-API Contract

Status: **Wired to a real backend.** `FcUnspentDeclarationService` (`fc-unspent-declaration.service.ts`)
calls the live `xvi-fc/state/fc-unspent-declaration/...` endpoints via `HttpClient` — GET preview,
GET `ulb-options` (searched/paginated), `save-draft`, and `final-submit`. `fc-unspent-declaration.mock.ts`
/ `.mock-scenarios.ts` remain as component-spec fixtures only; they are never imported by the real
service or the runtime component.

All types referenced here live in `fc-unspent-declaration.models.ts`.

## 1. GET preview response — `FcUnspentDeclarationData`

`FcUnspentDeclarationService.getPreview(stateId, yearId)` — TODO route:
`GET xvi-fc/state/fc-unspent-declaration/${stateId}/${yearId}`.

Deliberately **excludes `ulbOptions`** — see §3.

```jsonc
{
  "stateName": "Sample State",
  "applicableFc": "14TH_FC",
  "threshold": 10,
  "currentFormStatus": 2, // FORM_STATUS.IN_PROGRESS — always the numeric FORM_STATUS value, never a raw label string
  "permissions": {
    "canView": true,
    "canEdit": true,
    "canSaveDraft": true,
    "canFinalSubmit": true
  },
  "dependency": {
    "devolutionStatus": 5, // FORM_STATUS.UNDER_REVIEW_BY_MOHUA, or null if no Devolution submission exists yet
    "devolutionDatasetExists": true,
    "editableDueToDevolutionReturn": false,
    "blockingMessage": null
  },
  "actors": [{ "action": "Created by", "designation": "State DMA Officer", "by": "user@example.com", "date": "2026-07-13T13:06:49.890Z" }],
  "questions": [ /* ConditionalFieldConfig[] — unchanged, existing dynamic-form shape */ ],
  "unspentUlbData": [
    {
      "slNo": 1,
      "ulbId": "66a000000000000000000001",
      "censusCode": "800123",
      "sbCode": null,
      "ulbName": "Sample Municipal Corporation",
      "allocationAmount": 20,
      "unspentAmount": 1.5,
      "allocationPerc": 7.5,
      "eligibility": true
    }
  ]
}
```

Envelope: `{ success: boolean, message: string, data: <above> }` — matches
`SfcStatusApiResponse`/`XviFcApiResponse<T>`'s pattern of `{success, data}`; `message` is kept since
`SfcStatusApiResponse` includes it (`XviFcApiResponse<T>` in devolution-formula does not — see
§7 CONTRACT DECISION REQUIRED #6 for the `timestamp` field, which is also absent).

## 2. Permission meanings (`FcUnspentPermissions`) — authoritative, never re-derived by the UI

| Field | Meaning |
|---|---|
| `canView` | State may view this page at all. |
| `canEdit` | Form fields and the ULB table are interactive. |
| `canSaveDraft` | The "Save" button is enabled. **New gate** — sfc-status/devolution-formula have no equivalent; see §7 #1. |
| `canFinalSubmit` | The "Final Submit" button renders and is enabled. |

The component (`fc-unspent-declaration.component.ts`) reads these four booleans directly for every
gating decision (`[disabled]` bindings, whether the Final Submit button renders at all). It never
inspects `currentFormStatus` or `dependency` to compute a gate — those are backend-owned and must
already be folded into `permissions` by the time the response reaches the UI.

## 3. Lazy ULB-options — `FcUnspentUlbOption[]`

`FcUnspentDeclarationService.getUlbOptions(stateId, yearId, query)` —
`GET xvi-fc/state/fc-unspent-declaration/${stateId}/${yearId}/ulb-options`.

**Only ever called by `UlbPickerDialogComponent`** (`components/ulb-picker-dialog/`), a self-contained,
backend-searched/paginated, **multi-select** `MatDialog` opened from "Add ULB" or a row's "Change
selected ULB" button — never on page load, never for a No-branch session, never for a read-only view.
An already-saved row renders its `ulbName`/`censusCode`/`sbCode`/`allocationAmount` from its own
snapshot in `unspentUlbData` (§1), not from a picker request — so viewing a submitted Yes-branch
declaration never opens the picker either. The picker never fetches more than the current page. This
matters for states with hundreds of ULBs (e.g. UP).

The dialog lets the State check any number of rows across searches/pages before confirming via
"Add selected ULBs"; it resolves with `FcUnspentUlbOption[]` (empty/`undefined` on cancel via the
top-right close icon). `UnspentUlbTableComponent` rechecks every returned `ulbId` against the
FormArray's *current* state before applying — for "Add ULB" every valid selection becomes a new row in
confirmed order; for a row's "Change selected ULB" the first valid selection replaces that row and any
further ones are appended as new rows. `pickedUlbByUlbId` only ever caches the options a user actually
selected (keyed by `ulbId`), never a full fetched page.

Query contract (`FcUnspentUlbOptionsQuery`, fully threaded through the service method and the picker):

```ts
{ stateId: string; yearId: string; search?: string; page?: number; limit?: number }
```

The picker searches by ULB name, Census Code, and SB Code (all handled backend-side by the single
`search` parameter), debounces search input by 400ms, uses a page size of 20 (matching this
codebase's existing paginated-dialog convention — see `EulbRowsDialogComponent`), and guards against
stale responses via a monotonically increasing request id.

### Frontend query cache (never a full-dataset cache)

`FcUnspentUlbOptionsCacheService` (`fc-unspent-ulb-options-cache.service.ts`) is an in-memory cache of
already-fetched `getUlbOptions` query results — never the complete ULB list. It is provided as a
**component-level provider on `FcUnspentDeclarationComponent`** (not `providedIn: 'root'`), so a fresh
instance exists per page visit and is discarded, via its own `ngOnDestroy`, when the page is.
`UnspentUlbTableComponent` passes that same injector into `MatDialog.open`'s config (`injector:
this.injector`) so every picker opened from one page session shares the one cache instance, even
though the dialog component itself is destroyed and recreated on every close/reopen; the picker
degrades to an always-network call if it is ever opened without that injector.

The cache key is `stateId|yearId|normalizedSearch|page|limit`, where `normalizedSearch` is
`search.trim().toLowerCase()` — the same normalized value is what's actually sent as the `search`
query parameter, so the key always accurately reflects the real request. Only a successful response is
cached; a failed request is never cached and a retry always calls the API again. Identical concurrent
requests for the same key are de-duplicated (`shareReplay`) rather than each firing their own HTTP
call. Cached option arrays are shallow-frozen before storage so dialog-local selection state can never
mutate them. The cache is bounded to `MAX_ULB_OPTIONS_CACHE_ENTRIES` (50) query results via a simple
LRU-by-re-insertion eviction policy.

`FcUnspentDeclarationComponent.loadForm()` clears the cache unconditionally at its start — this is the
one place the initial load, the load-error retry button, and `reloadForm()` (called after every
successful save/final-submit) all pass through, so invalidation is centralized there rather than
scattered across success handlers. Adding rows to the FormArray via the picker never invalidates the
cache — cached query *results* stay valid; only the locally-disabled "already added" ulbIds change.

Response — array of:

```jsonc
{
  "ulbId": "66a000000000000000000001",
  "censusCode": "800123",
  "sbCode": null,
  "ulbName": "Sample Municipal Corporation",
  "allocationAmount": 20
}
```

Constraints the backend must enforce:
- Options are **State-scoped** (the requesting state's ULBs only).
- Only **active registry ULBs** are returned.
- `allocationAmount` comes from the state's **current active Installment 1 Devolution dataset**.
- A ULB with a missing or non-positive allocation must **not** be returned as a selectable option —
  the UI has no client-side fallback for this and treats every returned option as selectable.
- The backend remains authoritative for `allocationAmount`; the UI's `allocationPerc`/eligibility
  preview (`unspent-ulb-table.component.ts`) is feedback only.

## 3a. Declaration-template download — `FcUnspentDeclarationTemplate`

`FcUnspentDeclarationService.getDeclarationTemplate(stateId, yearId)` —
`GET xvi-fc/state/fc-unspent-declaration/${stateId}/${yearId}/declaration-template`.

Called only from the No-branch `fcDeclaration` field's "Download template" supporting action
(`onSupportingAction` reacts strictly to `event.fieldKey === 'fcDeclaration' && event.actionId ===
'download-template'`; every other supporting action is ignored). Availability of the action itself is
entirely backend-driven via the returned `questions`/`supportingContent` config — the UI never derives
it from `currentFormStatus` or any other locally-held status.

Response — same `FcUnspentApiResponse<T>` envelope as every other GET here:

```jsonc
{
  "success": true,
  "message": "OK",
  "data": {
    "fileName": "FC-Unspent-Declaration.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "url": "/file/download?signature=..."
  }
}
```

Constraints the backend must enforce, and the UI relies on:
- `url` is always a **private signed download link on the application's own `/file/download` route**
  — the UI never receives or constructs a raw S3 path, and never talks to S3 directly.
- The UI does **not** use `responseType: 'blob'` — the response is the same JSON envelope as every
  other GET, not a file stream; the actual file bytes are fetched by the browser navigating to `url`.
- Before use, the UI validates `url` is non-empty and sanitizes it (`DomSanitizer.sanitize(URL, ...)`)
  and requires its path to start with `/file/download`; anything else (empty, unsafe scheme, or a
  different route/origin) is treated as a failed download, not navigated to.
- The download is triggered via a temporary `<a download>` anchor (`rel="noopener"`), not
  `window.open` (popup-blocker risk) or FileSaver (would require re-fetching the URL as a Blob).
- `fileName` is used as-is for the anchor's `download` attribute (extension included) unless it's
  missing or contains a path separator/control character, in which case a fixed fallback
  (`FC-Unspent-Declaration.docx`) is used instead — the backend-provided extension is never altered
  otherwise.
- A download failure never resets/reloads the form or clears the uploaded `fcDeclaration` value — it
  only shows a snackbar (backend message when available, a generic fallback otherwise).

## 4. Save-draft / final-submit payload — `FcUnspentSavePayload`

Envelope matches `SfcStatusDraftPayload`/`SfcStatusFinalSubmitPayload`
(`{ stateId, yearId, data }`, identical shape for both draft and final submit — the endpoint called
decides which action it is):

```ts
interface FcUnspentSavePayload {
  stateId: string;
  yearId: string;
  data: FcUnspentSaveData;
}
```

### No branch

```jsonc
{
  "stateId": "state-1",
  "yearId": "year-1",
  "data": {
    "isFcUnspent": "no",
    "fcDeclaration": { /* UploadedFileMetadata — owned by the shared dynamic-form file control */ }
  }
}
```

### Yes branch

```jsonc
{
  "stateId": "state-1",
  "yearId": "year-1",
  "data": {
    "isFcUnspent": "yes",
    "unspentUlbData": [
      { "ulbId": "66a000000000000000000001", "unspentAmount": 1.5 },
      { "ulbId": "66a000000000000000000002", "unspentAmount": 1.2 }
    ],
    "checkboxConfirmation": true
  }
}
```

Row rules (`buildPayload()` in `fc-unspent-declaration.component.ts`):
- Every row is whitelisted to exactly `{ ulbId, unspentAmount }` — never `getRawValue()`'s full shape.
- Rows with a null `ulbId` or null `unspentAmount` (an incomplete, not-yet-filled-in row) are dropped
  before sending, even for `saveAsDraft`.

**`isFcUnspent` is sent as the radio field's own live value, `'yes' | 'no'`** — the dynamic-form radio
control never holds a boolean. See §7 CONTRACT DECISION REQUIRED #2.

## 5. Backend-owned fields — never trusted from client state

The UI never reads these from its own form state when building a payload; they are documented here so
backend review can confirm nothing is missing:

- `applicableFc`, `threshold`
- The entire `dependency` object (`devolutionStatus`, `devolutionDatasetExists`,
  `editableDueToDevolutionReturn`, `blockingMessage`)
- Per-row: `ulbName`, `censusCode`, `sbCode`, `allocationAmount`, `allocationPerc`, `eligibility`
- Any future MoHUA row-review fields (§7 #3–#5) — not yet modeled, but flagged now as backend-owned
  by construction once they exist

## 6. Devolution dependency scenarios

`dependency` (§1) is for **display only** — a status label plus `blockingMessage`. The UI never
recomputes `permissions` from it. Six mock scenarios exist in
`fc-unspent-declaration.mock-scenarios.ts` for testing:

| Scenario | `devolutionStatus` | `devolutionDatasetExists` | `canEdit` | `canSaveDraft` | `canFinalSubmit` | `blockingMessage` |
|---|---|---|---|---|---|---|
| `FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW` | `UNDER_REVIEW_BY_MOHUA` | true | true | true | true | null |
| `FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED` | `RETURNED_BY_MOHUA` | true | true | true | **false** | set |
| `FC_UNSPENT_SCENARIO_MISSING_DEVOLUTION_DATASET` | null | **false** | **false** | **false** | **false** | set |
| `FC_UNSPENT_SCENARIO_READONLY_SUBMITTED` | `UNDER_REVIEW_BY_MOHUA` | true | **false** | **false** | **false** | null |
| `FC_UNSPENT_SCENARIO_YES_BRANCH_WITH_ROWS` | (alias of `..._UNDER_REVIEW`) | | | | | |
| `FC_UNSPENT_SCENARIO_NO_BRANCH_SAVED` | `UNDER_REVIEW_BY_MOHUA` | true | true | true | true | null |

When `dependency.blockingMessage` is non-null, the component renders it verbatim in a Bootstrap
`alert alert-warning` banner (`data-cy="fc-unspent-declaration-dependency-alert"`), mirroring the
existing pattern in `devolution-formula.component.html`'s installment-lock banner. The banner never
computes its own message from raw status.

Existing saved rows (`unspentUlbData`) remain visible and rendered regardless of whether final submit
is currently blocked — blocking `canFinalSubmit` never clears or hides them.

## 7. CONTRACT DECISION REQUIRED

Items below are genuinely undecided — nothing in this repository establishes a naming precedent for
them, confirmed by full-repo search. They are **not implemented** as model fields; implementing them
now would mean guessing names, which was explicitly out of scope for this phase.

1. **`canSaveDraft` is a new permission with no sibling-form precedent.** `sfc-status`/
   `devolution-formula` only expose `canView`/`canEdit`/`canFinalSubmit` (confirmed — zero repo-wide
   matches for `canSaveDraft` before this change). Confirm the backend will genuinely distinguish
   "may keep editing / save a draft" from "may edit" as two independent gates, since every other form
   in this codebase treats them as one (`canEdit`).
2. **`isFcUnspent` value type.** This contract sends the radio control's live string value
   (`'yes' | 'no'`), matching the field's own option ids. Confirm the backend accepts the string form
   rather than expecting a boolean.
3. **Row-level MoHUA review state** (e.g. pending/approved/rejected per row) — no enum with this
   purpose exists anywhere in the repo. The closest analogs (`EulbRowValidationStatus`,
   `EulbPostUpdateValidationState`) are client-side data-validity/staleness concepts, not an
   approval workflow, and are not reusable as-is.
4. **Rejection remarks field name.** No `rejectionRemarks` exists anywhere. The one legacy precedent,
   `rejectMessage` (`admin/xvi-fc-review/approve-reject-form.service.ts`), belongs to a different,
   older admin review flow and is not clearly intended for reuse here.
5. **Per-row editability, "allocation changed after Devolution resubmission", and "requires
   re-review" flags** — none exist anywhere in the repo, at the row level or otherwise. The only
   structurally similar precedent is `EulbPostUpdateValidationState`'s `STALE` value (a client-only
   "needs re-check" signal), which is a reusable *pattern* (an extra enum state) but not a reusable
   *name* for this domain.
6. **`FcUnspentDeclarationPreviewResponse` omits `timestamp`**, unlike `SfcStatusApiResponse`
   (`{success, message, data, timestamp}`) and `XviFcApiResponse<T>` (`{success, data, timestamp}`).
   Confirm whether the real response should include one.
7. **Missing-Devolution-dataset scope.** This phase locks the *entire* form
   (`canEdit`/`canSaveDraft`/`canFinalSubmit` all `false`) rather than only disabling ULB row actions,
   on the reasoning that unspent-amount entry is meaningless without an allocation to validate
   against. If the backend intends a narrower lock (e.g. still allow the No-branch declaration to be
   saved without a Devolution dataset), a separate flag distinct from `canEdit` would be needed —
   currently there isn't one.

## 8. Not built in this phase

- Per-ULB MoHUA review UI (blocked on §7 #3–#5).
- Devolution resubmission reconciliation (recalculating `allocationPerc`/`eligibility` when
  Devolution allocations change after a Devolution resubmission).
- Backend field-level validation-error mapping (`sfc-status.component.ts`'s `applyApiErrors` is the
  existing pattern to follow once a real backend returns structured errors).
