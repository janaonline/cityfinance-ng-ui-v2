import type { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

/** An OM is issued per installment; only the first is supported so far (as for claim letters). */
export const OM_INSTALLMENT = 1;

export type OmStatus = 'DRAFT' | 'GENERATED' | 'SIGNED_UPLOADED';

/** One run of OM text; `field` marks where an editable box sits (omNumber, omDate). */
export interface OmRun {
  text: string;
  bold?: boolean;
  placeholder?: boolean;
  field?: string;
  lead?: string;
}

export interface OmParagraph {
  runs: OmRun[];
  number?: string;
}

export interface OmComplianceRow {
  key: string;
  condition: OmParagraph[];
  status: OmParagraph[];
}

/** The OM, section by section, exactly as the PDF prints it. */
export interface OmContent {
  claimLetterId: string;
  claimLetterRefNo: string;
  stateName: string;
  designYearLabel: string;
  installment: number;
  ulbCount: number;
  stateUlbTotal: number;
  totalAmount: number;
  yearAllocation: number | null;
  number: OmParagraph;
  letterhead: OmParagraph[];
  address: OmParagraph[];
  title: string;
  subject: OmParagraph;
  intro: OmParagraph;
  complianceHeaders: string[];
  compliance: OmComplianceRow[];
  analysis: OmParagraph;
  recommendationHeaders: string[];
  recommendation: OmParagraph[];
  closing: OmParagraph[];
  enclosure: OmParagraph;
  signature: OmParagraph[];
  addressee: OmParagraph[];
}

export interface OmEditorValues {
  omNumber: string | null;
  omDate: string | null;
}

export interface OmEditorView {
  omId: string | null;
  status: OmStatus;
  refNo: string | null;
  fields: ConditionalFieldConfig[];
  values: OmEditorValues;
  content: OmContent;
  counts: { noActionRecorded: number; excluded: number; included: number };
  /** Every ULB on the letter (all go into the OM), A-Z. Whole rupees. */
  ulbs: OmUlbRow[];
}

export interface OmUlbRow {
  ulbId: string;
  name: string;
  censusCode: string | null;
  allocatedAmount: number;
  claimedAmount: number;
}

export interface OmClaimLetterRow {
  claimLetterId: string;
  claimLetterRefNo: string;
  batchNumber: number;
  ulbCount: number;
  amount: number;
  omId: string | null;
  omStatus: OmStatus | null;
  omRefNo: string | null;
}

export interface OmStateRow {
  stateId: string;
  stateName: string;
  claimLetters: OmClaimLetterRow[];
}

export interface OmStates {
  year: { id: string; label: string };
  installment: number;
  states: OmStateRow[];
}

export interface OmSignedFile {
  name: string;
  url: string;
  sizeKb: number;
}

export interface OmHistoryRow {
  omId: string;
  refNo: string;
  omNumber: string | null;
  claimLetterId: string;
  claimLetterRefNo: string;
  stateId: string;
  stateName: string;
  stateCode: string;
  ulbCount: number;
  totalAmount: number;
  issuedOn: string | null;
  status: OmStatus;
  doeStatus: 'PENDING';
  signedFile: OmSignedFile | null;
}

/** Signed OM upload: PDF only, up to 5 MB (the API enforces the same). */
export const OM_SIGNED_FILE_MAX_MB = 5;

export const OM_STATUS_LABEL: Record<OmStatus, string> = {
  DRAFT: 'Draft',
  GENERATED: 'Issued',
  SIGNED_UPLOADED: 'Signed',
};

export function isIssued(status: OmStatus | null): boolean {
  return status === 'GENERATED' || status === 'SIGNED_UPLOADED';
}
