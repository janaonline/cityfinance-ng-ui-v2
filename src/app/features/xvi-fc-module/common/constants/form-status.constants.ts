/**
 * Numeric form-status values shared across every XVI-FC form type, mirroring the backend's
 * `FORM_STATUS` (cf-nest-api-v2/src/common/constants/form-status.constants.ts). Role-neutral
 * location so any state/mohua/ulb submodule can import the full 0-11 range without depending on
 * another feature's local constant.
 */
export type FormStatusType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const FORM_STATUS = {
  NO_STATUS: 0,
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  UNDER_REVIEW_BY_STATE: 3,
  RETURNED_BY_STATE: 4,
  UNDER_REVIEW_BY_MOHUA: 5,
  RETURNED_BY_MOHUA: 6,
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 7,
  APPROVED_BY_STATE: 8,
  AWAITING_CLAIM_LETTER: 9,
  UNDO: 10,
  ACTION_REQUIRED: 11,
} as const satisfies Record<string, FormStatusType>;
