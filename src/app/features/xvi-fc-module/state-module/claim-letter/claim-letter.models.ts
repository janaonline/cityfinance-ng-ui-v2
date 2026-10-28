import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

/** Installment 2 stays schema-legal on the backend but is rejected server-side in V1 — this
 *  feature only ever sends/renders installment 1 (no selector shown to the State). */
export type ClaimLetterInstallment = 1 | 2;
export const CLAIM_LETTER_INSTALLMENT: ClaimLetterInstallment = 1;
export type ClaimLetterBatchNumber = 1 | 2 | 3;
export type ClaimLetterAssemblyStatus = 'BUILDING' | 'READY';
export type ClaimLetterEligibilityResult = 'PASSED' | 'EXEMPTED' | 'FAILED';

/** Matches the backend's own per-request cap (`CLAIM_LETTER_PAGINATION_MAX_LIMIT`) — used when
 *  paging through every ULB of a batch rather than trusting a single page (see `getAllUlbs`). */
export const CLAIM_LETTER_ULB_ROWS_PAGE_SIZE = 100;

/** Per-ULB eligible/ineligible/exempted tally behind a criterion — see `ClaimLetterEligibilitySource.ulbBreakdown`. */
export interface ClaimLetterUlbEligibilityTally {
  eligible: number;
  ineligible: number;
  exempted: number;
  total: number;
}

/**
 * One eligibility-gate source result. Only the fields this UI actually renders (pass/fail state,
 * a reason code, and optional display copy) are modeled — never the full backend
 * `EligibilityEvaluationResult` shape, most of which (evidence, dataset versions, snapshot ids) is
 * audit-only and never shown here.
 */
export interface ClaimLetterEligibilitySource {
  formType: string;
  /** Absent for the ULB-only criteria (today: SLB, Provisional, Audited, Bank Account, DUR) merged
   *  in from `ulbLevelCriteria` at render time — they have no single state-wide pass/fail, so the
   *  checklist renders a neutral icon and excludes them from the "all passing" computation when
   *  `result` is undefined. */
  result?: ClaimLetterEligibilityResult;
  reasonCode: string;
  /** Short human-readable name for this criterion (e.g. "Devolution Formula"). Falls back to a
   *  humanized `formType` when absent — see `humanizeToken`/`describeEligibilitySource`. */
  displayLabel?: string;
  /** One-line requirement statement, same wording regardless of pass/fail — only the tick/cross
   *  indicator changes. Falls back to a generated sentence when absent. */
  displayDescription?: string;
  /** Relative frontend route for this criterion's "View" action (e.g. '../sfc-status').
   *  Frontend falls back to '../requirements' (self-link) when unset. */
  checklistRoute?: string;
  /** Plain-language checklist line for /requirements.
   * Supports {{priorFcCycleLabel}}; substituted by ClaimLetterService.getEligibilitySummary().
   * Falls back to displayDescription when unset. */
  checklistSummary?: string;
  /** Per-ULB tally behind this requirement — populated for Elected Body/FC Unspent (state forms
   *  representing ULB-level data) and for the ULB-only criteria merged in from `ulbLevelCriteria`.
   *  Absent for pure state-form checks (today: SFC, Devolution, GTC), which have no per-ULB
   *  meaning. */
  ulbBreakdown?: ClaimLetterUlbEligibilityTally;
}

/** State-wide financial context, independent of any one batch — the `financialSummary` concepts
 *  that still mean something before a specific claim letter exists, so they're surfaced here
 *  rather than waiting for a batch's own `ClaimLetterFinancialSummary`. */
export interface ClaimLetterFinancialOverview {
  totalInstallmentAllocation: number;
  totalAlreadyAcknowledged: number;
  /** Sum claimed across this state/year/installment's other batches currently under MoHUA review. */
  totalClaimInProgress: number;
  /** Sum claimed across this state/year/installment's other batches still in draft. */
  totalClaimInDraft: number;
  /** totalInstallmentAllocation − totalAlreadyAcknowledged − totalClaimInProgress − totalClaimInDraft. */
  availableToClaim: number;
}

/** Which FC cycle "FC Unspent Balance" disclosures refer to for this design year — resolved
 *  backend-side (`resolvePriorFcCycleLabel`) from the same table the actual signed Claim Letter
 *  document's own Annexure 1 heading uses, so this and that document can never disagree. Never
 *  hardcode "14th"/"15th" against a year on this side — always read this field. */
export type ClaimLetterPriorFcCycleLabel = '14th FC' | '15th FC';

export interface ClaimLetterUlbReadiness {
  eligible: number;
  total: number;
}

export interface ClaimLetterEligibilitySummary {
  stateName: string;
  installment: ClaimLetterInstallment;
  priorFcCycleLabel: ClaimLetterPriorFcCycleLabel;
  stateLevelGate: {
    passed: boolean;
    sources: ClaimLetterEligibilitySource[];
  };
  expectedUlbCount: number;
  batchSlotsUsed: number;
  batchSlotsMax: number;
  /** The batch-slot number that would be allocated if a draft were created right now — `null` once
   *  all `batchSlotsMax` slots are occupied by a non-abandoned batch. */
  nextBatchNumber: ClaimLetterBatchNumber | null;
  financialOverview: ClaimLetterFinancialOverview;
  /** Tallies for ULB-only criteria with no state action to gate on (SLB, Provisional/Audited
   *  Annual Accounts) — never affects `stateLevelGate.passed`. Merged into the same unified
   *  checklist as `stateLevelGate.sources` at render time (see `claim-letter-list.component.ts`). */
  ulbLevelCriteria: {
    displayLabel?: string;
    displayDescription?: string;
    tally: ClaimLetterUlbEligibilityTally;
  }[];
  /** How many of `expectedUlbCount` ULBs pass *every* ULB-bulk criterion (SLB, Provisional/Audited
   *  Accounts, Elected Body row, FC Unspent row) — the true intersection, not derivable from any
   *  single criterion's tally. Scoped to just those criteria: it does NOT factor in Devolution
   *  allocation or "locked in another claim," so it is not the same as "pickable in the picker." */
  ulbReadiness: ClaimLetterUlbReadiness;
  /** `expectedUlbCount` minus every ULB currently locked into *any* batch (draft or acknowledged,
   *  regardless of current eligibility) — how many ULBs still have no home in any batch at all.
   *  Drives the "must all be in your final batch" warning and the final-batch submit guard. */
  remainingUlbCount: number;
  /** The batch in progress or under MoHUA review (one at a time); null when a new claim can start. */
  activeBatchNumber: number | null;
}

/**
 * Lean sibling of `ClaimLetterEligibilitySummary` for the create/edit claim-letter page — exactly
 * the subset of fields that page reads (financial/batch-slot/ULB-count context), with none of the
 * `stateLevelGate`/`ulbLevelCriteria`/`ulbReadiness` fields that page never displays. Backed by
 * `GET .../claim-context`, which skips the expensive eligibility-checklist evaluation entirely.
 */
export interface ClaimLetterClaimContext {
  /** Powers the page-header eyebrow — same convention as `ClaimLetterEligibilitySummary.stateName`. */
  stateName: string;
  expectedUlbCount: number;
  batchSlotsUsed: number;
  batchSlotsMax: number;
  nextBatchNumber: ClaimLetterBatchNumber | null;
  financialOverview: ClaimLetterFinancialOverview;
  remainingUlbCount: number;
  /** DB-driven claimed-vs-allocated variance band (formJson.meta on the backend) — never hardcode
   *  these; pass straight through to `isClaimWithinVariance`. */
  varianceLowerPercent: number;
  varianceUpperPercent: number;
  /** Whether the current user may start a new claim (PREPARE_GRANT_LETTERS) — the create-mode-only
   *  equivalent of `ClaimLetterBatchSummary.permissions.canEdit`, since there's no batch document
   *  yet to attach a full `ClaimLetterPermissions` to. False while another batch is active. */
  canCreate: boolean;
  /** Why a new claim can't start because another batch is active; null otherwise. */
  createBlockedReason: string | null;
}

/**
 * One selectable-ULB picker row, sourced from the lazy/searchable `ulb-options` endpoint — never
 * part of the claim detail response. `eligible`/`ineligibleReasonCode` are server-computed; the
 * picker must never re-derive eligibility client-side.
 */
export interface ClaimLetterUlbOption {
  ulbId: string;
  ulbName: string;
  censusCode: string | null;
  sbCode: string | null;
  /** Whole Rupees (no decimals). `null` when the ULB has no active Devolution allocation. */
  allocationAmount: number | null;
  eligible: boolean;
  ineligibleReasonCode: string | null;
  /** Specific, human-readable reason naming the failing form(s) (e.g. "SLB eligibility criteria not
   *  met") — populated only for `ULB_LEVEL_ELIGIBILITY_CRITERIA_NOT_MET`; `null` otherwise, in which
   *  case the UI falls back to humanizing `ineligibleReasonCode`. */
  ineligibleReasonDetail: string | null;
}

/** Query params for the lazy ULB-options endpoint — `stateId`/`yearId`/installment are path params
 *  on the real endpoint, passed as separate `ClaimLetterService.getUlbOptions` arguments. */
export interface ClaimLetterUlbOptionsQuery {
  search?: string;
  eligibilityFilter?: 'ELIGIBLE' | 'INELIGIBLE';
  /** Excludes this draft's own already-locked ULBs from the "locked elsewhere" filter. Omitted in
   *  create mode (no claim exists yet). */
  claimLetterId?: string;
  page?: number;
  limit?: number;
}

export interface ClaimLetterUlbOptionsResult {
  options: ClaimLetterUlbOption[];
  page: number;
  limit: number;
  total: number;
}

/** One row of the selected-ULBs table, from `GET :claimLetterId/ulbs` — already server-computed
 *  (difference %, eligible re-verified at read time), never recomputed from `ClaimLetterUlbOption`. */
export interface ClaimLetterUlbRow {
  ulbId: string;
  ulbName: string;
  censusCode: string | null;
  sbCode: string | null;
  allocationAmount: number;
  claimAmount: number;
  differencePercentage: number;
  eligible: boolean;
}

export interface ClaimLetterUlbRowsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClaimLetterUlbRowsResult {
  rows: ClaimLetterUlbRow[];
  page: number;
  limit: number;
  total: number;
}

/** Whole Rupees (no decimals) — formatting (Cr/Lakh scaling or full-precision) is the FE's job via
 *  `AmountDisplayModeService`, not pre-applied by the backend. */
export interface ClaimLetterFinancialSummary {
  totalInstallmentAllocation: number;
  totalAlreadyAcknowledged: number;
  /** Self-excludes this batch — sums the state's OTHER batches at each status. Persisted (not just
   *  transient) so the detail page can live-recompute `remainingIfAcknowledged`-equivalent values as
   *  the user edits claim amounts, without a fresh server round-trip on every keystroke. */
  totalClaimInProgress: number;
  totalClaimInDraft: number;
  availableToClaim: number;
  selectedAllocation: number;
  currentSelectedClaim: number;
  /** = availableToClaim − currentSelectedClaim — accounts for other concurrent batches, not just
   *  this state's already-acknowledged claims. */
  remainingIfAcknowledged: number;
}

/** Authoritative UI edit/submit gates, computed backend-side (same shape/convention as
 *  `SfcStatusPermissions`) — never infer `canEdit`/`canFinalSubmit` from `currentFormStatus`/
 *  `isAbandoned` locally. */
export interface ClaimLetterPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

/**
 * The one response shape every claim-letter read/mutating endpoint returns (`getDetail`,
 * `listHistory`, `createDraft`, `updateDraft`, `abandonDraft`, `uploadSignedFile`, `submit`).
 * `questions` is only ever populated by `getDetail` — every other endpoint leaves it `undefined`.
 */
/** Which final claim letter the page shows: the live merge of a draft, or the copy that was submitted. */
export type ClaimLetterFinalStage = 'DRAFT' | 'SUBMITTED';

export interface ClaimLetterBatchSummary {
  claimLetterId: string;
  installment: ClaimLetterInstallment;
  batchNumber: ClaimLetterBatchNumber;
  version: number;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  assemblyStatus: ClaimLetterAssemblyStatus;
  ulbCount: number;
  isAbandoned: boolean;
  hasSignedFile: boolean;
  /** null: nothing to show (no signed letter yet, abandoned, or blocked by another batch). */
  finalClaimLetterStage: ClaimLetterFinalStage | null;
  financialSummary: ClaimLetterFinancialSummary;
  /** Optimistic-concurrency counter — required as `expectedRevision` on `updateDraft`. */
  revision: number;
  submittedAt: string | null;
  resolvedAt: string | null;
  supersedes: string | null;
  supersededBy: string | null;
  createdAt: string;
  /** Claim Letter's own `formjsons` field config (today: just `signedClaimFile`). Only present on
   *  `getDetail` responses. */
  questions?: ConditionalFieldConfig[];
  stateName?: string;
  /** Same DB-driven variance band as `ClaimLetterClaimContext` — only present on `getDetail`
   *  responses, same convention as `questions`. */
  varianceLowerPercent?: number;
  varianceUpperPercent?: number;
  /** Mandatory letter details saved and valid (Submit needs them). Only on `getDetail`. */
  letterDetailsComplete?: boolean;
  /** Another batch is active (one at a time): preview, download, letter details and submit are
   *  blocked, with the reason to show. On `getDetail` and `listHistory`. */
  blockedByBatchNumber?: number | null;
  blockedReason?: string | null;
  /** Authoritative edit/submit gates for this claim — always populated. */
  permissions: ClaimLetterPermissions;
}

// ─── Claim letter document (GET :claimLetterId/document, .../document/ulbs) ─────────────────

/** One run of letter text; a '\n' inside `text` is a line break, `placeholder` marks a highlighted
 *  `< >` the State still has to fill. Rendered verbatim - the backend owns every word. `field` is the
 *  letter-detail key of a slot (an inline box when editing); `lead` prints before a filled value only;
 *  `hint` explains a placeholder filled in another form. */
export interface ClaimLetterRun {
  text: string;
  bold?: boolean;
  placeholder?: boolean;
  field?: string;
  lead?: string;
  hint?: string;
}

/** `number` (e.g. "2.") renders as a hanging-indent list item. */
export interface ClaimLetterParagraph {
  runs: ClaimLetterRun[];
  number?: string;
}

export interface ClaimLetterComplianceRow {
  key: string;
  condition: ClaimLetterParagraph[];
  status: ClaimLetterParagraph[];
}

export interface ClaimLetterCoveringLetter {
  letterhead: ClaimLetterParagraph;
  letterNo: ClaimLetterParagraph;
  refAndDate: ClaimLetterParagraph;
  addressee: ClaimLetterParagraph;
  subject: ClaimLetterParagraph;
  referencesTitle: string;
  references: ClaimLetterParagraph[];
  salutation: ClaimLetterParagraph;
  body: ClaimLetterParagraph[];
  complianceHeaders: string[];
  compliance: ClaimLetterComplianceRow[];
  note: ClaimLetterParagraph;
  closing: ClaimLetterParagraph[];
  signOff: ClaimLetterParagraph;
  signature: ClaimLetterParagraph;
}

/** Drives alignment: serial centre, name left, value / yesNo centre, amount right. */
export type ClaimLetterColumnKind = 'serial' | 'name' | 'value' | 'yesNo' | 'amount';

export interface ClaimLetterColumn {
  header: string;
  kind: ClaimLetterColumnKind;
}

export type ClaimLetterListKey = 'ELIGIBLE' | 'INELIGIBLE';

/** One annexure row; `cells` follow `ClaimLetterDocument.annexure.columns` (S. No. included). */
export interface ClaimLetterAnnexureRow {
  ulbId: string;
  cells: string[];
}

export interface ClaimLetterListMeta {
  key: ClaimLetterListKey;
  heading: string;
  subheading: string;
  total: number;
}

export interface ClaimLetterDocument {
  refNo: string;
  stateName: string;
  designYearLabel: string;
  installment: ClaimLetterInstallment;
  batchNumber: ClaimLetterBatchNumber;
  /** When (IST, "07 Oct 2026, 14:30") the eligibility behind rows C-K and the lists was evaluated. */
  asOn: string;
  letter: ClaimLetterCoveringLetter;
  annexure: { title: string; columns: ClaimLetterColumn[]; lists: ClaimLetterListMeta[] };
}

/** Annexure rows are paged server-side, 20 per page per list. */
export const CLAIM_LETTER_DOCUMENT_PAGE_SIZE = 20;

export interface ClaimLetterDocumentUlbPage {
  rows: ClaimLetterAnnexureRow[];
  page: number;
  limit: number;
  total: number;
}

// ─── Letter details (GET / PATCH :claimLetterId/letter-details) ─────────────────────────────

export interface ClaimLetterLetterDetailsState {
  values: Record<string, unknown>;
  /** Mandatory fields saved and every saved value valid - Download and Submit need it. */
  isComplete: boolean;
  missingFields: string[];
  hasSignedFile: boolean;
  letterDetailsUpdatedAt: string | null;
}

export interface ClaimLetterLetterDetails extends ClaimLetterLetterDetailsState {
  /** In formjson `meta.letterDetailKeys` order (= letter order); fields carry their saved `value`. */
  fields: ConditionalFieldConfig[];
  canEdit: boolean;
  /** The State's latest saved details from another batch, minus Letter No. / date. */
  previous: {
    source: { yearLabel: string; installment: number; batchNumber: number };
    values: Record<string, unknown>;
  } | null;
}

export interface ClaimLetterLetterDetailsSaveResult extends ClaimLetterLetterDetailsState {
  signedFileRemoved: boolean;
}

// ─── Final claim letter, the merged PDF (GET :claimLetterId/final-pdf) ──────────────────────

export interface ClaimLetterFinalPdf {
  /** Sent back on Submit; a stale key is refused with 409 FINAL_PDF_OUTDATED. */
  sourceKey: string;
  fileName: string;
  included: string[];
  missing: string[];
  /** Non-optional documents missing now; Submit waits until they are uploaded in their forms. */
  missingRequired: string[];
  pageCount: number | null;
  builtAt: string;
}

/** Backend error `code`s the letter dialogs react to. */
export const CLAIM_LETTER_ERROR_CODE = {
  SIGNED_FILE_REMOVAL_NOT_CONFIRMED: 'SIGNED_FILE_REMOVAL_NOT_CONFIRMED',
  LETTER_DETAILS_CHANGED: 'LETTER_DETAILS_CHANGED',
  LETTER_DETAILS_INCOMPLETE: 'LETTER_DETAILS_INCOMPLETE',
  FINAL_PDF_OUTDATED: 'FINAL_PDF_OUTDATED',
  FINAL_PDF_SOURCE_UNREADABLE: 'FINAL_PDF_SOURCE_UNREADABLE',
  BATCH_BLOCKED: 'CLAIM_LETTER_BATCH_BLOCKED',
} as const;

export interface ClaimLetterHistoryQuery {
  installment?: ClaimLetterInstallment;
  page?: number;
  limit?: number;
}

export interface ClaimLetterHistoryResult {
  claims: ClaimLetterBatchSummary[];
  page: number;
  limit: number;
  total: number;
}

/** Client never sends `allocationAmount`/`eligible`/derived fields — only what the State chose. */
export interface ClaimLetterUlbSelection {
  ulbId: string;
  claimedAmount: number;
}

export interface CreateClaimLetterDraftPayload {
  ulbSelections: ClaimLetterUlbSelection[];
  idempotencyKey?: string;
}

export interface UpdateClaimLetterDraftPayload {
  ulbSelections: ClaimLetterUlbSelection[];
  expectedRevision: number;
}

// ─── API response / error shapes (mirrors the FC Unspent envelope — same backend infra) ───────

export interface ClaimLetterApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ClaimLetterApiErrorMap = Record<string, ClaimLetterApiFieldError[]>;

export interface ClaimLetterApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ClaimLetterApiErrorMap;
  meta?: Record<string, unknown>;
  timestamp?: string;
}

/** Normalized shape extracted from either an `HttpErrorResponse.error` body or a thrown
 *  `success:false` response — same two-shape narrowing FC Unspent's own component uses. */
export interface ClaimLetterApiErrorResponse {
  success?: false;
  statusCode?: number;
  /** `messages` joined; a class-validator 400 sends an array. */
  message?: string;
  messages?: string[];
  code?: string;
  errors?: ClaimLetterApiErrorMap;
  timestamp?: string;
  path?: string;
  data?: unknown;
}
