import type { UploadPageConfig } from '../../ulb-module/ulb-forms/upload-documents/upload-documents.component';
import type { SlbFormData } from '../../ulb-module/ulb-forms/slb/slb.models';

// Shapes of the existing per-ULB form GETs, narrowed to what the read-only MoHUA page uses.

export type ProcessingStatus = 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED';

export interface DecisionEntry {
  status: 'APPROVED' | 'RETURNED';
  note: string | null;
  decidedAt: string;
  decidedBy?: { name: string | null } | null;
}

/** GET annual-account/by-ulb/:ulbId/:yearId?section=... — one section per call. */
export interface AnnualDocument {
  docId: string;
  processingStatus: ProcessingStatus;
  currentUpload: {
    file: { originalName: string; sizeKb: number; fileUrl: string | null };
    uploadedAt: string;
    ocrInfo?: { validationStatus?: string | null; failedChecks?: string[] } | null;
  } | null;
}

export interface AnnualSection {
  form_status: string;
  form_status_id: number;
  stateDecision: DecisionEntry | null;
  mohuaDecision: DecisionEntry | null;
  documents: AnnualDocument[];
}

export interface AnnualSectionResponse {
  annualAccountId: string | null;
  ulbName: string | null;
  ulbCode: string | null;
  data: AnnualSection | null;
}

/** GET bank-account?ulbId=&yearId= */
export interface BankAccountRecord {
  ifscCode: string;
  bankDetails: { name: string; branch: string; address?: string; city: string; state?: string };
  accountNumberMasked: string;
  proofFile: { originalName: string; fileUrl: string | null };
  currentFormStatus: number;
  currentFormStatusLabel: string;
  stateDecision: DecisionEntry | null;
  mohuaDecision: DecisionEntry | null;
  /** Set when the record belongs to another year (the account is submitted once and reused every year). */
  designYearLabel?: string | null;
}

/** GET dur/by-ulb/:ulbId/:yearId */
export interface DurRecord {
  currentFormStatus: number;
  currentFormStatusLabel: string;
  stateDecision: DecisionEntry | null;
  mohuaDecision: DecisionEntry | null;
  documents: Array<{
    docId: string;
    label: string;
    processingStatus: ProcessingStatus;
    currentUpload: {
      file: { originalName: string; sizeKb: number; fileUrl?: string | null };
      uploadedAt: string;
      ocrInfo?: { validationStatus?: string | null; failedChecks?: string[] } | null;
    } | null;
  }>;
}

/** GET mohua/ulb/:ulbId/:yearId/forms — the API decides the status text and whether each form is submitted. */
export interface UlbFormStatus {
  statusCode: number | null;
  statusLabel: string;
  submitted: boolean;
}

export interface UlbFormStatuses {
  forms: {
    audited: UlbFormStatus;
    unaudited: UlbFormStatus;
    pfms: UlbFormStatus;
    slb: UlbFormStatus;
    dur: UlbFormStatus;
  };
}

/** One form's load result: the data (null when the ULB has none) and whether the call failed. */
export interface FormLoad<T> {
  data: T | null;
  failed: boolean;
}

export interface UlbFormsData {
  audited: FormLoad<AnnualSectionResponse>;
  unaudited: FormLoad<AnnualSectionResponse>;
  auditedConfig: FormLoad<UploadPageConfig>;
  provisionalConfig: FormLoad<UploadPageConfig>;
  bank: FormLoad<BankAccountRecord>;
  slb: FormLoad<SlbFormData>;
  dur: FormLoad<DurRecord>;
  statuses: FormLoad<UlbFormStatuses>;
}
