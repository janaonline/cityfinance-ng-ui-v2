import { FORM_STATUS } from '../../shared/form-progress/form-progress.component';
import { FC_UNSPENT_DECLARATION_FIELDS } from './fc-unspent-declaration.questions';
import { FcUnspentDeclarationData } from './fc-unspent-declaration.models';

/**
 * UI dev fixtures only — illustrative, not a confirmed API contract. These are additional
 * `getPreview()`-shaped scenarios (beyond the default in `fc-unspent-declaration.mock.ts`) used to
 * exercise permission/dependency gating in tests. Never mutates `FC_UNSPENT_DECLARATION_FIELDS` —
 * each scenario clones its question values, same pattern as the default mock.
 */

const CLONE_UNSPENT_ULB_ROWS = [
  {
    slNo: 1,
    ulbId: '66a000000000000000000001',
    censusCode: '800123',
    sbCode: null,
    ulbName: 'Sample Municipal Corporation',
    allocationAmount: 20,
    unspentAmount: 1.5,
    allocationPerc: 7.5,
    eligibility: true,
  },
  {
    slNo: 2,
    ulbId: '66a000000000000000000002',
    censusCode: null,
    sbCode: 'SB-0142',
    ulbName: 'Sample Municipal Council',
    allocationAmount: 8,
    unspentAmount: 1.2,
    allocationPerc: 15,
    eligibility: false,
  },
];

function questionsForYesBranch(): FcUnspentDeclarationData['questions'] {
  return [
    { ...FC_UNSPENT_DECLARATION_FIELDS[0], value: 'yes' },
    { ...FC_UNSPENT_DECLARATION_FIELDS[1], value: null },
    { ...FC_UNSPENT_DECLARATION_FIELDS[2], value: true },
  ];
}

function questionsForNoBranch(fcDeclarationValue: unknown): FcUnspentDeclarationData['questions'] {
  return [
    { ...FC_UNSPENT_DECLARATION_FIELDS[0], value: 'no' },
    { ...FC_UNSPENT_DECLARATION_FIELDS[1], value: fcDeclarationValue },
    { ...FC_UNSPENT_DECLARATION_FIELDS[2], value: false },
  ];
}

/** Devolution is UNDER_REVIEW_BY_MOHUA — the normal, fully-editable-and-submittable case. */
export const FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: true },
  dependency: {
    devolutionStatus: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: false,
    blockingMessage: null,
  },
  actors: [],
  questions: questionsForYesBranch(),
  unspentUlbData: CLONE_UNSPENT_ULB_ROWS,
};

/** Devolution was RETURNED_BY_MOHUA — FC Unspent reopens for editing/draft-saving, but final submit stays blocked. */
export const FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: false },
  dependency: {
    devolutionStatus: FORM_STATUS.RETURNED_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: true,
    blockingMessage:
      'Devolution Formula was returned by MoHUA for correction. FC Unspent can be edited and saved as a draft, but final submission is blocked until Devolution is resubmitted and accepted.',
  },
  actors: [],
  questions: questionsForYesBranch(),
  unspentUlbData: CLONE_UNSPENT_ULB_ROWS,
};

/**
 * No active Installment-1 Devolution allocation dataset exists yet. Row-level unspent-amount entry
 * is meaningless without an allocation to check it against, so this scenario locks the whole form
 * (canEdit/canSaveDraft/canFinalSubmit all false) rather than allowing edits with no valid ULB
 * allocation-dependent row actions available — see FC_UNSPENT_UI_API_CONTRACT.md, "CONTRACT
 * DECISION REQUIRED" for why this interpretation was chosen over a separate row-action-only flag.
 */
export const FC_UNSPENT_SCENARIO_MISSING_DEVOLUTION_DATASET: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.NOT_STARTED,
  permissions: { canView: true, canEdit: false, canSaveDraft: false, canFinalSubmit: false },
  dependency: {
    devolutionStatus: null,
    devolutionDatasetExists: false,
    editableDueToDevolutionReturn: false,
    blockingMessage:
      'An active Installment 1 Devolution allocation dataset is required before FC Unspent can be edited or submitted.',
  },
  actors: [],
  questions: questionsForYesBranch(),
  unspentUlbData: [],
};

/** FC Unspent has already been finally submitted — read-only for the State. */
export const FC_UNSPENT_SCENARIO_READONLY_SUBMITTED: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
  permissions: { canView: true, canEdit: false, canSaveDraft: false, canFinalSubmit: false },
  dependency: {
    devolutionStatus: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: false,
    blockingMessage: null,
  },
  actors: [],
  questions: questionsForYesBranch(),
  unspentUlbData: CLONE_UNSPENT_ULB_ROWS,
};

/** Yes branch with saved rows — same shape as the default mock, named explicitly for gating tests. */
export const FC_UNSPENT_SCENARIO_YES_BRANCH_WITH_ROWS: FcUnspentDeclarationData =
  FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW;

/** No branch with a saved declaration file — no ULB rows. */
export const FC_UNSPENT_SCENARIO_NO_BRANCH_SAVED: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: true },
  dependency: {
    devolutionStatus: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: false,
    blockingMessage: null,
  },
  actors: [],
  questions: questionsForNoBranch({
    originalName: 'fc-unspent-declaration-signed.pdf',
    path: 'fc-unspent/fc-declaration/sample-state/fc-unspent-declaration-signed.pdf',
    mimeType: 'application/pdf',
    sizeKb: 245,
    pageCount: 2,
  }),
  unspentUlbData: [],
};
