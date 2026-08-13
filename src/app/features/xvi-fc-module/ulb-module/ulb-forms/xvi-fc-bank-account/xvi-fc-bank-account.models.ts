export interface XviFcBankDetails {
  name: string;
  branch: string;
  address: string;
  city: string;
  state?: string;
  micr: string | null;
}

export type XviFcBankAccountProofMimeType = 'application/pdf' | 'image/jpeg' | 'image/png';

export interface XviFcBankAccountProofFile {
  originalName: string;
  mimeType: XviFcBankAccountProofMimeType;
  pages: number | null;
  sizeKb: number;
  s3Key: string;
  sha256: string;
}

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

export interface SubmitXviFcBankAccountPayload {
  ulbId?: string;
  stateId: string;
  designYearId: string;
  ifscCode: string;
  accountNumber: string;
  confirmAccountNumber: string;
  bankDetails: XviFcBankDetails;
  proofFile: XviFcBankAccountProofFile;
}

export interface XviFcBankAccountDecision {
  status: 'APPROVED' | 'RETURNED';
  note: string | null;
  decidedAt: string;
}

export interface XviFcBankAccountResponse {
  _id?: string;
  ulb?: string;
  designYear?: string;
  ifscCode: string;
  bankDetails: XviFcBankDetails;
  accountNumberMasked?: string;
  accountNumberLast4?: string;
  proofFile: XviFcBankAccountProofFile;
  currentFormStatus: FormStatusType;
  currentFormStatusLabel: string;
  stateDecision?: XviFcBankAccountDecision | null;
  mohuaDecision?: XviFcBankAccountDecision | null;
  submittedBy?: string | null;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface XviFcIfscLookupResponse {
  ifscCode: string;
  bankDetails: XviFcBankDetails;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

