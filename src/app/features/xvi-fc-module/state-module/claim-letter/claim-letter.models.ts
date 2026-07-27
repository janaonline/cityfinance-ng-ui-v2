import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

/** Installment 2 stays schema-legal on the backend but is rejected server-side in V1 — this
 *  feature only ever sends/renders installment 1 (no selector shown to the State). */
export type ClaimLetterInstallment = 1 | 2;
export const CLAIM_LETTER_INSTALLMENT: ClaimLetterInstallment = 1;
export type ClaimLetterBatchNumber = 1 | 2 | 3;
export type ClaimLetterAssemblyStatus = 'BUILDING' | 'READY';
export type ClaimLetterEligibilityResult = 'PASSED' | 'EXEMPTED' | 'FAILED';

/**
 * One eligibility-gate source result. Only the fields this UI actually renders (pass/fail state +
 * a reason code) are modeled — never the full backend `EligibilityEvaluationResult` shape, most of
 * which (evidence, dataset versions, snapshot ids) is audit-only and never shown here.
 */
export interface ClaimLetterEligibilitySource {
  formType: string;
  result: ClaimLetterEligibilityResult;
  reasonCode: string;
}

/** State-wide financial context, independent of any one batch — the only two `financialSummary`
 *  concepts that still mean something before a specific claim letter exists, so they're surfaced
 *  here rather than waiting for a batch's own `ClaimLetterFinancialSummary`. */
export interface ClaimLetterFinancialOverview {
  totalInstallmentAllocation: number;
  totalAlreadyAcknowledged: number;
}

export interface ClaimLetterEligibilitySummary {
  installment: ClaimLetterInstallment;
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
  /** Crore-denominated, display-ready. `null` when the ULB has no active Devolution allocation. */
  allocationAmount: number | null;
  eligible: boolean;
  ineligibleReasonCode: string | null;
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

/** Already Crore-denominated and display-ready — the backend does the paise conversion; this UI
 *  only ever appends "Cr." to these values, never rescales them (see `formatCrore`). */
export interface ClaimLetterFinancialSummary {
  totalInstallmentAllocation: number;
  totalAlreadyAcknowledged: number;
  selectedAllocation: number;
  currentSelectedClaim: number;
  remainingIfAcknowledged: number;
}

/**
 * The one response shape every claim-letter read/mutating endpoint returns (`getDetail`,
 * `listHistory`, `createDraft`, `updateDraft`, `abandonDraft`, `uploadSignedFile`, `submit`).
 * `questions` is only ever populated by `getDetail` — every other endpoint leaves it `undefined`.
 */
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
}

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
  message?: string;
  errors?: ClaimLetterApiErrorMap;
  timestamp?: string;
  path?: string;
  data?: unknown;
}
