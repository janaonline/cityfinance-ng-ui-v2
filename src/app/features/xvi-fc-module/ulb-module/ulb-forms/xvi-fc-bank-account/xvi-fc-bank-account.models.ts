export interface XviFcBankDetails {
  name: string;
  branch: string;
  address: string;
  city: string;
  state?: string;
  micr: string | null;
}

export interface XviFcBankAccountProof {
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string;
}

export type FormStatusType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const FORM_STATUS = {
  NO_STATUS: 0,
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  UNDER_REVIEW_BY_STATE: 3,
  RETURNED_BY_STATE: 4,
  UNDER_REVIEW_BY_MOHUA: 5,
  RETURNED_BY_MOHUA: 6,
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 7,
} as const satisfies Record<string, FormStatusType>;

export interface SubmitXviFcBankAccountPayload {
  ulbId?: string;
  designYearId: string;
  ifscCode: string;
  accountNumber: string;
  confirmAccountNumber: string;
  bankDetails: XviFcBankDetails;
  proof: XviFcBankAccountProof;
}

export interface XviFcBankAccountResponse {
  _id?: string;
  ulb?: string;
  designYear?: string;
  ifscCode: string;
  bankDetails: XviFcBankDetails;
  accountNumberMasked?: string;
  accountNumberLast4?: string;
  proof: XviFcBankAccountProof;
  currentFormStatus: FormStatusType;
  currentFormStatusLabel: string;
  submittedBy?: string | null;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface XviFcIfscLookupResponse {
  ifscCode: string;
  bankDetails: XviFcBankDetails;
}

export interface BankAccountProofSignedUrlPayload {
  ulbId?: string;
  designYearId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface S3UrlResult {
  url: string;
  fileUrl: string;
  fileAlias?: string;
  path?: string;
  fileSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

