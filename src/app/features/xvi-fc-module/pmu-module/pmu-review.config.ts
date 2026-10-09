import { FORM_STATUS } from '../common/constants/form-status.constants';

export type PmuReviewFormId = 'SFC_STATUS' | 'GTC' | 'DEVOLUTION_FORMULA' | 'ELECTED_BODY' | 'FC_UNSPENT';

export type PmuDetailShape = 'FORM_LEVEL' | 'ROW_LEVEL';

export interface PmuFormOption {
  value: PmuReviewFormId;
  label: string;
  detailShape: PmuDetailShape;
  /** Route segment under pmu-module, e.g. '/xvifc/:yearId/<routeSegment>/:stateId'. */
  routeSegment: string;
  /** Backend path segment, e.g. 'xvi-fc/pmu/sfc-status/' — every PMU HTTP call is built from this. */
  basePath: string;
  /** True only for GTC / Devolution Formula — threads an extra `:installment` path segment through
   *  every review/approve/reject/worklist call and route. */
  installmentScoped: boolean;
  /** True only for Devolution Formula — its PMU reviewer is whole-form-only (no `questions`, per
   *  Part F of the PMU Review plan), so the generic form-level detail page shows a read-only
   *  per-ULB allocation table instead of the usual `<app-dynamic-form>` field list. */
  hasReadOnlyRows: boolean;
}

/** Only 2 detail shapes exist across all 5 forms (Component-reuse architecture, Option C) — this
 *  is what lets one generic form-level and one generic row-level detail component serve all 5. */
export const PMU_FORM_OPTIONS: readonly PmuFormOption[] = [
  {
    value: 'SFC_STATUS',
    label: 'SFC Status',
    detailShape: 'FORM_LEVEL',
    routeSegment: 'sfc-status-review',
    basePath: 'xvi-fc/pmu/sfc-status/',
    installmentScoped: false,
    hasReadOnlyRows: false,
  },
  {
    value: 'GTC',
    label: 'Grant Transfer Certificate (GTC)',
    detailShape: 'FORM_LEVEL',
    routeSegment: 'gtc-review',
    basePath: 'xvi-fc/pmu/gtc/',
    installmentScoped: true,
    hasReadOnlyRows: false,
  },
  {
    value: 'DEVOLUTION_FORMULA',
    label: 'Devolution Formula',
    detailShape: 'FORM_LEVEL',
    routeSegment: 'devolution-formula-review',
    basePath: 'xvi-fc/pmu/devolution-formula/',
    installmentScoped: true,
    hasReadOnlyRows: true,
  },
  {
    value: 'ELECTED_BODY',
    label: 'Elected Body Status',
    detailShape: 'ROW_LEVEL',
    routeSegment: 'elected-body-review',
    basePath: 'xvi-fc/pmu/elected-urban-local-bodies/',
    installmentScoped: false,
    hasReadOnlyRows: false,
  },
  {
    value: 'FC_UNSPENT',
    label: 'FC Unspent Declaration',
    detailShape: 'ROW_LEVEL',
    routeSegment: 'fc-unspent-review',
    basePath: 'xvi-fc/pmu/fc-unspent-declaration/',
    installmentScoped: false,
    hasReadOnlyRows: false,
  },
];

export function pmuFormOption(value: PmuReviewFormId): PmuFormOption {
  return PMU_FORM_OPTIONS.find((f) => f.value === value)!;
}

export function hasEligibilityColumn(form: PmuReviewFormId): boolean {
  return form === 'FC_UNSPENT';
}

export function hasElectedBodyColumns(form: PmuReviewFormId): boolean {
  return form === 'ELECTED_BODY';
}

export type PmuReviewStatus = 'Pending Review' | 'Approved' | 'Returned';

/** The 7 statuses a PMU state-level form (SFC/GTC/Devolution/Elected Body/FC Unspent) can actually
 *  be in — EXEMPTED_ACKNOWLEDGED (12) is deliberately excluded: confirmed via grep that status is
 *  only ever set by the ULB-forms track's own Dynamic Year Access exemption flow, never by any of
 *  these 5 forms' own services, so it could never match a real row. Drives the Form Status
 *  dropdown on the worklist page, independent of the 3 bucket cards (see `pmuStatusBucket` below). */
export const PMU_FORM_STATUS_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: FORM_STATUS.NOT_STARTED, label: 'Not Started' },
  { value: FORM_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: FORM_STATUS.UNDER_REVIEW_BY_MOHUA, label: 'Under Review by MoHUA' },
  { value: FORM_STATUS.RETURNED_BY_MOHUA, label: 'Returned by MoHUA' },
  { value: FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA, label: 'Acknowledged by MoHUA' },
  { value: FORM_STATUS.UNDER_REVIEW_BY_PMU, label: 'Under Review by PMU' },
  { value: FORM_STATUS.RETURNED_BY_PMU, label: 'Returned by PMU' },
];

/** Precise, granular status label for a raw `currentFormStatus` — used anywhere the exact status
 *  must be shown (the worklist table's Status column, both detail pages' status pill), as opposed
 *  to `pmuStatusBucket`'s lossy 3-way collapse used only by the bucket cards. */
export function pmuStatusLabel(currentFormStatus: number): string {
  return PMU_FORM_STATUS_OPTIONS.find((o) => o.value === currentFormStatus)?.label ?? 'Unknown';
}

/** Precise, granular badge class for a raw `currentFormStatus` — neutral for Not Started/In
 *  Progress (not yet PMU's concern), warning while PMU itself is reviewing, danger once PMU has
 *  returned it, success for anything already past PMU (MoHUA's own 3 statuses). */
export function pmuStatusBadgeClass(currentFormStatus: number): string {
  if (currentFormStatus === FORM_STATUS.NOT_STARTED || currentFormStatus === FORM_STATUS.IN_PROGRESS) {
    return 'bg-secondary-subtle text-secondary-emphasis';
  }
  if (currentFormStatus === FORM_STATUS.UNDER_REVIEW_BY_PMU) return 'bg-warning-subtle text-warning-emphasis';
  if (currentFormStatus === FORM_STATUS.RETURNED_BY_PMU) return 'bg-danger-subtle text-danger-emphasis';
  return 'bg-success-subtle text-success-emphasis';
}

/** Maps a real numeric `currentFormStatus`/`rowStatus` to PMU's own 3-bucket view, used only by the
 *  worklist page's bucket cards (Pending Review/Approved/Returned) and the row-level badge (whose
 *  own `rowStatus` is never actually `NOT_STARTED`/`IN_PROGRESS` — a row only exists once its
 *  parent form has been finally submitted). PMU has no status of its own once approved — an
 *  approved form/row lands directly on `UNDER_REVIEW_BY_MOHUA` (5), and may later move to
 *  `RETURNED_BY_MOHUA` (6) or `SUBMISSION_ACKNOWLEDGED_BY_MOHUA` (7) — all three read as "Approved"
 *  from PMU's own point of view. Returns `null` for `NOT_STARTED`/`IN_PROGRESS` — a state that
 *  hasn't even reached PMU's queue yet doesn't belong to any of the 3 named buckets, so it only
 *  ever counts toward Total. */
export function pmuStatusBucket(currentFormStatus: number): PmuReviewStatus | null {
  if (currentFormStatus === FORM_STATUS.NOT_STARTED || currentFormStatus === FORM_STATUS.IN_PROGRESS) return null;
  if (currentFormStatus === FORM_STATUS.UNDER_REVIEW_BY_PMU) return 'Pending Review';
  if (currentFormStatus === FORM_STATUS.RETURNED_BY_PMU) return 'Returned';
  return 'Approved';
}
