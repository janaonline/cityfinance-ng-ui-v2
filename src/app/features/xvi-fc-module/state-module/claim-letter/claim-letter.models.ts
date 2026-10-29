import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

/** V1 sends and shows Installment 1 only; the backend rejects 2. */
export type ClaimLetterInstallment = 1 | 2;
export const CLAIM_LETTER_INSTALLMENT: ClaimLetterInstallment = 1;
export type ClaimLetterBatchNumber = 1 | 2 | 3;
export type ClaimLetterAssemblyStatus = 'BUILDING' | 'READY';
export type ClaimLetterEligibilityResult = 'PASSED' | 'EXEMPTED' | 'FAILED';

/** The backend's per-request max (`CLAIM_LETTER_PAGINATION_MAX_LIMIT`), used by `getAllUlbs`. */
export const CLAIM_LETTER_ULB_ROWS_PAGE_SIZE = 100;

export interface ClaimLetterUlbEligibilityTally {
  eligible: number;
  ineligible: number;
  exempted: number;
  /** Of `exempted`, those resting on an exemption request still under MoHUA review. */
  exemptedUnderReview?: number;
  total: number;
}

/** A ULB's exemption request worth flagging: under MoHUA review (it counts), or rejected and now
 *  failing. `label` names the criterion. */
export interface ClaimLetterExemptionNote {
  label: string;
  status: 'UNDER_REVIEW' | 'REJECTED';
}

/** One checklist line: only the fields this UI renders, not the backend's full evaluation result. */
export interface ClaimLetterEligibilitySource {
  formType: string;
  /** Absent for the ULB-only criteria merged in from `ulbLevelCriteria`: they have no State-wide
   *  pass/fail, so the checklist shows them neutral and leaves them out of "all passing". */
  result?: ClaimLetterEligibilityResult;
  reasonCode: string;
  /** Falls back to a humanized `formType` (`describeEligibilitySourceLabel`). */
  displayLabel?: string;
  /** Same wording whatever the result; falls back to a generated sentence. */
  displayDescription?: string;
  /** Relative route for the "View" action (e.g. '../sfc-status'); the requirements page falls back to itself. */
  checklistRoute?: string;
  /** The requirements page's line, tokens already filled by the backend; falls back to the description. */
  checklistSummary?: string;
  /** Set for State forms with per-ULB rows and for the merged ULB-only criteria. */
  ulbBreakdown?: ClaimLetterUlbEligibilityTally;
  /** For an EXEMPTED State form: 5 while the Entire State request is under MoHUA review, 7 approved. */
  exemptionStatus?: number | null;
}

/** State-wide figures, available before any batch exists. */
export interface ClaimLetterFinancialOverview {
  totalInstallmentAllocation: number;
  totalAlreadyAcknowledged: number;
  /** Claimed in batches under MoHUA review (not drafts). */
  totalClaimInProgress: number;
  totalClaimInDraft: number;
  /** Allocation minus the three claimed totals. */
  availableToClaim: number;
}

/** Resolved by the backend per design year; never derive "14th" / "15th" from the year here. */
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
  /** Slot a new draft would take now; null when every slot is used. */
  nextBatchNumber: ClaimLetterBatchNumber | null;
  financialOverview: ClaimLetterFinancialOverview;
  /** ULB-owned criteria: informational, never part of `stateLevelGate`; the list page merges them
   *  into the checklist. */
  ulbLevelCriteria: {
    displayLabel?: string;
    displayDescription?: string;
    tally: ClaimLetterUlbEligibilityTally;
  }[];
  /** ULBs passing every ULB-bulk criterion at once. Ignores allocation and locks, so it is not the
   *  picker's count of pickable ULBs. */
  ulbReadiness: ClaimLetterUlbReadiness;
  /** Expected ULBs in no batch, eligible or not; drives the final-batch warning and submit guard. */
  remainingUlbCount: number;
  /** The batch in progress or under MoHUA review (one at a time); null when a new claim can start. */
  activeBatchNumber: number | null;
}

/** Lean sibling of `ClaimLetterEligibilitySummary` for the create/edit page (`GET .../claim-context`, no checklist). */
export interface ClaimLetterClaimContext {
  stateName: string;
  expectedUlbCount: number;
  batchSlotsUsed: number;
  batchSlotsMax: number;
  nextBatchNumber: ClaimLetterBatchNumber | null;
  financialOverview: ClaimLetterFinancialOverview;
  remainingUlbCount: number;
  /** Claimed-vs-allocated band from the backend; pass it straight to `isClaimWithinVariance`. */
  varianceLowerPercent: number;
  varianceUpperPercent: number;
  /** PREPARE_GRANT_LETTERS and no active batch; stands in for `permissions.canEdit` before a batch exists. */
  canCreate: boolean;
  /** Why a new claim can't start because another batch is active; null otherwise. */
  createBlockedReason: string | null;
}

/** A picker row from `ulb-options`; eligibility is server-computed, never re-derived here. */
export interface ClaimLetterUlbOption {
  ulbId: string;
  ulbName: string;
  censusCode: string | null;
  sbCode: string | null;
  /** Whole Rupees; null when the ULB has no active Devolution allocation. */
  allocationAmount: number | null;
  eligible: boolean;
  ineligibleReasonCode: string | null;
  /** Names the failing form(s); only for ULB_LEVEL_ELIGIBILITY_CRITERIA_NOT_MET, else null (the code is humanized). */
  ineligibleReasonDetail: string | null;
  exemptionNotes?: ClaimLetterExemptionNote[];
}

export interface ClaimLetterUlbOptionsQuery {
  search?: string;
  eligibilityFilter?: 'ELIGIBLE' | 'INELIGIBLE';
  /** Lets this draft's own locked ULBs show as selectable; omitted in create mode. */
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

/** A saved row from `GET :claimLetterId/ulbs`, difference and eligibility computed server-side. */
export interface ClaimLetterUlbRow {
  ulbId: string;
  ulbName: string;
  censusCode: string | null;
  sbCode: string | null;
  allocationAmount: number;
  claimAmount: number;
  differencePercentage: number;
  eligible: boolean;
  exemptionNotes?: ClaimLetterExemptionNote[];
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

/** Whole Rupees; display scaling is `AmountDisplayModeService`'s job. */
export interface ClaimLetterFinancialSummary {
  totalInstallmentAllocation: number;
  totalAlreadyAcknowledged: number;
  /** This and totalClaimInDraft exclude this batch, so the page can subtract its live claim once. */
  totalClaimInProgress: number;
  totalClaimInDraft: number;
  availableToClaim: number;
  selectedAllocation: number;
  currentSelectedClaim: number;
  /** Net of other drafts and batches under review too, not only acknowledged ones. */
  remainingIfAcknowledged: number;
}

/** Authoritative UI gates from the backend; never re-derive them from status. */
export interface ClaimLetterPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

/** Which final claim letter the page shows: the live merge of a draft, or the copy that was submitted. */
export type ClaimLetterFinalStage = 'DRAFT' | 'SUBMITTED';

/** The shape every batch endpoint returns. */
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
  /** Sent back as `expectedRevision` on `updateDraft`. */
  revision: number;
  submittedAt: string | null;
  resolvedAt: string | null;
  supersedes: string | null;
  supersededBy: string | null;
  createdAt: string;
  // Set by getDetail only, down to letterDetailsComplete.
  /** Formjson fields except the letter details (those come from `GET .../letter-details`). */
  questions?: ConditionalFieldConfig[];
  stateName?: string;
  varianceLowerPercent?: number;
  varianceUpperPercent?: number;
  /** Mandatory letter details saved and valid (Submit needs them). */
  letterDetailsComplete?: boolean;
  /** getDetail only: ULBs in this draft relying on an exemption still under MoHUA review. */
  exemptionUnderReviewUlbCount?: number;
  /** getDetail only: State forms whose Entire State exemption request is still under MoHUA review. */
  stateExemptionsUnderReview?: string[];
  /** Another batch is active (one at a time): preview, download, letter details and submit are
   *  blocked, with the reason to show. On `getDetail` and `listHistory`. */
  blockedByBatchNumber?: number | null;
  blockedReason?: string | null;
  permissions: ClaimLetterPermissions;
}

// ─── Claim letter document (GET :claimLetterId/document, .../document/ulbs) ─────────────────

/** One run of letter text, rendered verbatim (the backend owns every word); a '\n' is a line break. */
export interface ClaimLetterRun {
  text: string;
  bold?: boolean;
  /** A highlighted `< >` the State still has to fill. */
  placeholder?: boolean;
  /** Letter-detail key of a slot, drawn as an inline box while editing. */
  field?: string;
  /** Printed before a filled value only. */
  lead?: string;
  /** Explains a placeholder that is filled in another form. */
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

/** Only what the State chose; allocation and eligibility are resolved server-side. */
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

// ─── API response / error shapes (same envelope as FC Unspent) ───────────────────────────────

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

/** What `readApiError` extracts from an `HttpErrorResponse` body or a thrown `success: false` response. */
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
